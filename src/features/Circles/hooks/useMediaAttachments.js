import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_MEDIA_ITEMS,
  NORMALIZED_IMAGE_TYPE,
} from "../constants/mediaConfig";
import { ensureNormalizedImage } from "../../../utils/imageConversion";

let nextId = 0;
const createId = () => `media-${Date.now()}-${nextId++}`;

// Manages selection, validation and lifecycle of post media attachments.
// Image-only for now — video uploads are disabled (see mediaConfig).
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

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" isn't a supported image format`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than ${MAX_IMAGE_SIZE_MB}MB`);
        continue;
      }

      let outputFile = file;
      if (file.type !== NORMALIZED_IMAGE_TYPE) {
        try {
          outputFile = await ensureNormalizedImage(file);
        } catch {
          toast.error(`"${file.name}" couldn't be processed on this device`);
          continue;
        }
      }

      const url = URL.createObjectURL(outputFile);
      setMedia((prev) => [
        ...prev,
        {
          id: createId(),
          url,
          type: "image",
          file: outputFile,
          durationSec: 0,
          compressed: true,
          status: "ready",
        },
      ]);
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

  // No async validation left (video duration checks removed), but keep the
  // flag in the return so callers that gate submit on it don't break.
  const isValidating = false;

  return { media, addFiles, removeMedia, reset, isValidating };
}
