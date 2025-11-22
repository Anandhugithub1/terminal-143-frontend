// src/models/circleModel.js
/**
 * Normalize a raw circle record from the API into a UI-friendly object.
 */
export function normalizeCircle(raw = {}) {
  const {
    PK = "",
    SK = "",
    entityType = "CIRCLE",
    circleId = "",
    name = "",
    description = "",
    visibility = "public",
    tags = [],
    coverPhoto = "",
    ownerId = "",
    memberCount = 0,
    postCount = 0,
    createdAt = null,
    updatedAt = null
  } = raw || {};

  return {
    PK,
    SK,
    entityType,
    circleId: String(circleId),
    name: String(name),
    displayName: String(name).replace(/-/g, " "),
    description: String(description || ""),
    visibility: String(visibility || "public"),
    tags: Array.isArray(tags) ? tags.map(t => (typeof t === "string" ? t.trim().toLowerCase() : String(t))) : [],
    coverPhoto: coverPhoto || null,
    ownerId: String(ownerId),
    memberCount: Number(memberCount || 0),
    postCount: Number(postCount || 0),
    createdAt: createdAt || null,
    updatedAt: updatedAt || null
  };
}
