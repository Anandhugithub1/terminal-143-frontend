self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", () => {})
self.addEventListener("push", event => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { url: data.url }
    })
  )
})

self.addEventListener("notificationclick", event => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  )
})
