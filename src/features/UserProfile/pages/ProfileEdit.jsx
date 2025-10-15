// components/User_Home/ProfileEditPage.jsx
import React, { useState, useEffect, useMemo, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Edit2 } from "lucide-react";
import "@fontsource-variable/inter";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../../../components/Ui/Spinner";
import { useAvatarUpload } from "../Hooks/useAvatarUpload";
import { interestMap, getProfileFields } from "../../../Utlis/utlis";
import { useEditableProfile } from "../../../Hooks/EditProfile";
import { EditableField, UploadOptions } from "../components/ProfileEdit/EditableField";
import { LoadingSkeleton,Section,ProfileAvatar,LazyWrapper,AVATAR_PLACEHOLDER } from "../components/ProfileEdit/Reusable";
const EditableSocialLinks = lazy(() => import("../components/ProfileEdit/EditableSocialLinks"));
const EditableBio = lazy(() => import("../components/ProfileEdit/EditableBio"));
const EditableSection = lazy(() => import("../components/ProfileEdit/EditableSection"));
const SOCIAL_PLATFORMS = [
  { key: "IG" }, { key: "FB" }, { key: "Telegram" },
  { key: "Line" }, { key: "Wechat" }, { key: "Other" }
];


// ======== Main Component ========
export default function ProfileEditPage() {
    const { t } = useTranslation('settings');

  const navigate = useNavigate();

  const { profile, status, localAvatar, isUploading, isFetching, updateProfileData, uploadImage } = useEditableProfile();
  const { showUpload, toggleUpload, galleryRef, cameraRef, handleFileChange, openGallery, openCamera, handleRemovePhoto, cancelUpload } =
    useAvatarUpload(uploadImage, updateProfileData);

  const [bioInput, setBioInput] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [socialLinks, setSocialLinks] = useState(Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.key, ""])));

  const fields = useMemo(() => getProfileFields(profile), [profile]);
  const allInterests = useMemo(() =>
    Object.entries(interestMap).map(([key, value]) => ({ key, label: value.label, icon: value.icon })), []
  );

  // ======== Effects ========
  useEffect(() => {
    if (profile?.bio) setBioInput(profile.bio);

    if (profile?.socialMediaLinks) {
      const linksObj = SOCIAL_PLATFORMS.reduce((acc, { key }) => {
        const found = profile.socialMediaLinks.find(link => link.platform === key);
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

  if (status === "idle" || status === "loading" || !profile || isUploading || isFetching) {
    return <LoadingSkeleton height={500} count={1} />;
  }

  // ======== Render ========
  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Header + Avatar */}
        <section className="relative bg-white px-5 pt-6 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{t("profileEdit.title")}</h1>
          </div>
            <div className="flex flex-col items-center mt-6 relative">

            <ProfileAvatar
              src={localAvatar || AVATAR_PLACEHOLDER}
              toggleUpload={toggleUpload}
              showUpload={showUpload}
              UploadOptionsComponent={UploadOptions}
              galleryRef={galleryRef}
              cameraRef={cameraRef}
              handleFileChange={handleFileChange}
              openCamera={openCamera}
              openGallery={openGallery}
              handleRemovePhoto={handleRemovePhoto}
              cancelUpload={cancelUpload}
            />

              {isUploading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
      <LoadingSpinner />
    </div>
  )}
          </div>
        </section>

        {/* Main Sections */}
        <div className="p-5 space-y-6">
          {/* Bio */}
       <LazyWrapper>
    <EditableBio
      bioInput={bioInput}
      setBioInput={setBioInput}
      profile={profile}
      updateProfileData={updateProfileData}
      isEditingBio={isEditingBio}
      setIsEditingBio={setIsEditingBio}
      editLabel={t("profileEdit.edit")}
      placeholderText={t("profileEdit.bioPlaceholder")}
      emptyText={t("profileEdit.bioEmptyText")}
    />
  </LazyWrapper>

          {/* About Me Fields */}
          <Section title={t("profileEdit.aboutMe")}>
            {fields.filter(f => f.key !== "gender" && f.key !== "location")
              .map(f => (
                <EditableField
                  key={f.key}
                  icon={f.icon}
                  label={f.label}
                  value={f.value}
                  onSave={newValue => updateProfileData(f.key, newValue)}
                />
              ))
            }
          </Section>

          {/* Interests */}
          <LazyWrapper>
            <EditableSection
              title={t("profileEdit.interests")}
              value={profile.interest || []}
              onSave={selected => updateProfileData("interest", selected)}
              iconMap={allInterests}
              editLabel={t("profileEdit.edit")}
              saveLabel={t("profileEdit.save")}
              cancelLabel={t("profileEdit.cancel")}
              emptyInterestText={t("profileEdit.interestsEmptyText")}
            />
          </LazyWrapper>

          {/* Social Links */}
          <LazyWrapper fallbackCount={6}>
            <Section title={t("profileEdit.socialLinks")}>
              <EditableSocialLinks
                socialLinks={socialLinks}
                onChange={(platform, value) =>
                  setSocialLinks(prev => ({ ...prev, [platform]: value }))
                }
                platformLabels={Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.key, t(`profileEdit.socialLabels.${p.key}`)]))}
                inputPlaceholders={Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.key, t(`profileEdit.socialPlaceholders.${p.key}`)]))}
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
    </div>
  );
}
