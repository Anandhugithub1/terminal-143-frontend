// The presigned URL signs the exact byte count (see predesginedurl.js), so the
// file must be the same one whose size was sent to /predesignedurl — S3 answers
// 403 SignatureDoesNotMatch on any mismatch. The browser sets Content-Length
// from the body itself; it's a forbidden header we can't set by hand.
export async function uploadToS3(presignedUrl, file) {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("S3 upload failed");
}
