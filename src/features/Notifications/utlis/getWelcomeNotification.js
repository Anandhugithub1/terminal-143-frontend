/* ---------------- constants ---------------- */

const WELCOME_KEY = "welcome_notification_created_at"
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

/* ---------------- helpers ---------------- */

export function getWelcomeNotification() {
  const now = Date.now()
  const stored = localStorage.getItem(WELCOME_KEY)

  if (!stored) {
    localStorage.setItem(WELCOME_KEY, String(now))
    return {
      SK: "welcome",
      type: "WELCOME",
      message: "👋 Welcome to Terminal 143! You’re all set to start connecting.",
      createdAt: now
    }
  }

  const createdAt = Number(stored)

  if (now - createdAt > ONE_WEEK_MS) {
    return null
  }

  return {
    SK: "welcome",
    type: "WELCOME",
    message: "👋 Welcome to Terminal 143! You’re all set to start connecting.",
    createdAt
  }
}

export function normalizeNotification(n) {
  if (n.message) return n

  let message = "You have a new notification"

  switch (n.type) {
    case "MATCH":
      message = `${n.fromUsername} matched with you`
      break

    case "REQUEST_ACCEPTED":
      message = `${n.fromUsername} accepted your request`
      break

    case "MESSAGE":
      message = `New message from ${n.fromUsername}`
      break

    case "REPORT_RESOLVED":
      message = n.payload?.message || "Your report has been reviewed and the case is now resolved."
      break

    default:
      message = n.payload?.message || message
  }

  return {
    ...n,
    message
  }
}