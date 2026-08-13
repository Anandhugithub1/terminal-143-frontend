// Mirrors circle-service's constants/roles.js exactly — 'admin' is a
// legacy role predating 'moderator', kept functionally equivalent to it on
// the backend (every requireCircleRole check there accepts admin alongside
// owner/moderator), so the frontend's own "can this viewer moderate" check
// has to recognize it too or an admin-role member would see a member-level
// UI despite the backend granting them full moderator power.
export const MODERATOR_ROLES = ["owner", "moderator", "admin"];
