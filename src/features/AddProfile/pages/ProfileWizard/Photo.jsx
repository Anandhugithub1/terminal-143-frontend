import React, { useRef, useState, useMemo } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import PhotoGrid from "../../components/PhotoGrid";
import { Button } from "../../../../shared/Button";
import { useTranslation } from "react-i18next";

const SINGLE_PHOTO_GENDERS = ["M", "TM", "OT"];
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Photo = () => {
  const { t } = useTranslation("common");
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);
  const maxSlots = isSinglePhoto ? 1 : 3;

  const photos = useMemo(() => {
    if (isSinglePhoto) return [formData.profilePhoto || null];

    const arr = [...(formData.profilePhotos || [])];
    while (arr.length < maxSlots) arr.push(null);
    return arr;
  }, [formData, isSinglePhoto, maxSlots]);

  const hasAnyPhoto = photos.some(Boolean);

  const handleSlotChange = (index) => {
    if (uploading) return;
    setError("");
    inputRef.current.dataset.index = index;
    inputRef.current.click();
  };

  const handleSlotRemove = (index) => {
    if (isSinglePhoto) {
      setFormData(p => ({ ...p, profilePhoto: null }));
    } else {
      const next = [...photos];
      next[index] = null;
      setFormData(p => ({ ...p, profilePhotos: next }));
    }
  };

  const isAcceptedType = (file) =>
    ACCEPTED_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name || "");

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
    setUploading(true);

    const clonedFile = new File([file], file.name, {
      type: file.type,
      lastModified: file.lastModified
    });

    if (isSinglePhoto) {
      setFormData(p => ({ ...p, profilePhoto: clonedFile }));
    } else {
      setFormData(p => {
        const next = [...photos];
        next[index] = clonedFile;
        return { ...p, profilePhotos: next };
      });
    }

    setUploading(false);
  };

  const handleNext = () => {
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
        photos={photos}
        maxSlots={maxSlots}
        onSlotChange={handleSlotChange}
        onSlotRemove={handleSlotRemove}
        uploading={uploading}
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
