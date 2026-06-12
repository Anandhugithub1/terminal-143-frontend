import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_MEDIA_ITEMS,
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_SIZE_MB,
  NORMALIZED_IMAGE_TYPE,
} from "../constants/mediaConfig";
import { convertImageToWebp } from "../../../utils/imageConversion";

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
