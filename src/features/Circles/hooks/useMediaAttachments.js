import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  IMAGE_CONVERT_QUALITY,
  MAX_IMAGE_SIZE_MB,
  MAX_MEDIA_ITEMS,
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_SIZE_MB,
  NORMALIZED_IMAGE_EXT,
  NORMALIZED_IMAGE_TYPE,
} from "../constants/mediaConfig";

let nextId = 0;
const createId = () => `media-${Date.now()}-${nextId++}`;

const readVideoDuration = (url) =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(Math.round(video.duration));
    video.onerror = () => reject(new Error("Could not read video metadata"));
    video.src = url;
  });

// canvas.toBlob("image/webp") silently falls back to PNG on browsers that
// can't encode WebP (e.g. iOS Safari < 14). Detect that once up front so we
// can fall back to JPEG instead of mislabeling PNG bytes as WebP.
let webpEncodeSupport = null;
const supportsWebpEncoding = () => {
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
const convertImageToWebp = (file) =>
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

// Manages selection, validation and lifecycle of post media attachments
// (images + videos), keeping object URLs in sync with component lifetime.
export function useMediaAttachments() {
  const [media, setMedia] = useState([]);
  const mediaRef = useRef(media);
  mediaRef.current = media;

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const file of files) {
      if (mediaRef.current.length >= MAX_MEDIA_ITEMS) {
        toast.error(`You can attach up to ${MAX_MEDIA_ITEMS} files per post`);
        break;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`"${file.name}" isn't a supported image or video format`);
        continue;
      }

      const maxSizeMb = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than ${maxSizeMb}MB`);
        continue;
      }

      let outputFile = file;
      if (isImage && file.type !== NORMALIZED_IMAGE_TYPE) {
        try {
          outputFile = await convertImageToWebp(file);
        } catch {
          toast.error(`"${file.name}" couldn't be processed on this device`);
          continue;
        }
      }

      const url = URL.createObjectURL(outputFile);
      const type = isImage ? "image" : "video";
      const id = createId();

      const item = {
        id,
        url,
        type,
        file: outputFile,
        durationSec: 0,
        compressed: isImage,
        status: isVideo ? "validating" : "ready",
      };

      setMedia((prev) => [...prev, item]);

      if (isVideo) {
        try {
          const duration = await readVideoDuration(url);
          if (duration > MAX_VIDEO_DURATION_SEC) {
            toast.error(`"${file.name}" is longer than ${MAX_VIDEO_DURATION_SEC} seconds`);
            URL.revokeObjectURL(url);
            setMedia((prev) => prev.filter((m) => m.id !== id));
            continue;
          }
          setMedia((prev) =>
            prev.map((m) => (m.id === id ? { ...m, durationSec: duration, status: "ready" } : m))
          );
        } catch {
          toast.error(`Couldn't process "${file.name}"`);
          URL.revokeObjectURL(url);
          setMedia((prev) => prev.filter((m) => m.id !== id));
        }
      }
    }
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  const reset = () => {
    media.forEach((item) => URL.revokeObjectURL(item.url));
    setMedia([]);
  };

  const isValidating = media.some((item) => item.status === "validating");

  return { media, addFiles, removeMedia, reset, isValidating };
}
