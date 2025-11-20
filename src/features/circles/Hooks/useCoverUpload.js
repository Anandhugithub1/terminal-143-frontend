// hooks/useCoverUpload.js
import { useState, useEffect, useCallback } from "react";

/**
 * useCoverUpload
 *
 * Params:
 *  - getPresignedUrl: function(payload, { token }) => { presignedUrl, publicUrl }
 *  - getToken: optional function returning token string (if you want to send Authorization).
 *
 * Returns:
 *  - previewUrl: local object URL for preview (or null)
 *  - file: File object selected (or null)
 *  - uploading: boolean
 *  - error: string | null
 *  - handleSelect(file): validate + set selected file + preview
 *  - remove(): remove selection + cleanup
 *  - upload(circleName): uploads selected file (if any) and returns publicUrl (string) or null
 *  - reset(): clears state
 */
export function useCoverUpload({ getPresignedUrl, getToken } = {}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = useCallback((selectedFile) => {
    setError(null);
    setFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!selectedFile) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(selectedFile.type)) {
      setError("Invalid file type. Allowed: jpeg, png, webp");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setFile(selectedFile);
  }, [previewUrl]);

  const remove = useCallback(() => {
    setFile(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const reset = useCallback(() => {
    remove();
    setUploading(false);
    setError(null);
  }, [remove]);

  /**
   * Upload selected file using provided getPresignedUrl function.
   * Returns publicUrl string on success, or null if no file selected.
   */
  const upload = useCallback(async (circleName) => {
    if (!file) return null;
    if (!getPresignedUrl && typeof window === "undefined") {
      throw new Error("getPresignedUrl is required for upload in server environments");
    }
    if (!circleName || !circleName.trim()) {
      throw new Error("circleName required to upload cover");
    }

    setUploading(true);
    setError(null);

    try {
      const token = typeof getToken === "function" ? getToken() : null;
      const payload = {
        fileType: file.type,
        kind: "circleCover",
        circleName: circleName.trim()
      };

      // get presigned url (support both signatures: (payload) or (payload, { token }))
      const presResp = token ? await getPresignedUrl(payload, { token }) : await getPresignedUrl(payload);

      const { presignedUrl, publicUrl } = presResp || {};
      if (!presignedUrl || !publicUrl) throw new Error("Invalid presign response");

      // PUT file
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed with status ${putRes.status}`);
      }

      return publicUrl;
    } catch (err) {
      setError(err?.message || String(err) || "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  }, [file, getPresignedUrl, getToken]);

  return {
    previewUrl,
    file,
    uploading,
    error,
    handleSelect,
    remove,
    upload,
    reset
  };
}
