import { isNativeClient, getStoredUsername } from '../auth/tokenStore'

// The `username` cookie is set (non-HttpOnly, on purpose) by auth-service's
// login handler specifically so the client can read the caller's own
// identity without decoding the idToken. Native builds can't rely on that
// cookie surviving, so they read the copy saved at login instead.
export function getCurrentUsername() {
  if (isNativeClient()) {
    const stored = getStoredUsername()
    if (stored) return stored
  }

  const match = document.cookie.match(/(?:^|; )username=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}
