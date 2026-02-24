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
  console.log("=== subscribeToPush called ===")

  if (!("serviceWorker" in navigator)) {
    console.log("No serviceWorker support")
    return
  }

  if (!("PushManager" in window)) {
    console.log("No PushManager support")
    return
  }

  console.log("Permission state:", Notification.permission)

  if (Notification.permission === "denied") {
    console.log("Permission denied")
    throw new Error("permission-denied")
  }

  if (Notification.permission === "default") {
    console.log("Requesting permission...")
    const permission = await Notification.requestPermission()
    console.log("Permission result:", permission)

    if (permission !== "granted") {
      throw new Error("permission-not-granted")
    }
  }

  const registration = await navigator.serviceWorker.ready
  console.log("Service worker ready")

  const existing = await registration.pushManager.getSubscription()

  if (existing) {
    console.log("Existing subscription found:", existing.endpoint)
    return
  }

  console.log("No subscription found. Creating new one...")

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY
    )
  })

  console.log("New subscription created:", subscription.endpoint)

  console.log("Calling backend save-subscription...")

  await axios.post(
    "https://api.passormatch.com/notifications/save-subscription",
    subscription,
    { withCredentials: true }
  )

  console.log("Backend call completed")
}