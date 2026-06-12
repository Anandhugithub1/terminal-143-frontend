// Limits and accepted formats for post media uploads.
export const MAX_MEDIA_ITEMS = 5;
export const MAX_VIDEO_DURATION_SEC = 60;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Images are normalized to this format before upload (via canvas) so every
// device/browser produces a consistently-decodable file in the feed.
export const NORMALIZED_IMAGE_TYPE = "image/webp";
export const NORMALIZED_IMAGE_EXT = "webp";
export const IMAGE_CONVERT_QUALITY = 0.85;
