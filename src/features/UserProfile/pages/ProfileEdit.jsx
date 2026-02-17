import React, { useState, useEffect, useMemo, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "@fontsource-variable/inter";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { LoadingSpinner } from "../../../components/Ui/Spinner";
import { interestMap, getProfileFields } from "../../../Utlis/utlis";
import { useEditableProfile } from "../../../Hooks/EditProfile";
import { Section, LazyWrapper } from "../components/ProfileEdit/Reusable";
import FieldEditPage from "./FieldEditPage";
import { LANGUAGES } from "../utlis/profileUtils";

const EditableSocialLinks = lazy(() =>
  import("../components/ProfileEdit/EditableSocialLinks")
);
const EditableBio = lazy(() => import("../components/ProfileEdit/EditableBio"));

const SOCIAL_PLATFORMS = [
  { key: "IG" },
  { key: "FB" },
  { key: "Telegram" },
  { key: "Line" },
  { key: "Wechat" },
  { key: "Other" },
];

export default function ProfileEditPage() {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();

  const [activeField, setActiveField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { profile, status, isUploading, isFetching, updateProfileData } =
    useEditableProfile();

  const [socialLinks, setSocialLinks] = useState(
    Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, ""]))
  );

  const fields = useMemo(() => getProfileFields(profile), [profile]);

  const allInterests = useMemo(
    () =>
      Object.entries(interestMap).map(([key, value]) => ({
        key,
        label: value.label,
        icon: value.icon,
      })),
    []
  );

  useEffect(() => {
    if (!profile?.socialMediaLinks) return;

    const mapped = SOCIAL_PLATFORMS.reduce((acc, { key }) => {
      const found = profile.socialMediaLinks.find(
        (link) => link.platform === key
      );
      acc[key] = found?.usernameOrLink || "";
      return acc;
    }, {});

    setSocialLinks(mapped);
  }, [profile]);

  const showSuccess = () =>
    toast.success(t("profileEdit.updated", "Profile updated successfully"));

  const showError = (err) =>
    toast.error(
      err?.response?.data?.error ||
        t("profileEdit.updateFailed", "Failed to update profile")
    );

  const saveSocialLinks = useCallback(async () => {
    const formatted = Object.entries(socialLinks)
      .filter(([, v]) => v.trim())
      .map(([platform, usernameOrLink]) => ({
        platform,
        usernameOrLink,
      }));

    try {
      setIsSaving(true);
      await updateProfileData("socialMediaLinks", formatted);
      showSuccess();
    } catch (err) {
      showError(err);
    } finally {
      setIsSaving(false);
    }
  }, [socialLinks, updateProfileData]);

  if (
    status === "idle" ||
    status === "loading" ||
    !profile ||
    isUploading ||
    isFetching
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-inter relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <section className="px-5 pt-6 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {t("profileEdit.title")}
            </h1>
          </div>
        </section>

        <div className="p-5 space-y-6">
          {/* Bio */}
          <LazyWrapper>
            <EditableBio
              profile={profile}
              setActiveField={setActiveField}
              editLabel={t("profileEdit.edit")}
              emptyText={t("profileEdit.bioEmptyText")}
            />
          </LazyWrapper>

          {/* About Me */}
          <Section title={t("profileEdit.aboutMe")}>
            {fields
              .filter((f) => f.key !== "gender" && f.key !== "location")
              .map((f) => (
                <div
                  key={f.key}
                  onClick={() => setActiveField(f)}
                  className="flex justify-between items-center px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <f.icon size={20} className="text-gray-700" />
                    <div>
                      <span className="font-medium text-gray-800">
                        {f.label}
                      </span>
                      <div className="text-sm text-gray-500">
                        {Array.isArray(f.value)
                          ? f.value.join(", ")
                          : f.value || t("profileEdit.notSet")}
                      </div>
                    </div>
                  </div>
                  <ChevronLeft size={18} className="rotate-180 text-gray-400" />
                </div>
              ))}
          </Section>

          {/* Interests */}
         {/* Interests */}
<div
  onClick={() =>
    setActiveField({
      key: "interest",
      label: t("profileEdit.interests"),
      value: profile.interest || [],
    })
  }
  className="bg-white rounded-2xl shadow-sm px-5 py-4 cursor-pointer hover:shadow-md transition-all"
>
  <div className="flex justify-between items-start">
    {/* Left */}
    <div className="flex flex-col flex-1">
      <span className="font-semibold text-gray-900 mb-3">
        {t("profileEdit.interests")}
      </span>

      {profile.interest?.length ? (
        <div className="flex flex-wrap gap-2">
          {profile.interest.map((key) => {
            const interest = allInterests.find((i) => i.key === key)
            if (!interest) return null
            const Icon = interest.icon

            return (
              <div
                key={key}
                className="flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
              >
                <Icon size={15} className="text-gray-600" />
                <span>{interest.label}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <span className="text-sm text-gray-500">
          {t("profileEdit.interestsEmptyText")}
        </span>
      )}
    </div>

    {/* Right — Edit label */}
    <span className="text-[#FF3366] text-sm font-medium ml-4 mt-1 shrink-0">
      {t("profileEdit.edit")}
    </span>
  </div>
</div>


          {/* Social Links */}
          <LazyWrapper fallbackCount={6}>
           <Section title={t("profileEdit.socialLinks")}>

  {/* Privacy Info */}
  <p className="text-xs text-gray-500 mb-3">
    Your social links stay private and are shared only when there’s a match.
  </p>

  <EditableSocialLinks
    socialLinks={socialLinks}
    onChange={(p, v) =>
      setSocialLinks((prev) => ({ ...prev, [p]: v }))
    }
    platformLabels={Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [
        p.key,
        t(`profileEdit.socialLabels.${p.key}`),
      ])
    )}
    inputPlaceholders={Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [
        p.key,
        t(`profileEdit.socialPlaceholders.${p.key}`),
      ])
    )}
    showMoreLabel={t("profileEdit.showMorePlatforms")}
  />

  <button
    onClick={saveSocialLinks}
    disabled={isSaving}
    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 text-sm font-medium"
  >
    {t("profileEdit.saveSocialLinks")}
  </button>
</Section>

          </LazyWrapper>
        </div>
      </main>

      {activeField && (
        <FieldEditPage
          field={{
            ...activeField,
            options:
              activeField.key === "languages"
                ? LANGUAGES.map((l) => l.label)
                : [],
          }}
          value={
            activeField.value || (activeField.key === "languages" ? [] : "")
          }
          isSaving={isSaving}
          onSave={async (keyOrValue, maybeValue) => {
            const key =
              typeof maybeValue !== "undefined" ? keyOrValue : activeField.key;
            const value =
              typeof maybeValue !== "undefined" ? maybeValue : keyOrValue;

            try {
              setIsSaving(true);
              await updateProfileData(key, value);
              showSuccess();
              setActiveField(null);
            } catch (err) {
              showError(err);
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => !isSaving && setActiveField(null)}
        />
      )}
    </div>
  );
}
