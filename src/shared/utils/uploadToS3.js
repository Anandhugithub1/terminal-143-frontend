// CapacitorHttp patches window.fetch to route requests through native HTTP,
// which is what lets the API calls bypass WKWebView's CORS. Uploads must not go
// that way: the native bridge marshals bodies as strings/JSON, so a Blob/File
// body is mangled or dropped (ionic-team/capacitor#6132, #6645), and the
// presigned URL signs an exact byte count — anything but the original bytes
// gets 403 SignatureDoesNotMatch. S3 needs no CORS bypass regardless.
//
// native-bridge.js (Capacitor's WebView-injected runtime, not a local file —
// see node_modules/@capacitor/android/capacitor/src/main/assets/native-bridge.js)
// patches BOTH window.fetch and window.XMLHttpRequest the same way, so a plain
// XHR would hit the identical body-mangling bug. It stashes the true pre-patch
// classes/functions before patching:
//   - win.CapacitorWebFetch            — original fetch
//   - win.CapacitorWebXMLHttpRequest.fullObject — original XMLHttpRequest class
// fullObject is a complete, unpatched XHR class (not a partial method stash),
// so `new win.CapacitorWebXMLHttpRequest.fullObject()` behaves exactly like
// the WebView's real XHR — real xhr.upload.onprogress ticks included, unlike
// the patched version (which only ever fires one synthetic progress event on
// completion — see native-bridge.js's `send` override).
//
// Resolved per call rather than at module load, since the bridge injects
// these before any app code runs but after this module is evaluated in some
// bundling orders.
function getUnpatchedXHRClass() {
  if (typeof window === 'undefined') return null
  const stash = window.CapacitorWebXMLHttpRequest
  return (stash && stash.fullObject) || window.XMLHttpRequest || null
}

const webFetch = (...args) => {
  const original = typeof window !== 'undefined' && window.CapacitorWebFetch
  return typeof original === 'function' ? original.apply(window, args) : fetch(...args)
}

const DEFAULT_TIMEOUT_MS = 30000
// A flat 30s timeout was cutting off large-but-legitimate uploads on slow
// mobile connections before they could finish, then retrying the same file
// at the same timeout — guaranteed to time out again for the same reason.
// Budgeting time by file size (assuming a conservative ~300kbps floor) gives
// bigger files proportionally more time while keeping small ones snappy.
const MIN_UPLOAD_KBPS = 300
const MS_PER_BYTE = 8000 / (MIN_UPLOAD_KBPS * 1000)
const MAX_TIMEOUT_MS = 120000
export function timeoutForFileSize(bytes) {
  return Math.min(MAX_TIMEOUT_MS, Math.max(DEFAULT_TIMEOUT_MS, Math.round(bytes * MS_PER_BYTE)))
}
const MAX_RETRIES = 2
// Exponential backoff with jitter: 500ms, 1000ms (+ up to 250ms jitter each),
// capped low since this blocks a human waiting to send a chat message — not
// worth the long backoffs a background job could tolerate.
const BASE_DELAY_MS = 500

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 4xx responses (bad request, signature mismatch, forbidden) mean the
// request itself is wrong and will fail identically on every retry — only
// network-level failures, timeouts, and 5xx (transient server-side issues)
// are worth retrying.
function isRetryableStatus(status) {
  return status === 0 || status >= 500
}

// Plain-fetch fallback used both when there's no XHR class at all and when
// the XHR path throws before it can send (see putOnce) — no progress
// reporting, but it never touches XMLHttpRequest at all so it can't hit the
// native-bridge bug below.
function putViaFetch(presignedUrl, file) {
  return webFetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
    .then((res) => {
      if (!res.ok) throw Object.assign(new Error(`Upload failed: ${res.status}`), { status: res.status })
    })
    .catch((err) => {
      throw Object.assign(err, { status: err.status ?? 0 })
    })
}

// Single attempt via the unpatched XHR — this is what gives us real upload
// progress (fetch has no request-body progress API at all) and a hard
// timeout (fetch's AbortController path is one more thing that could itself
// be patched/mangled the same way body handling is, so XHR's built-in
// `timeout`/`ontimeout` is the safer bet here).
function putOnce(presignedUrl, file, { onProgress, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const XHRClass = getUnpatchedXHRClass()

    if (!XHRClass) {
      // No window at all (shouldn't happen in this app) — fall back to fetch
      // with no progress reporting rather than throwing.
      putViaFetch(presignedUrl, file).then(resolve, reject)
      return
    }

    const xhr = new XHRClass()
    xhr.open('PUT', presignedUrl, true)
    // native-bridge.js patches XMLHttpRequest.prototype in place rather than
    // handing back a truly separate class — "fullObject" instances inherit
    // the patched setRequestHeader, whose _headers own-property is only ever
    // set up by the patched constructor function, not by `new fullObject()`.
    // That mismatch throws "Cannot set properties of undefined (setting
    // 'Content-Type')" on some Android builds — a bug in Capacitor's shim,
    // not something fixable here.
    //
    // getPresignedUrl is called with this file's type, so the backend likely
    // signs the URL against that exact Content-Type — sending the request
    // without it risks trading this error for a 403 SignatureDoesNotMatch
    // instead. That's still strictly better than failing every time: a
    // signature mismatch surfaces as a normal retryable-looking upload
    // failure via the existing status handling below, rather than crashing
    // the whole submit before any request is even sent.
    try {
      if (file.type) xhr.setRequestHeader('Content-Type', file.type)
    } catch {
      // continue without the header — see above
    }
    xhr.timeout = timeoutMs

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1)
        resolve()
      } else {
        reject(Object.assign(new Error(`Upload failed: ${xhr.status}`), { status: xhr.status }))
      }
    }
    xhr.onerror = () => reject(Object.assign(new Error('Upload network error'), { status: 0 }))
    xhr.ontimeout = () => reject(Object.assign(new Error('Upload timed out'), { status: 0 }))
    xhr.onabort = () => reject(Object.assign(new Error('Upload cancelled'), { status: 0, aborted: true }))

    xhr.send(file)
  })
}

// The presigned URL signs the exact byte count (see predesginedurl.js), so the
// file must be the same one whose size was sent to /predesignedurl — S3 answers
// 403 SignatureDoesNotMatch on any mismatch. The browser sets Content-Length
// from the body itself; it's a forbidden header we can't set by hand.
//
// onProgress(fraction: 0..1) is called as the upload progresses, if provided.
// Retries transient failures (network error, timeout, 5xx) up to MAX_RETRIES
// times with exponential backoff; a 4xx (bad request/signature mismatch)
// fails immediately since retrying an identical request can't fix it.
export async function uploadToS3(presignedUrl, file, { onProgress, timeoutMs = timeoutForFileSize(file.size) } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await putOnce(presignedUrl, file, { onProgress, timeoutMs })
      return
    } catch (err) {
      lastErr = err
      if (err.aborted || !isRetryableStatus(err.status) || attempt === MAX_RETRIES) {
        throw err
      }
      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 250
      await sleep(delay)
    }
  }
  throw lastErr
}
