import { Capacitor } from '@capacitor/core'
import { FileTransfer } from '@capacitor/file-transfer'
import { Filesystem, Directory } from '@capacitor/filesystem'

// Uploads used to go through window.fetch/XMLHttpRequest, patched by
// CapacitorHttp on native iOS/Android. That patching is fine for JSON API
// calls but actively breaks binary bodies: the native bridge marshals
// request bodies as strings/JSON, so a Blob/File body is mangled or dropped
// (ionic-team/capacitor#6132, #6645), and the presigned URL signs an exact
// byte count — anything but the original bytes gets 403 SignatureDoesNotMatch.
// Trying to dodge the patch by grabbing an "unpatched" XHR/fetch reference
// out of the bridge's own pre-patch stash doesn't work either: the bridge
// replaces window.XMLHttpRequest's prototype in place, and since a
// constructor's `.prototype` is a shared mutable object rather than a copy,
// even the stashed "original" class ends up running the same patched
// open/send/setRequestHeader methods.
//
// @capacitor/file-transfer is Capacitor's own answer to this — it talks to
// native URLSession/OkHttp upload APIs directly, bypassing the WebView
// fetch/XHR layer (and its patching) entirely. This is now the only upload
// path; see https://capacitorjs.com/docs/apis/file-transfer.
const isNative = Capacitor.isNativePlatform()

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

// FileTransferError (native) carries the HTTP status at error.data.httpStatus;
// a request that never reached the server (offline, DNS, timeout) has no
// httpStatus at all, which isRetryableStatus treats as 0/retryable.
function statusFromFileTransferError(err) {
  const status = err?.data?.httpStatus
  return typeof status === 'number' ? status : 0
}

// Filesystem.writeFile needs base64 data on native platforms (a raw Blob is
// only accepted on the web fallback below) — this is the standard
// FileReader-based conversion, stripping the "data:<type>;base64," prefix
// writeFile doesn't want.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result || ''
      const commaIndex = result.indexOf(',')
      resolve(commaIndex === -1 ? result : result.slice(commaIndex + 1))
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// FileTransfer.uploadFile resolves with the transport outcome, not the HTTP
// outcome — on iOS in particular it resolves successfully even when S3
// answers 403/404/500 (ionic-team/capacitor-file-transfer#58, still open).
// The plugin never rejects on a non-2xx response, so we have to check
// responseCode ourselves on every resolved result or a failed PUT looks
// identical to a successful one to every caller up the stack.
function assertUploadSucceeded(result) {
  const code = Number(result?.responseCode)
  if (Number.isFinite(code) && code >= 200 && code < 300) return
  throw Object.assign(new Error(`Upload failed with status ${result?.responseCode}`), {
    status: Number.isFinite(code) ? code : 0,
  })
}

// One S3 PUT attempt via @capacitor/file-transfer. On native platforms this
// means round-tripping the file through a temp disk file first (the plugin's
// `path` option, not `blob`, is what actually reaches native URLSession/
// OkHttp) — cleaned up in `finally` regardless of outcome so temp files never
// accumulate across retries or failures.
async function putOnce(presignedUrl, file, { timeoutMs }) {
  const commonOptions = {
    url: presignedUrl,
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    connectTimeout: timeoutMs,
    readTimeout: timeoutMs,
  }

  if (!isNative) {
    // blob is web-only per the plugin's own docs; native ignores it and
    // requires a filesystem `path` instead (handled below).
    let result
    try {
      result = await FileTransfer.uploadFile({ ...commonOptions, blob: file })
    } catch (err) {
      throw Object.assign(new Error(err?.message || 'Upload failed'), {
        status: statusFromFileTransferError(err),
      })
    }
    assertUploadSucceeded(result)
    return
  }

  const tempPath = `wizard-uploads/${crypto.randomUUID()}`
  const base64 = await fileToBase64(file)

  const { uri } = await Filesystem.writeFile({
    path: tempPath,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  })

  let result
  try {
    result = await FileTransfer.uploadFile({ ...commonOptions, path: uri })
  } catch (err) {
    throw Object.assign(new Error(err?.message || 'Upload failed'), {
      status: statusFromFileTransferError(err),
    })
  } finally {
    await Filesystem.deleteFile({ path: tempPath, directory: Directory.Cache }).catch(() => {
      // Best-effort cleanup — Directory.Cache can be reclaimed by the OS
      // anyway, so a failed delete here isn't worth surfacing to the caller.
    })
  }

  // Outside the try/catch above: a thrown assertion here is a real HTTP
  // status from S3 (e.g. 403 SignatureDoesNotMatch), not a FileTransferError,
  // so it must not be rewrapped through statusFromFileTransferError — that
  // reads err.data.httpStatus, which this error doesn't have, and would
  // silently default the status to 0 (retryable), causing pointless retries
  // of an unfixable signature/permission failure.
  assertUploadSucceeded(result)
}

// The presigned URL signs the exact byte count (see predesginedurl.js), so the
// file must be the same one whose size was sent to /predesignedurl — S3 answers
// 403 SignatureDoesNotMatch on any mismatch.
//
// A freshly-picked File on Android can wrap a content:// URI whose backing
// stream isn't reliably readable yet the instant it's handed to us — the
// first upload attempt fails with a raw transport-level error even though the
// exact same file object succeeds a few seconds later (e.g. after the user
// backs out and reselects, which does nothing but buy time). Retrying by
// re-sending the same File doesn't help because a content:// stream that
// failed a partial read isn't guaranteed re-readable from the start. Reading
// the whole file into memory once, up front, sidesteps this: once
// materialized, the bytes no longer depend on that stream at all, so every
// retry sends the exact same real, already-verified data.
async function materialize(file) {
  try {
    const buffer = await file.arrayBuffer()
    return new File([buffer], file.name, { type: file.type, lastModified: file.lastModified })
  } catch (err) {
    // Same retryable classification as a network-level failure — an unready
    // content:// stream is exactly the transient condition retrying (with
    // backoff) is meant to ride out.
    throw Object.assign(err instanceof Error ? err : new Error(String(err)), { status: 0 })
  }
}

// Retries transient failures (network error, timeout, 5xx) up to MAX_RETRIES
// times with exponential backoff; a 4xx (bad request/signature mismatch)
// fails immediately since retrying an identical request can't fix it.
//
// onProgress is accepted for API compatibility with callers but is currently
// a no-op: FileTransfer reports progress via a global addListener('progress')
// event (matched by url) rather than a per-call callback, which is a bigger
// wiring change than this migration needs right now.
export async function uploadToS3(presignedUrl, file, { onProgress, timeoutMs = timeoutForFileSize(file.size) } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Re-materialized every attempt, not just once up front: if the
      // backing stream genuinely isn't ready yet, doing this inside the loop
      // means a failure here also benefits from the same backoff delay
      // between attempts as a network-level failure would.
      const uploadFile = await materialize(file)
      await putOnce(presignedUrl, uploadFile, { timeoutMs })
      onProgress?.(1)
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
