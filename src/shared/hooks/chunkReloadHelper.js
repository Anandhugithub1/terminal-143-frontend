export function setupChunkReload() {
  function shouldReload(message) {
    return (
      typeof message === "string" &&
      message.includes("Failed to fetch dynamically imported module")
    )
  }

  window.addEventListener("error", event => {
    if (shouldReload(event?.message)) {
      window.location.reload()
    }
  })

  window.addEventListener("unhandledrejection", event => {
    if (shouldReload(event?.reason?.message)) {
      window.location.reload()
    }
  })
}
