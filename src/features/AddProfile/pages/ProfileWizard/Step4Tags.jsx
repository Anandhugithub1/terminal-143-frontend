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

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setPhotoStatuses([]);

    // Sonner loading toast → return toastId
    const toastId = toast.loading("Completing your profile…");

    try {
      const photoUrls = [];
      const photos =
        userType === "mp"
          ? [...(formData.profilePhotos || [])]
          : formData.profilePhoto
          ? [formData.profilePhoto]
          : [];

      // init statuses
      photos.forEach((_, i) => setSinglePhotoStatus(i, { status: "idle" }));

      const uploadPromises = photos.map((file, index) => {
        if (!file) return Promise.resolve({ index, ok: true, publicUrl: null });

        setSinglePhotoStatus(index, { status: "uploading", error: null });

        return (async () => {
          try {
            const result = await dispatch(
              uploadProfileImage({ file, photoIndex: index })
            ).unwrap();

            const publicUrl = result?.publicUrl ?? null;
            if (!publicUrl) throw new Error("Upload response missing publicUrl");

            setSinglePhotoStatus(index, { status: "done", publicUrl });
            return { index, ok: true, publicUrl };
          } catch (err) {
            setSinglePhotoStatus(index, {
              status: "failed",
              error: err?.message || String(err),
            });
            return { index, ok: false, error: err?.message || String(err) };
          }
        })();
      });

      const results = await Promise.allSettled(uploadPromises);

      const ordered = results.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { ok: false, error: r.reason?.message || String(r.reason) }
      );

      ordered.forEach((res) =>
        photoUrls.push(res.ok ? res.publicUrl || null : null)
      );

      const failedCount = ordered.filter((r) => !r.ok).length;

      if (failedCount > 0) {
        const msg = `${failedCount} photo upload${failedCount > 1 ? "s" : ""} failed. Some images could not be uploaded.`;
        toast.warning(msg);
        setErrorMessage(msg);
      }

      const payload = { ...formData, interests: selectedInterests };

      if (userType === "mp") payload.photos = photoUrls;
      else payload.photo = photoUrls[0] || "";

      await dispatch(completeProfile(payload)).unwrap();
      dispatch(resetProfileState());

      clearFormData();
      await del("profilePhoto");
      await del("profilePhotos");

      toast.dismiss(toastId);
      toast.success("Profile completed! Redirecting…");

      if (isMountedRef.current) {
        navigate("/home", { state: { profileJustCompleted: true } });
      }
    } catch (err) {
      console.error("Profile completion error:", err);

      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [
    dispatch,
    formData,
    selectedInterests,
    userType,
    navigate,
    clearFormData,
    setFormData,
    setSinglePhotoStatus,
    isSubmitting,
  ]);

  const isLoading = isSubmitting || reduxCompleteStatus === "loading";

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={4} />

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
          textColor="black"
          className="flex-1 py-3 border border-gray-200 bg-white"
        >
          Back
        </Button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-primary text-white font-semibold py-3 px-6 rounded-3xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Finish Setup"}
        </button>
      </div>
    </div>
  );
}
