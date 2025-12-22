import React, { useRef, useState, useEffect, useMemo } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import PhotoGrid from "../../components/PhotoGrid";
import { set, get, del } from "idb-keyval";
import { Button } from "../../../../shared/Button";

const SINGLE_PHOTO_GENDERS = ["M","TM"];

const Photo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);

  const maxSlots = isSinglePhoto ? 1 : 3;

  const uploadedPhotos = useMemo(
    () =>
      isSinglePhoto
        ? [formData.profilePhoto]
        : formData.profilePhotos || [],
    [isSinglePhoto, formData]
  );

  /* ---------------- Load persisted photos ---------------- */
  useEffect(() => {
    const loadPhotos = async () => {
      if (isSinglePhoto) {
        const photo = await get("profilePhoto");
        if (photo) {
          setFormData((prev) => ({ ...prev, profilePhoto: photo }));
        }
      } else {
        const photos = await get("profilePhotos");
        if (Array.isArray(photos) && photos.length) {
          setFormData((prev) => ({ ...prev, profilePhotos: photos }));
        }
      }
    };

    loadPhotos();
  }, [isSinglePhoto, setFormData]);

  /* ---------------- Slot actions ---------------- */
  const handleSlotChange = (index) => {
    if (!inputRef.current || uploading) return;
    inputRef.current.dataset.replaceIndex = index;
    inputRef.current.click();
  };

  const handleSlotRemove = async (index) => {
    if (uploading) return;

    if (isSinglePhoto) {
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      await del("profilePhoto");
    } else {
      const next = [...(formData.profilePhotos || [])];
      next.splice(index, 1);
      setFormData((prev) => ({ ...prev, profilePhotos: next }));
      await set("profilePhotos", next);
    }
  };

  /* ---------------- Upload handler ---------------- */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    let slotIndex = Number(e.target.dataset.replaceIndex);
    if (Number.isNaN(slotIndex)) slotIndex = 0;

    if (isSinglePhoto) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      await set("profilePhoto", file);
    } else {
      const existing = [...(formData.profilePhotos || [])];
      while (existing.length < maxSlots) existing.push(null);
      existing[slotIndex] = file;

      setFormData((prev) => ({ ...prev, profilePhotos: existing }));
      await set("profilePhotos", existing);
    }

    e.target.value = null;
    delete e.target.dataset.replaceIndex;
    setUploading(false);
  };

  const handleNext = () => navigate("/complete/tags");
  const handleBack = () => navigate("/complete/bio");

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={5} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSinglePhoto ? "Upload Your Photo" : "Show Your Sparkle ✨"}
        </h2>
        <p className="text-gray-500">
          {isSinglePhoto
            ? "Upload your profile photo"
            : `Upload up to ${maxSlots} photos`}
        </p>
      </div>

      <PhotoGrid
        photos={uploadedPhotos}
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

      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleBack}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white"
          disabled={uploading}
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          className="flex-1 py-3 px-6"
          disabled={uploading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Photo;
