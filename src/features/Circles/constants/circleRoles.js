// Mirrors circle-service's constants/roles.js exactly — 'admin' is a
// legacy role predating 'moderator', kept functionally equivalent to it on
// the backend (every requireCircleRole check there accepts admin alongside
// owner/moderator), so the frontend's own "can this viewer moderate" check
// has to recognize it too or an admin-role member would see a member-level
// UI despite the backend granting them full moderator power.
export const MODERATOR_ROLES = ["owner", "moderator", "admin"];

// Mirrors circle-service's constants/systemUsers.js CIRCLE_ADMIN_BOT_ID — a
// sentinel userId with no real profile, so chat-service's profile lookup
// returns { name: null, avatarUrl: null } for it. Without this, a bot-owned
// circle (leaveCircle.js's fallback when an owner leaves with no
// moderator/admin to promote) would show the raw internal id as the
// member's display name instead of something a human reads as intentional.
export const CIRCLE_ADMIN_BOT_ID = "CIRCLE_ADMIN_BOT";

export function isCircleAdminBot(userId) {
  return userId === CIRCLE_ADMIN_BOT_ID;
}
