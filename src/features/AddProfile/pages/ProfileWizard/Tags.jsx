import React, { useState, useRef, useMemo, useEffect } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import { Button } from "../../../../shared/Button";
import { useMutation } from "@tanstack/react-query";
import { categories } from "../../utlis";
import { toast } from "sonner";
import { normalizeGeoForApi } from "../../utlis/geo";
import {calculateAge} from '../../utlis/index'
import {
  getPresignedUrl,
  completeProfileApi,
} from "../../../UserProfile/api/profile";
import { Checkbox } from "@headlessui/react";

const SINGLE_PHOTO_GENDERS = ["M", "TM"];

export default function Tags() {
  const { formData, setFormData,clearFormData } = useWizard();
  const navigate = useNavigate();

  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

const validateRequiredFields = () => {
  const missing = []

  // Name
  if (!formData.name?.trim()) {
    missing.push("Name")
  }

  // Bio
  if (!formData.bio?.trim()) {
    missing.push("Bio")
  }

  // DOB (source of truth)
  if (!formData.dob) {
    missing.push("Date of birth")
  } else if (calculateAge(formData.dob) < 18) {
    missing.push("Valid age (18+)")
  }

  // Social links
  if (
    !formData.socialMediaLinks ||
    formData.socialMediaLinks.length === 0
  ) {
    missing.push("At least one social link")
  }

  // Interests
  if (!hasAtLeastOneInterest) {
    missing.push("At least one interest")
  }

  // Location
  const loc = formData.location
  if (
    !loc ||
    !loc.coordinates ||
    loc.coordinates.lat == null ||
    loc.coordinates.lon == null
  ) {
    missing.push("Location")
  }

  return missing
}



  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submittingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const selectedInterests = useMemo(() => {
    return Object.keys(categories).flatMap((cat) => formData[cat] || []);
  }, [formData]);

  const hasAtLeastOneInterest = selectedInterests.length > 0;

  const completeMutation = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: () => {
      submittingRef.current = false;
      clearFormData();
      toast.success("Your profile is ready");
      setTimeout(() => {
        navigate("/home", {
          state: { profileJustCompleted: true },
        });
      }, 500);
    },
    onError: () => {
      submittingRef.current = false;
      toast.error("Profile completion failed");
    },
    onSettled: () => {
      submittingRef.current = false;
      setIsSubmitting(false);
    },
  });

  const uploadSinglePhoto = async (file) => {
    const { presignedUrl, publicUrl } = await getPresignedUrl({
      fileType: file.type,
    });

    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    const missingFields = validateRequiredFields()

  if (missingFields.length > 0) {
    toast.error(
      `Please complete: ${missingFields.join(", ")}`
    )
    return
  }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const files = isSinglePhoto
        ? [formData.profilePhoto].filter(Boolean)
        : (formData.profilePhotos || []).filter(Boolean);

      if (!files.length) {
        toast.error("Please upload at least one photo");
        return;
      }

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

      const payload = {
        ...formData,
        interests: selectedInterests,
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
    <div className="animate-fade-in">
      <ProgressBar step={5} totalSteps={5} />

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const checked = (formData[title] || []).includes(item);
                return (
                  <Checkbox
                    key={item}
                    checked={checked}
                    disabled={isSubmitting}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        [title]: val
                          ? [...(prev[title] || []), item]
                          : (prev[title] || []).filter((v) => v !== item),
                      }))
                    }
                    className={
                      checked
                        ? "bg-pink-500 text-white px-5 py-2 rounded-full"
                        : "bg-gray-100 text-gray-600 px-5 py-2 rounded-full"
                    }
                  >
                    {item}
                  </Checkbox>
                );
              })}
            </div>
          </div>
        ))}
      </div>

     <div className="mt-8 flex gap-4">
  <Button
    onClick={() => navigate("/complete/photo")}
    disabled={isSubmitting}
    textColor="black"
    className="flex-1 py-3 border border-gray-200 bg-white"
  >
    Back
  </Button>

  <Button
    onClick={handleSubmit}
    disabled={isSubmitting || !hasAtLeastOneInterest}
    className="flex-1 py-3"
  >
    {isSubmitting ? "Saving..." : "Finish Setup"}
  </Button>
</div>

    </div>
  );
}
