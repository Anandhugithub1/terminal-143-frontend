// components/User_Home/ProfileEditPage.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2 } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import '@fontsource-variable/inter';
import 'react-loading-skeleton/dist/skeleton.css';

import { useAvatarUpload } from '../Hooks/useAvatarUpload';
import { interestMap, getProfileFields } from '../../../Utlis/utlis';
import { useEditableProfile } from '../../../Hooks/EditProfile';
import { EditableField, UploadOptions } from '../components/EditableField';

const EditableSocialLinks = lazy(() => import('../components/EditableSocialLinks'));
const EditableBio = lazy(() => import('../components/EditableBio'));
const EditableSection = lazy(() => import('../components/EditableSection'));

const AVATAR_PLACEHOLDER = 'https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg';
const SOCIAL_PLATFORMS = ['IG', 'FB', 'Telegram', 'Line', 'Wechat', 'Other'];

export default function ProfileEditPage() {
  const [socialLinks, setSocialLinks] = useState({ IG: '', FB: '', Telegram: '', Line: '', Wechat: '', Other: '' });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const navigate = useNavigate();
  const {
    profile,
    status,
    localAvatar,
    isUploading,
    isFetching,
    updateProfileData,
    uploadImage,
  } = useEditableProfile();

  const {
    showUpload,
    toggleUpload,
    galleryRef,
    cameraRef,
    handleFileChange,
    openGallery,
    openCamera,
    handleRemovePhoto,
    cancelUpload,
  } = useAvatarUpload(uploadImage, updateProfileData);

  useEffect(() => {
    if (profile?.bio) setBioInput(profile.bio);
    if (profile?.socialMediaLinks) {
      const linksObj = SOCIAL_PLATFORMS.reduce((acc, platform) => {
        const found = profile.socialMediaLinks.find((link) => link.platform === platform);
        acc[platform] = found?.usernameOrLink || '';
        return acc;
      }, {});
      setSocialLinks(linksObj);
    }
  }, [profile]);

  const fields = useMemo(() => getProfileFields(profile), [profile]);
  const allInterests = useMemo(
    () => Object.entries(interestMap).map(([key, value]) => ({ key, label: value.label, icon: value.icon })),
    []
  );

  if (status === 'idle' || status === 'loading' || !profile || isUploading || isFetching) {
    return <Skeleton height={500} containerClassName="p-4" count={1} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <main className="flex-1 overflow-y-auto pb-20">
        <section className="relative bg-white px-5 pt-6 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Edit Profile</h1>
          </div>

          <div className="flex flex-col items-center mt-6">
            <div className="relative w-32 h-32">
              <img
                src={localAvatar || AVATAR_PLACEHOLDER}
                alt="Profile avatar"
                className="w-full h-full rounded-full border-4 border-pink-400 object-cover"
              />
              <button
                onClick={toggleUpload}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow"
              >
                <Edit2 size={16} className="text-gray-600" />
              </button>

              {showUpload && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-10">
                  <UploadOptions
                    onCamera={openCamera}
                    onGallery={openGallery}
                    onRemove={handleRemovePhoto}
                    onCancel={cancelUpload}
                  />
                </div>
              )}

              <input type="file" accept="image/*" ref={galleryRef} onChange={handleFileChange} className="hidden" />
              <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={handleFileChange} className="hidden" />
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          <Suspense fallback={<Skeleton count={3} height={30} />}>
            <EditableBio
              bioInput={bioInput}
              setBioInput={setBioInput}
              profile={profile}
              updateProfileData={updateProfileData}
              isEditingBio={isEditingBio}
              setIsEditingBio={setIsEditingBio}
            />
          </Suspense>

          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">About Me</h2>
            </div>
            {fields.filter(f => f.key !== 'gender' && f.key !== 'location').map(f => (
              <EditableField
                key={f.key}
                icon={f.icon}
                label={f.label}
                value={f.value}
                onSave={(newValue) => updateProfileData(f.key, newValue)}
              />
            ))}
          </section>

          <Suspense fallback={<Skeleton count={4} height={30} />}>
            <EditableSection
              title="Interests"
              value={profile.interest || []}
              onSave={(selected) => updateProfileData('interest', selected)}
              iconMap={allInterests}
              isBio={false}
            />
          </Suspense>

          <Suspense fallback={<Skeleton count={6} height={25} />}>
            <section className="bg-white border border-gray-200 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Social Links</h2>
              <EditableSocialLinks
                socialLinks={socialLinks}
                onChange={(platform, value) =>
                  setSocialLinks((prev) => ({ ...prev, [platform]: value }))
                }
              />
              <button
                onClick={() => {
                  const formattedLinks = Object.entries(socialLinks)
                    .filter(([, value]) => value?.trim() !== '')
                    .map(([platform, usernameOrLink]) => ({ platform, usernameOrLink }));
                  updateProfileData('socialMediaLinks', formattedLinks);
                }}
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 text-sm font-medium"
              >
                Save Social Links
              </button>
            </section>
          </Suspense>
        </div>
      </main>
    </div>
  );
}