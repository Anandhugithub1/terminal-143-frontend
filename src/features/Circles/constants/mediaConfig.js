// Limits and accepted formats for post media uploads.
// Video uploads are disabled for now — post media is image-only. (Existing
// posts that already contain videos still render; see PostMedia.)
export const MAX_MEDIA_ITEMS = 5;
export const MAX_IMAGE_SIZE_MB = 10;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Images are normalized to this format before upload (via canvas) so every
// device/browser produces a consistently-decodable file in the feed.
export const NORMALIZED_IMAGE_TYPE = "image/webp";
export const NORMALIZED_IMAGE_EXT = "webp";
export const IMAGE_CONVERT_QUALITY = 0.85;
