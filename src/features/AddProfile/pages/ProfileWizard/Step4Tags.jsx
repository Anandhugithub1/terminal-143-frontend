/* ========== Step4Tags.jsx ========== */
import React, { useState } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import { del } from "idb-keyval";

import { useDispatch, useSelector } from "react-redux";
import { uploadProfileImage, completeProfile } from "../../../UserProfile";
import {  resetProfileState } from "../../../UserProfile";
import { categories } from "../../utlis";

export default function Step4Tags() {
  const { formData, setFormData, clearFormData } = useWizard();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userType = localStorage.getItem("userType");

  const { completeStatus, error: apiError } = useSelector((s) => s.userProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggle = (category, value) => {
    const current = formData[category] || [];
    setFormData({
      ...formData,
      [category]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const selectedInterests = Object.entries(categories).flatMap(
    ([cat]) => formData[cat] || []
  );

  const handleBack = () => navigate("/complete/photo");

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const photoUrls = [];

    // 1️⃣ Get MP photos in slot order
    const photos = userType === "mp" ? [...(formData.profilePhotos || [])] : [];

    // 2️⃣ Upload photos in slot order
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      if (!file) continue; // skip empty slots
      try {
        const { publicUrl } = await dispatch(
          uploadProfileImage({
            file,
            photoIndex: i, // matches slot index
          })
        ).unwrap();
        photoUrls.push(publicUrl);
      } catch (err) {
        console.error(`Photo in slot ${i + 1} upload failed:`, err);
      }
    }

    // 3️⃣ For single photo users
    if (userType !== "mp" && formData.profilePhoto) {
      try {
        const { publicUrl } = await dispatch(
          uploadProfileImage({ file: formData.profilePhoto, photoIndex: 0 })
        ).unwrap();
        photoUrls.push(publicUrl);
      } catch (err) {
        console.error("Profile photo upload failed:", err);
      }
    }

    // 4️⃣ Build payload
    const payload = { ...formData, interests: selectedInterests };
    if (userType === "mp") payload.photos = photoUrls;
    else payload.photo = photoUrls[0] || "";

    // 5️⃣ Complete profile
    await dispatch(completeProfile(payload)).unwrap();
    dispatch(resetProfileState());

    // 6️⃣ Clear local form data
    clearFormData();
    await del("profilePhoto");
    await del("profilePhotos");

    // 7️⃣ Navigate to home
    navigate("/home", { state: { profileJustCompleted: true } });
  } catch (err) {
    console.error("Profile completion error:", err);
  } finally {
    setIsSubmitting(false);
  }
};




  const isLoading = isSubmitting || completeStatus === "loading";

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Touch!</h2>
        <p className="text-gray-500">
          Select your interests to find better matches
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {title}
            </h3>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={isLoading}
                  onClick={() => toggle(title, item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    formData[title]?.includes(item)
                      ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {apiError && <p className="mt-4 text-center text-red-500">{apiError}</p>}

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Finish Setup"}
        </button>
      </div>
    </div>
  );
}
