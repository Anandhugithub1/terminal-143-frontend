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
      webFetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
        .then((res) => (res.ok ? resolve() : reject(Object.assign(new Error(`Upload failed: ${res.status}`), { status: res.status }))))
        .catch((err) => reject(Object.assign(err, { status: 0 })))
      return
    }

    const xhr = new XHRClass()
    xhr.open('PUT', presignedUrl, true)
    xhr.setRequestHeader('Content-Type', file.type)
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
export async function uploadToS3(presignedUrl, file, { onProgress, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
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
