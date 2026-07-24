import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizard } from "../../contexts/ProfileWizard";
import { normalizeGeoForApi } from "../../utlis/geo";
import { calculateAge } from "../../utlis/index";
import {
  completeProfileApi,
  getPresignedUrl,
} from "../../../UserProfile/api/profile";
import { ensureNormalizedImage } from "../../../../utils/imageConversion";
import OnboardingPage from "../../../Circles/pages/OnboardingPage";
import { useTranslation } from "react-i18next";

const SINGLE_PHOTO_GENDERS = ["M", "TM", "OT"];

export default function Tags() {
  const { t } = useTranslation("common");
  const { formData, clearFormData } = useWizard();
  const navigate = useNavigate();

  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submittingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const validateRequiredFields = () => {
    const missing = [];
    if (!formData.name?.trim()) missing.push(t("wizard.tags.missingName"));
    if (!formData.bio?.trim()) missing.push(t("wizard.tags.missingBio"));
    if (!formData.dob) {
      missing.push(t("wizard.tags.missingDob"));
    } else if (calculateAge(formData.dob) < 18) {
      missing.push(t("wizard.tags.missingValidAge"));
    }
    if (!formData.preferences?.length) missing.push(t("wizard.tags.missingPreference"));
    const loc = formData.location;
    if (
      !loc?.coordinates ||
      loc.coordinates.lat == null ||
      loc.coordinates.lon == null
    )
      missing.push(t("wizard.tags.missingLocation"));
    const files = isSinglePhoto
      ? [formData.profilePhoto].filter(Boolean)
      : (formData.profilePhotos || []).filter(Boolean);
    if (!files.length) missing.push(t("wizard.tags.missingPhoto"));
    return missing;
  };

  const completeMutation = useMutation({
    mutationFn: completeProfileApi,
    onError: () => {
      submittingRef.current = false;
      setIsSubmitting(false);
      toast.error(t("wizard.tags.completionFailed"));
    },
    onSettled: () => {
      submittingRef.current = false;
      setIsSubmitting(false);
    },
  });

  const uploadSinglePhoto = async (file) => {
    const uploadFile = await ensureNormalizedImage(file);
    const { presignedUrl, publicUrl } = await getPresignedUrl({
      fileType: uploadFile.type,
    });
    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadFile.type },
      body: uploadFile,
    });
    return publicUrl;
  };

  // Called by OnboardingPage — profile must be completed before circles are joined
  const handleComplete = async () => {
    if (submittingRef.current) return;

    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      toast.error(t("wizard.tags.pleaseComplete", { fields: missingFields.join(", ") }));
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const files = isSinglePhoto
        ? [formData.profilePhoto].filter(Boolean)
        : (formData.profilePhotos || []).filter(Boolean);

      const photos = await Promise.all(
        files.map((file, i) =>
          uploadSinglePhoto(file).then((url) => ({
            url,
            role: i === 0 ? "profile" : "gallery",
            slot: i,
            order: i,
          }))
        )
      );

      // Exclude interest category keys — interests are derived from circles now
      const { interests: _i, ...restFormData } = formData;

      const payload = {
        ...restFormData,
        photos,
        searchRadius: {
          distance: Number(formData.searchRadius?.distance) || 25,
          unit: formData.searchRadius?.unit || "km",
        },
      };

      const normalizedLocation = normalizeGeoForApi(formData.location);
      if (normalizedLocation) payload.location = normalizedLocation;

      await completeMutation.mutateAsync(payload);
      clearFormData();
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      toast.error(t("wizard.tags.somethingWentWrong"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <OnboardingPage
        onComplete={handleComplete}
        onBack={() => navigate("/complete/photo")}
      />
    </div>
  );
}
