import React, { useState, useEffect, useMemo, lazy, useCallback } from "react";
import "@fontsource-variable/inter";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronLeft, Users } from "lucide-react";
import Skeleton from "react-loading-skeleton";

import { getProfileFields } from "../../../Utlis/utlis";
import { useEditableProfile } from "../../../Hooks/EditProfile";
import { Section, LazyWrapper } from "../components/ProfileEdit/Reusable";
import FieldEditPage from "./FieldEditPage";
import { LANGUAGES } from "../utlis/profileUtils";
import PageHeader from "../../../shared/components/PageHeader";
import { SOCIAL_PLATFORMS } from "../constants/socialPlatforms";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";

const EditableSocialLinks = lazy(() =>
  import("../components/ProfileEdit/EditableSocialLinks")
);
const EditableBio = lazy(() => import("../components/ProfileEdit/EditableBio"));

export default function ProfileEditPage() {
  const { t } = useTranslation("settings");

  const [activeField, setActiveField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { profile, status, isFetching, updateProfileData } =
    useEditableProfile();

  const [socialLinks, setSocialLinks] = useState(
    Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, ""]))
  );

  const fields = useMemo(() => getProfileFields(profile), [profile]);

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

  const showError = (err) => toast.error(getErrorMessage(err));

  // Defaults true, matching the schema default — this hook's own useQuery
  // has no select transform (unlike useMyProfile's mapProfile), so an
  // undefined field here must be treated as "not yet toggled off" rather
  // than read as falsy.
  const showCircleActivity = profile?.showCircleActivity !== false;
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);

  const handleTogglePrivacy = async () => {
    if (isTogglingPrivacy) return;
    setIsTogglingPrivacy(true);
    try {
      await updateProfileData("showCircleActivity", !showCircleActivity);
      showSuccess();
    } catch (err) {
      showError(err);
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

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
    isFetching
  ) {
    return (
      <div className="flex flex-col h-[100dvh] bg-white font-inter overflow-hidden">
        <PageHeader title={t("profileEdit.title")} />

        <main className="flex-1 overflow-y-auto pb-20">
          <div className="p-5 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
              <Skeleton width="30%" height={16} className="mb-3" />
              <Skeleton count={2} height={12} />
            </div>

            {/* About Me */}
            <div>
              <Skeleton width="35%" height={16} className="mb-3" />
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center px-5 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <Skeleton circle width={20} height={20} className="mr-3" />
                    <div className="flex-1">
                      <Skeleton width="40%" height={14} />
                      <Skeleton width="60%" height={12} className="mt-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
              <Skeleton width="35%" height={16} className="mb-3" />
              <div className="space-y-3">
                <Skeleton height={44} borderRadius={12} />
                <Skeleton height={44} borderRadius={12} />
                <Skeleton height={44} borderRadius={12} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white font-inter relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        <PageHeader title={t("profileEdit.title")} />

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

          {/* Privacy — moved here from a standalone Settings page so the
              control sits where people are already deciding what others
              can see of them, rather than requiring a separate trip to
              Settings to find it. */}
          <Section title={t("privacyPage.circleActivityHeading")}>
            <p className="text-xs text-gray-500 mb-3">
              {t("privacyPage.circleActivityDescription")}
            </p>

            <button
              type="button"
              onClick={handleTogglePrivacy}
              disabled={isTogglingPrivacy}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-left disabled:opacity-60 transition-colors"
            >
              <Users size={18} className="text-gray-500 shrink-0" />
              <span className="flex-1 text-sm font-medium text-gray-800">
                {t("privacyPage.showCircleActivityLabel")}
              </span>
              <span
                className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${
                  showCircleActivity ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    showCircleActivity ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>

            <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">
              {showCircleActivity
                ? t("privacyPage.showCircleActivityOn")
                : t("privacyPage.showCircleActivityOff")}
            </p>
          </Section>
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
            activeField.key === "languages"
              ? activeField.value || []
              : activeField.key === "healthStatus"
              ? activeField.rawValue || {}
              : activeField.value || ""
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
