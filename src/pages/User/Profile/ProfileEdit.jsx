import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronLeft, Edit2 } from 'lucide-react';
import '@fontsource-variable/inter';
import { interestMap, getProfileFields } from '../../../Utlis/utlis';
import { useEditableProfile } from '../../../Hooks/EditProfile';
import { EditableField, UploadOptions } from '../../../components/User_Home/ProfileEdit';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const [showUpload, setShowUpload] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const {
    profile,
    status,
    localAvatar,
    localBio,
    editField,
    editBio,
    uploadImage,
  } = useEditableProfile();

  // While `profile` is still null (status: 'idle' or 'loading'), render a loading indicator:
  if (status === 'idle' || status === 'loading' || profile === null) {
    return (
      <LoadingSpinner/>
    );
  }

  // At this point, `profile` is guaranteed to be a non-null object
  const fields = getProfileFields(profile);
  const interests = (profile.interest || []).map((key) => ({
    key,
    ...interestMap[key],
  }));

  

  const handlePhotoClick = () => setShowUpload((v) => !v);
  const handleFileChange = (e, source) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImage(file, userType === 'fm' ? 0 : undefined);
  };

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
            <div className="relative">
              <img
                src={localAvatar || '/path/to/avatar.jpg'}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full border-4 border-pink-400 object-cover"
              />
              <button
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow"
              >
                <Edit2 size={16} className="text-gray-600" />
              </button>

              <input
                type="file"
                accept="image/*"
                ref={galleryRef}
                onChange={(e) => handleFileChange(e, 'gallery')}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraRef}
                onChange={(e) => handleFileChange(e, 'camera')}
                className="hidden"
              />

              {showUpload && (
                <UploadOptions
                  onCamera={() => {
                    cameraRef.current.click();
                    setShowUpload(false);
                  }}
                  onGallery={() => {
                    galleryRef.current.click();
                    setShowUpload(false);
                  }}
                  onCancel={() => setShowUpload(false)}
                />
              )}
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          {/* Bio Section */}
          <section className="bg-gray-100 rounded-2xl p-5 flex justify-between items-start">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>
              <p className="mt-2 text-sm text-gray-600">{localBio}</p>
            </div>
            <button onClick={editBio} className="text-pink-600 text-sm font-medium hover:underline">
              Edit
            </button>
          </section>

          {/* About Me Fields */}
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">About Me</h2>
            </div>
            {fields.map((f) => (
              <EditableField
                key={f.key}
                icon={f.icon}
                label={f.label}
                value={f.value}
                onEdit={() => editField(f.key, f.value)}
              />
            ))}
          </section>

          {/* Interests */}
          <section className="bg-gray-100 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Interests</h2>
              <button className="text-pink-600 text-sm font-medium hover:underline">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition"
                >
                  <Icon size={16} className="text-pink-600" />
                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
