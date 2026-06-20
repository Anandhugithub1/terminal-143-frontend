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

const SINGLE_PHOTO_GENDERS = ["M", "TM"];

export default function Tags() {
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
    if (!formData.name?.trim()) missing.push("Name");
    if (!formData.bio?.trim()) missing.push("Bio");
    if (!formData.dob) {
      missing.push("Date of birth");
    } else if (calculateAge(formData.dob) < 18) {
      missing.push("Valid age (18+)");
    }
    if (!formData.preferences?.length) missing.push("At least one preference");
    if (!formData.socialMediaLinks?.length)
      missing.push("At least one social link");
    const loc = formData.location;
    if (
      !loc?.coordinates ||
      loc.coordinates.lat == null ||
      loc.coordinates.lon == null
    )
      missing.push("Location");
    const files = isSinglePhoto
      ? [formData.profilePhoto].filter(Boolean)
      : (formData.profilePhotos || []).filter(Boolean);
    if (!files.length) missing.push("At least one photo");
    return missing;
  };

  const completeMutation = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: () => {
      submittingRef.current = false;
      clearFormData();
      toast.success("Your profile is ready");
      setTimeout(() => {
        navigate("/home", { state: { profileJustCompleted: true } });
      }, 500);
    },
    onError: () => {
      submittingRef.current = false;
      setIsSubmitting(false);
      toast.error("Profile completion failed");
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

  // Called by OnboardingPage after circles are joined
  const handleComplete = async () => {
    if (submittingRef.current) return;

    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.join(", ")}`);
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
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      toast.error("Something went wrong");
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
