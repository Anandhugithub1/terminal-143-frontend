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
      message: "👋 Welcome to PassorMatch! You’re all set to start connecting.",
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
    message: "👋 Welcome to PassorMatch! You’re all set to start connecting.",
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

    case "MATCH_REQUEST":
      message = `${n.fromUsername} sent you a match request`
      break

    case "REQUEST_ACCEPTED":
      message = `${n.fromUsername} accepted your request`
      break

    case "MESSAGE":
    case "CHAT_MESSAGE":
      message = `New message from ${n.fromUsername}`
      break

    case "SUPPORT_REPLY":
      message = "Support sent you a reply"
      break

    case "REPORT_RESOLVED":
      message = n.payload?.message || "Your report has been reviewed and the case is now resolved."
      break

    case "CONTENT_HIDDEN":
      message = n.payload?.message || "Some of your content was hidden pending moderator review."
      break

    case "CRISIS_RESOURCES":
      message = n.payload?.message || "Support resources are available if you need them."
      break

    default:
      message = n.payload?.message || message
  }

  return {
    ...n,
    message
  }
}

// Where tapping a notification should take the user, so they can see exactly
// what got hidden/resolved rather than just reading a generic message. Only
// CONTENT_HIDDEN carries enough identity to deep-link today; other types
// return null (no-op tap) until they need the same treatment.
export function getNotificationLink(n) {
  if (n.type !== "CONTENT_HIDDEN") return null

  const { sourceType, sourceId, circleId, postId } = n.payload || {}

  switch (sourceType) {
    case "POST":
    case "COMMENT":
      return circleId && postId ? `/circles/${circleId}/posts/${postId}` : null
    case "CIRCLE_COVER":
      return sourceId ? `/circles/${sourceId}` : null
    case "USER_PHOTO":
      return "/profile"
    default:
      return null
  }
}