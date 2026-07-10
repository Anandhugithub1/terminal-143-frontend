// The `username` cookie is set (non-HttpOnly, on purpose) by auth-service's
// login handler specifically so the client can read the caller's own
// identity without decoding the idToken.
export function getCurrentUsername() {
  const match = document.cookie.match(/(?:^|; )username=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}
