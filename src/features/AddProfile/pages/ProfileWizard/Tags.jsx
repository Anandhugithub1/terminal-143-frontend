import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizard } from "../../contexts/ProfileWizard";
import { normalizeGeoForApi } from "../../utlis/geo";
import { calculateAge } from "../../utlis/index";
import { completeProfileApi } from "../../../UserProfile/api/profile";
import { useTranslation } from "react-i18next";
import OnboardingPage from "../../../Circles/pages/OnboardingPage";

const SINGLE_PHOTO_GENDERS = ["M", "TM", "OT"];

export default function Tags() {
  const { t } = useTranslation("common");
  const { formData, clearFormData } = useWizard();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    // Photos are intentionally NOT required here: they upload as soon as
    // they're picked (see Photo.jsx), independently of this submit, and a
    // failed/slow photo upload must never block account creation — matching
    // standard dating-app onboarding (Hinge/Bumble/Tinder), where a photo
    // issue is recoverable after signup instead of losing the whole form.
    return missing;
  };

  // Slots hold {file, url, status, error} once picked (see Photo.jsx) — only
  // "done" slots have a usable url. A slot stuck "uploading" (rare: user
  // raced through the wizard faster than the upload finished) or "error" is
  // simply left out rather than blocking submission.
  const uploadedPhotos = () => {
    const slots = isSinglePhoto
      ? [formData.profilePhoto]
      : formData.profilePhotos || [];
    return slots
      .filter((slot) => slot?.status === "done" && slot.url)
      .map((slot, i) => ({
        url: slot.url,
        role: i === 0 ? "profile" : "gallery",
        slot: i,
        order: i,
      }));
  };

  const hasPendingUpload = () => {
    const slots = isSinglePhoto
      ? [formData.profilePhoto]
      : formData.profilePhotos || [];
    return slots.some((slot) => slot?.status === "uploading");
  };

  const completeMutation = useMutation({
    mutationFn: completeProfileApi,
    // silent: this mutation shows its own toast below — without this the
    // global MutationCache handler in client.js would also toast the same
    // failure, showing two error toasts for one submit.
    meta: { silent: true },
    onError: (err) => {
      submittingRef.current = false;
      setIsSubmitting(false);
      // 409 means the profile already exists — completeProfile.js returns
      // this for a genuine double-submit (duplicate tap that raced past the
      // client-side guard) AND for the case where an earlier attempt actually
      // succeeded server-side but the client never saw the response (dropped
      // connection right after the write). Either way the account exists;
      // showing "completion failed" here would be actively wrong and send
      // the user into a confusing retry loop against a profile that's
      // already there. Treat it as success instead.
      if (err?.response?.status === 409) return;
      toast.error(t("wizard.tags.completionFailed"));
    },
    onSettled: () => {
      submittingRef.current = false;
      setIsSubmitting(false);
    },
  });

  // Called by OnboardingPage — profile must be completed before circles are joined
  const handleComplete = async () => {
    if (submittingRef.current) return;
    // Set immediately, before any async work (validation is sync but the
    // pending-upload wait below is not) — otherwise a second tap during that
    // window would re-enter this function before the ref is set and start a
    // duplicate submit.
    submittingRef.current = true;
    setIsSubmitting(true);

    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      submittingRef.current = false;
      setIsSubmitting(false);
      toast.error(t("wizard.tags.pleaseComplete", { fields: missingFields.join(", ") }));
      return;
    }

    // Photos upload in the background as soon as they're picked (Photo.jsx),
    // so by the time a user reaches the final step they're normally already
    // done. If one is still mid-upload, give it a brief window to finish
    // rather than immediately submitting with it missing — but never block
    // account creation waiting on it past this.
    if (hasPendingUpload()) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    try {
      const photos = uploadedPhotos();

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
      // DefaultHomeRoute reads ["my-profile"] to decide where to send the
      // user right after this — without invalidating, it can still see the
      // pre-completion cached 404 (staleTime: 5min) and bounce to /login,
      // dropping the profileJustCompleted state before Home.jsx ever mounts.
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      // A photo that failed/never finished uploading doesn't block
      // completion, but the user should still know to go add one — silently
      // dropping it would be confusing ("I picked 3 photos, where'd they go").
      if (!photos.length) {
        toast(t("wizard.tags.completedWithoutPhoto"));
      }
      clearFormData();
    } catch (err) {
      submittingRef.current = false;
      setIsSubmitting(false);

      // 409 = profile already exists (see completeMutation.onError above) —
      // that's a success from the user's perspective, so recover instead of
      // failing the whole wizard: invalidate the cached profile and clear
      // form state the same as the success path would, then let
      // OnboardingPage continue on to joining circles / navigating home.
      if (err?.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        clearFormData();
        return;
      }

      // completeMutation's onError already toasted for a failure coming from
      // the API call itself — don't show a second, contradictory-looking one.
      if (!completeMutation.isError) {
        toast.error(t("wizard.tags.somethingWentWrong"));
      }
      // Rethrown so OnboardingPage's handleComplete (which awaits this
      // function) sees the failure and stops before joining circles /
      // navigating to /home — otherwise it treats a failed profile
      // completion as success.
      throw err;
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
