// components/User_Home/ProfileEditPage.jsx
import React, { useState, useEffect, useMemo, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "@fontsource-variable/inter";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";

import { LoadingSpinner } from "../../../components/Ui/Spinner";
import { interestMap, getProfileFields } from "../../../Utlis/utlis";
import { useEditableProfile } from "../../../Hooks/EditProfile";
import {
  Section,
  LazyWrapper,
} from "../components/ProfileEdit/Reusable";
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

// ======== Main Component ========
export default function ProfileEditPage() {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();

  const {
    profile,
    status,
    localAvatar,
    isUploading,
    isFetching,
    updateProfileData,
  } = useEditableProfile();

  const [bioInput, setBioInput] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [socialLinks, setSocialLinks] = useState(
    Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, ""]))
  );

  const [activeField, setActiveField] = useState(null); //  for slide-in edit page

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

  // ======== Effects ========
  useEffect(() => {
    if (profile?.bio) setBioInput(profile.bio);

    if (profile?.socialMediaLinks) {
      const linksObj = SOCIAL_PLATFORMS.reduce((acc, { key }) => {
        const found = profile.socialMediaLinks.find(
          (link) => link.platform === key
        );
        acc[key] = found?.usernameOrLink || "";
        return acc;
      }, {});
      setSocialLinks(linksObj);
    }
  }, [profile]);

  // ======== Handlers ========
  const saveSocialLinks = useCallback(() => {
    const formattedLinks = Object.entries(socialLinks)
      .filter(([, value]) => value.trim() !== "")
      .map(([platform, usernameOrLink]) => ({ platform, usernameOrLink }));
    updateProfileData("socialMediaLinks", formattedLinks);
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

  // ======== Render ========
  return (
    <div className="flex flex-col h-screen bg-white font-inter relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <section className="relative bg-white px-5 pt-6 pb-8 border-b border-gray-200">
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

        {/* Main Sections */}
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

          {/* About Me Fields */}
          <Section title={t("profileEdit.aboutMe")}>
            {fields
              .filter((f) => f.key !== "gender" && f.key !== "location")
              .map((f) => (
                <div
                  key={f.key}
                  onClick={() => setActiveField(f)}
                  className="flex justify-between items-center px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <f.icon size={20} className="text-gray-700" />
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium">
                        {f.label}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {Array.isArray(f.value)
                          ? f.value.join(", ")
                          : f.value || t("profileEdit.notSet")}
                      </span>
                    </div>
                  </div>
                  <ChevronLeft size={18} className="rotate-180 text-gray-400" />
                </div>
              ))}
          </Section>

          {/* Interests */}

<div
  onClick={() =>
    setActiveField({
      key: "interest",
      label: t("profileEdit.interests"),
      value: profile.interest || [],
    })
  }
  className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-4 cursor-pointer hover:shadow-md transition-all duration-300"
>
  <div className="flex justify-between items-start">
    {/* Left Section — Title + Interests */}
    <div className="flex flex-col flex-1">
      <span className="text-gray-900 font-semibold mb-3">
        {t("profileEdit.interests")}
      </span>

      {Array.isArray(profile.interest) && profile.interest.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.interest.map((key) => {
            const interest = allInterests.find((i) => i.key === key);
            if (!interest) return null;
            const Icon = interest.icon;
            return (
              <div
                key={key}
                className="flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-800"
              >
                <Icon size={15} className="text-gray-600" />
                <span className="leading-tight">{interest.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <span className="text-gray-500 text-sm">
          {t("profileEdit.interestsEmptyText")}
        </span>
      )}
    </div>

    {/* Right Section — Edit Label */}
    <span className="text-[#FF3366] text-sm font-medium ml-4 mt-1 shrink-0">
      Edit
    </span>
  </div>
</div>



          {/* Social Links */}
          <LazyWrapper fallbackCount={6}>
            <Section title={t("profileEdit.socialLinks")}>
              <EditableSocialLinks
                socialLinks={socialLinks}
                onChange={(platform, value) =>
                  setSocialLinks((prev) => ({ ...prev, [platform]: value }))
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
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 text-sm font-medium"
              >
                {t("profileEdit.saveSocialLinks")}
              </button>
            </Section>
          </LazyWrapper>
        </div>
      </main>

      {/*  Slide-In Edit Page */}
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
            activeField.value ||
            (activeField.key === "languages" ? [] : "")
          }
     onSave={(keyOrValue, maybeValue) => {
  const updateKey =
    typeof maybeValue !== "undefined" ? keyOrValue : activeField.key;
  const updateValue =
    typeof maybeValue !== "undefined" ? maybeValue : keyOrValue;

  updateProfileData(updateKey, updateValue);
  setActiveField(null);
}}

          onCancel={() => setActiveField(null)}
        />
      )}
    </div>
  );
}
