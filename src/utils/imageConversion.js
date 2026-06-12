// Images are normalized to this format before upload (via canvas) so every
// device/browser produces a consistently-decodable file.
export const NORMALIZED_IMAGE_TYPE = "image/webp";
export const NORMALIZED_IMAGE_EXT = "webp";
export const IMAGE_CONVERT_QUALITY = 0.85;

// canvas.toBlob("image/webp") silently falls back to PNG on browsers that
// can't encode WebP (e.g. iOS Safari < 14). Detect that once up front so we
// can fall back to JPEG instead of mislabeling PNG bytes as WebP.
let webpEncodeSupport = null;
export const supportsWebpEncoding = () => {
  if (webpEncodeSupport === null) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpEncodeSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpEncodeSupport;
};

// Re-encodes an image file to NORMALIZED_IMAGE_TYPE (WebP), or JPEG on
// devices that can't encode WebP, via canvas so every browser/device ends up
// with a consistent, widely-decodable format. Formats the browser itself
// can't decode (e.g. HEIC on non-Safari) fail at img.onerror.
export const convertImageToWebp = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      // Fill white first: source formats with transparency (PNG/HEIC) would
      // otherwise turn black when encoded to JPEG, which has no alpha channel.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const useWebp = supportsWebpEncoding();
      const outputType = useWebp ? NORMALIZED_IMAGE_TYPE : "image/jpeg";
      const outputExt = useWebp ? NORMALIZED_IMAGE_EXT : "jpg";

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            reject(new Error("Image conversion failed"));
            return;
          }

          const newName = file.name.replace(/\.[^.]+$/, "") + `.${outputExt}`;
          resolve(new File([blob], newName, { type: outputType }));
        },
        outputType,
        IMAGE_CONVERT_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not decode image"));
    };

    img.src = objectUrl;
  });

// Converts an image file to the normalized format, returning the original
// file unchanged if it's already in that format or conversion fails.
export const ensureNormalizedImage = async (file) => {
  if (!file.type.startsWith("image") || file.type === NORMALIZED_IMAGE_TYPE) {
    return file;
  }

  try {
    return await convertImageToWebp(file);
  } catch {
    return file;
  }
};
