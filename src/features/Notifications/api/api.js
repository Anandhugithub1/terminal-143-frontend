export async function listNotifications({ limit = 10, lastKey }) {
  const params = new URLSearchParams({
    limit
  })

  if (lastKey) {
    params.set("lastKey", lastKey)
  }

  const res = await fetch(
    `https://userapi.terminal143.com/notifications/list?${params.toString()}`,
    {
      credentials: "include"
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch notifications")
  }

  return res.json()
}
