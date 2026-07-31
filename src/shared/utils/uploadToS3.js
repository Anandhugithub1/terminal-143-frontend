// CapacitorHttp patches window.fetch to route through native HTTP, which is what
// lets the API calls bypass WKWebView's CORS. S3 uploads must not go that way:
// the presigned URL signs the exact byte count, and native re-encoding of a
// binary body yields 403 SignatureDoesNotMatch. S3 needs no CORS bypass anyway.
//
// Capacitor stashes the pre-patch original on window, so prefer that; it is the
// only reference guaranteed to be the WebView's own fetch regardless of whether
// this module happened to load before or after the patch was applied.
const webFetch = (...args) => {
  const original =
    typeof window !== 'undefined' &&
    (window.CapacitorWebFetch || window.CapacitorHttpFetch);
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
