export async function shareLink({ title, text, url }) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Post link copied to clipboard");
    }
  } catch (err) {
    if (err?.name !== "AbortError") {
      console.error(err);
      alert("Failed to share post");
    }
  }
}
