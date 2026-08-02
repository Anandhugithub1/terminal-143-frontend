// CapacitorHttp patches window.fetch to route requests through native HTTP,
// which is what lets the API calls bypass WKWebView's CORS. Uploads must not go
// that way: the native bridge marshals bodies as strings/JSON, so a Blob/File
// body is mangled or dropped (ionic-team/capacitor#6132, #6645), and the
// presigned URL signs an exact byte count — anything but the original bytes
// gets 403 SignatureDoesNotMatch. S3 needs no CORS bypass regardless.
//
// native-bridge.ts stashes the pre-patch original as win.CapacitorWebFetch
// before assigning its own, so that reference is the WebView's real fetch
// whether or not the patch has been applied yet. Resolved per call rather than
// at module load, since the bridge injects it before any app code runs but
// after this module is evaluated in some bundling orders.
const webFetch = (...args) => {
  const original = typeof window !== 'undefined' && window.CapacitorWebFetch;
  return typeof original === 'function'
    ? original.apply(window, args)
    : fetch(...args);
};

// The presigned URL signs the exact byte count (see predesginedurl.js), so the
// file must be the same one whose size was sent to /predesignedurl — S3 answers
// 403 SignatureDoesNotMatch on any mismatch. The browser sets Content-Length
// from the body itself; it's a forbidden header we can't set by hand.
export async function uploadToS3(presignedUrl, file) {
  const res = await webFetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("S3 upload failed");
}
