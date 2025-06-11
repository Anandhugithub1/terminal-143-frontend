import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronLeft, Edit2 } from 'lucide-react';
import '@fontsource-variable/inter';
import { interestMap, getProfileFields } from '../../../Utlis/utlis';
import { useEditableProfile } from '../../../Hooks/EditProfile';
import { EditableField } from '../../../components/User_Home/ProfileEdit';
import { EditableSection } from '../../../components/User_Home/EditableSection';
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
    updateField,
    uploadImage,
  } = useEditableProfile();

  // Convert interestMap to array for EditableSection
  const allInterests = Object.entries(interestMap).map(([key, value]) => ({
    key,
    label: value.label,
    icon: value.icon,
  }));

  // While `profile` is still null, render a loading indicator
  if (status === 'idle' || status === 'loading' || profile === null) {
    return <LoadingSpinner />;
  }

  const fields = getProfileFields(profile);

  const handlePhotoClick = () => setShowUpload((v) => !v);
  const handleFileChange = (e) => {
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
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          {/* Bio Section - Using EditableSection */}
          <EditableSection
            title="My Bio"
            value={profile.bio || ''}
            onSave={(newBio) => updateField('bio', newBio)}
            isBio={true}
          />

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
                onEdit={() => updateField(f.key, f.value)}
              />
            ))}
          </section>

          {/* Interests Section - Using EditableSection */}
          <EditableSection
            title="Interests"
            value={profile.interest || []}
            onSave={(selected) => updateField('interest', selected)}
            iconMap={allInterests}
            isBio={false}
          />
        </div>
      </main>
    </div>
  );
}