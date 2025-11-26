/* ========== Step4Tags.jsx ========== */
import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import { del } from "idb-keyval";
import { Button } from "../../../../shared/Button";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfileImage, completeProfile, resetProfileState } from "../../../UserProfile";
import { categories } from "../../utlis";
import { toast } from "sonner";
import { normalizeGeoForApi } from '../../utlis/geo'; 

export default function Step4Tags() {
  const { formData, setFormData, clearFormData } = useWizard();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userType = localStorage.getItem("userType");

  const { completeStatus: reduxCompleteStatus, error: apiErrorFromRedux } =
    useSelector((s) => s.userProfile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [photoStatuses, setPhotoStatuses] = useState([]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const selectedInterests = useMemo(
    () => Object.entries(categories).flatMap(([cat]) => formData[cat] || []),
    [formData]
  );

  const handleBack = useCallback(() => {
    setFormData({ ...formData });
    navigate("/complete/photo");
  }, [formData, navigate, setFormData]);

  const setSinglePhotoStatus = useCallback((index, patch) => {
    setPhotoStatuses((prev) => {
      const next = [...prev];
      next[index] = { ...(next[index] || { index, status: "idle" }), ...patch };
      return next;
    });
  }, []);

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const photoUrls = [];

    // 1) Get MP photos in slot order
    const photos = userType === "mp" ? [...(formData.profilePhotos || [])] : [];

    // 2) Upload photos in slot order
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

    // 3) For single-photo users
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

    // 4) Build payload (normalize geoLocation -> backend location)
    const normalizedLocation = normalizeGeoForApi(formData.geoLocation); // returns null if invalid
    const payload = {
      ...formData,
      interests: selectedInterests,
    };

    // attach photos in the shape your backend expects
    if (userType === "mp") payload.photos = photoUrls;
    else payload.photo = photoUrls[0] || "";

    // attach normalized location only when valid
    if (normalizedLocation) {
      payload.location = normalizedLocation;
    } else {
      // ensure we don't accidentally send the front-end geoLocation object
      delete payload.geoLocation;
    }

    // ensure searchRadius matches backend name (searchRadius: { distance, unit })
    if (formData.searchRadius) {
      payload.searchRadius = {
        distance: Number(formData.searchRadius.distance) || 10,
        unit: formData.searchRadius.unit || 'km',
      };
    }

    // 5) Complete profile
    await dispatch(completeProfile(payload)).unwrap();
    dispatch(resetProfileState());

    // 6) Clear local form data + IndexedDB
    clearFormData();
    await del("profilePhoto");
    await del("profilePhotos");

    // 7) Navigate to home
    navigate("/home", { state: { profileJustCompleted: true } });
  } catch (err) {
    console.error("Profile completion error:", err);
    // consider showing user-facing error toast here
  } finally {
    setIsSubmitting(false);
  }
};

  const isLoading = isSubmitting || reduxCompleteStatus === "loading";

  return (
    <div className="animate-fade-in">
      <ProgressBar step={5} totalSteps={5} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Touch!</h2>
        <p className="text-gray-500">Select your interests to find better matches</p>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const isActive = (formData[title] || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        [title]: isActive
                          ? (formData[title] || []).filter((v) => v !== item)
                          : [...(formData[title] || []), item],
                      })
                    }
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-pressed={isActive}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {photoStatuses.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700">Photo upload status</h4>
          {photoStatuses.map((p, idx) => (
            <div
              key={idx}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>Slot {idx + 1}</span>
              <span>
                {p.status === "idle" && "Idle"}
                {p.status === "uploading" && "Uploading…"}
                {p.status === "done" && "Uploaded ✓"}
                {p.status === "failed" && "Failed ✗"}
              </span>
            </div>
          ))}
        </div>
      )}

      {apiErrorFromRedux && (
        <p className="text-center mt-4 text-red-500">{apiErrorFromRedux}</p>
      )}
      {errorMessage && (
        <p className="text-center mt-4 text-red-500">{errorMessage}</p>
      )}

      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 py-3 border border-gray-200 bg-white"
        >
          Back
        </Button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Finish Setup"}
        </button>
      </div>
    </div>
  );
}
