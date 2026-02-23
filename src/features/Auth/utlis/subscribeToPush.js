import axios from "axios"
const VAPID_PUBLIC_KEY="BED0WujBmOjlCKalCfPnKuYHRmVysHIWkRTDumenI0DxfTexeo_X-5E4G0lm3vV-Y63zX4oo2KYLsRyieX1Yd_o"
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) return
  if (!("PushManager" in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return

  const registration = await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  if (existing) return

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY
    )
  })

  await axios.post(
    "https://api.passormatch.com/notifications/save-subscription",
    subscription,
    { withCredentials: true }
  )
}
