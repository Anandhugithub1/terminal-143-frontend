// Images are normalized to this format before upload (via canvas) so every
// device/browser produces a consistently-decodable file.
export const NORMALIZED_IMAGE_TYPE = "image/webp";
export const NORMALIZED_IMAGE_EXT = "webp";
export const IMAGE_CONVERT_QUALITY = 0.85;

// Camera photos (12-48MP) re-encode to several MB even after a format
// conversion, since format alone doesn't reduce pixel count — that's what
// was pushing uploads past uploadToS3's timeout on slower connections. A
// profile photo is never displayed larger than a modal-sized image, so
// downscaling the long edge to this before encoding costs no visible
// quality but cuts typical file size by 5-10x.
export const MAX_IMAGE_DIMENSION = 1600;

// <img>/canvas can't decode HEIC/HEIF outside Safari, so those files never
// reach convertImageToWebp's img.onload — they'd previously fail decode and
// fall through to being "converted" as their original (rejected) type. iOS
// camera photos are HEIC by default, so this is the common mobile upload
// path, not an edge case. file.type is sometimes blank for HEIC on iOS, so
// also check the extension.
const HEIC_TYPES = ["image/heic", "image/heif"];
const isHeicFile = (file) =>
  HEIC_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name || "");

// Lazy-loaded: only fetched when a HEIC file is actually selected, so users
// who never hit this path don't pay for the (large, WASM-based) decoder.
const convertHeicToJpeg = async (file) => {
  const heic2any = (await import("heic2any")).default;

  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: IMAGE_CONVERT_QUALITY,
  });

  // heic2any can return an array of blobs for multi-image HEIC containers
  // (e.g. Live Photos) — only the first frame is relevant for a profile photo.
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";

  return new File([blob], newName, { type: "image/jpeg" });
};

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
// with a consistent, widely-decodable format. HEIC/HEIF is routed through
// convertHeicToJpeg before reaching here (see ensureNormalizedImage) since
// <img> can't decode it outside Safari; any other format the browser can't
// decode still fails at img.onerror.
export const convertImageToWebp = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const ctx = canvas.getContext("2d");
      // Fill white first: source formats with transparency (PNG/HEIC) would
      // otherwise turn black when encoded to JPEG, which has no alpha channel.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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

// Converts an image file to the normalized format. Throws if the file can't
// be turned into something the backend accepts — callers already show an
// error toast on a thrown upload, so silently uploading a doomed file (the
// old behavior) just traded a clear error for a confusing one downstream.
export const ensureNormalizedImage = async (file) => {
  // On Android WebView a File handed back from the native picker (or
  // restored from IndexedDB after the app was backgrounded) can carry
  // correct metadata but 0 readable bytes if its backing content:// URI
  // wasn't fully materialized — that fails opaquely much later, deep inside
  // canvas decode ("Could not decode image"). Catching it here instead gives
  // a message that actually points at the real problem.
  if (file.size === 0) {
    throw new Error("Image file is empty — please try selecting the photo again");
  }

  // Already the right format doesn't mean already small — some phones shoot
  // WebP natively at full camera resolution, so this still needs the resize
  // pass rather than passing the original bytes straight through.
  if (file.type === NORMALIZED_IMAGE_TYPE) {
    return convertImageToWebp(file);
  }

  if (isHeicFile(file)) {
    const jpeg = await convertHeicToJpeg(file);
    return convertImageToWebp(jpeg);
  }

  if (!file.type.startsWith("image")) {
    throw new Error("Unsupported file type");
  }

  return convertImageToWebp(file);
};
