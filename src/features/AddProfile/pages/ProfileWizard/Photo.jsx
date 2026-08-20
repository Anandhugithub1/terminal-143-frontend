import React, { useRef, useState, useMemo } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import PhotoGrid from "../../components/PhotoGrid";
import { Button } from "../../../../shared/Button";
import { useTranslation } from "react-i18next";
import { getPresignedUrl } from "../../../UserProfile/api/profile";
import { ensureNormalizedImage } from "../../../../utils/imageConversion";
import { uploadToS3 } from "../../../../shared/utils/uploadToS3";
import { getErrorMessage } from "../../../../shared/api/getErrorMessage";

const SINGLE_PHOTO_GENDERS = ["M", "TM", "OT"];
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// A slot's upload never blocks profile completion (see Tags.jsx) — it just
// needs to report its own status so the grid can show a spinner/retry
// independently per-photo instead of one global "uploading" flag.
const photoErrorMessage = (cause) =>
  cause?.response ? getErrorMessage(cause, "photoUploadFailed") : cause?.message || "Photo upload failed";

const uploadSlotFile = async (file) => {
  let uploadFile;
  try {
    uploadFile = await ensureNormalizedImage(file);
  } catch (conversionErr) {
    // Some Android WebView + device combinations fail to canvas-decode an
    // otherwise-valid photo — the picked file itself is fine, only the WebP
    // re-encode step isn't working on this device. Uploading the original
    // bytes as-is is better than failing the slot entirely.
    if (file.size > 0 && file.type?.startsWith("image")) {
      uploadFile = file;
    } else {
      throw conversionErr;
    }
  }

  const { presignedUrl, publicUrl } = await getPresignedUrl({ fileType: uploadFile.type });
  await uploadToS3(presignedUrl, uploadFile);
  return publicUrl;
};

const Photo = () => {
  const { t } = useTranslation("common");
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);
  const maxSlots = isSinglePhoto ? 1 : 3;

  const slots = useMemo(() => {
    if (isSinglePhoto) return [formData.profilePhoto || null];

    const arr = [...(formData.profilePhotos || [])];
    while (arr.length < maxSlots) arr.push(null);
    return arr;
  }, [formData, isSinglePhoto, maxSlots]);

  const hasAnyPhoto = slots.some(Boolean);

  const writeSlot = (index, value) => {
    if (isSinglePhoto) {
      setFormData((p) => ({ ...p, profilePhoto: value }));
    } else {
      setFormData((p) => {
        const next = [...(p.profilePhotos || [])];
        while (next.length < maxSlots) next.push(null);
        next[index] = value;
        return { ...p, profilePhotos: next };
      });
    }
  };

  const handleSlotChange = (index) => {
    const current = slots[index];
    if (current?.status === "uploading") return;

    // Retrying an errored slot re-sends the same file rather than reopening
    // the picker — the file the user already chose is still good, only the
    // upload attempt failed.
    if (current?.status === "error" && current.file) {
      runUpload(index, current.file);
      return;
    }

    setError("");
    inputRef.current.dataset.index = index;
    inputRef.current.click();
  };

  const handleSlotRemove = (index) => {
    writeSlot(index, null);
  };

  const isAcceptedType = (file) =>
    ACCEPTED_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name || "");

  const runUpload = async (index, file) => {
    writeSlot(index, { file, status: "uploading" });
    try {
      const url = await uploadSlotFile(file);
      writeSlot(index, { file, url, status: "done" });
    } catch (err) {
      writeSlot(index, { file, status: "error", error: photoErrorMessage(err) });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    const index = Number(e.target.dataset.index) || 0;
    e.target.value = "";

    if (!file) return;

    if (!isAcceptedType(file)) {
      setError(t("wizard.photo.invalidType"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("wizard.photo.tooLarge"));
      return;
    }

    setError("");
    runUpload(index, file);
  };

  const handleNext = () => {
    // Not required to proceed — a photo that's still uploading, failed, or
    // was never added doesn't block onboarding (see Tags.jsx); this is just
    // a friendly nudge for the common "forgot a photo" case.
    if (!hasAnyPhoto) {
      setError(t("wizard.photo.required"));
      return;
    }
    setError("");
    navigate("/complete/tags");
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={5} />

      <PhotoGrid
        photos={slots}
        maxSlots={maxSlots}
        onSlotChange={handleSlotChange}
        onSlotRemove={handleSlotRemove}
      />

      <input
  ref={inputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handlePhotoUpload}
/>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => navigate("/complete/bio")}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white
    transition-all duration-150
    hover:bg-gray-50
    active:scale-95"
        >
          {t("wizard.back")}
        </Button>

        <Button
          onClick={handleNext}
          className="flex-1 py-3 transition-all hover:bg-pink-600 active:scale-95"
        >
          {t("wizard.next")}
        </Button>
      </div>
    </div>
  );
};

export default Photo;
