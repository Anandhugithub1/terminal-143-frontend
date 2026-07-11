export async function shareLink({
  title,
  text,
  url,
  copiedMessage = "Post link copied to clipboard",
  failedMessage = "Failed to share post",
}) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert(copiedMessage);
    }
  } catch (err) {
    if (err?.name !== "AbortError") {
      console.error(err);
      alert(failedMessage);
    }
  }
}
