export async function uploadToS3(presignedUrl, file) {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("S3 upload failed");
}
