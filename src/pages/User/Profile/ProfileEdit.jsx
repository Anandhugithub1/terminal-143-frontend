import React, { useRef, useState,useEffect } from 'react';
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
  const [isEditingBio, setIsEditingBio] = useState(false);
const [bioInput, setBioInput] = useState(profile.bio || '');
useEffect(() => {
  setBioInput(profile.bio || '');
}, [profile.bio]);

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
          {/* Bio Edit Inline */} 
<section className="bg-gray-100 rounded-2xl p-5">
  <div className="flex justify-between items-start mb-3">
    <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>

    {!isEditingBio ? (
      <button
        onClick={() => {
          setIsEditingBio(true);
          setBioInput(profile.bio || '');
        }}
        className="text-pink-600 hover:text-pink-700 flex items-center"
      >
        <Edit2 size={16} className="mr-1" />
        <span className="text-sm font-medium">Edit</span>
      </button>
    ) : (
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setIsEditingBio(false);
            setBioInput(profile.bio || '');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
        <button
          onClick={() => {
            updateField('bio', bioInput.trim());
            setIsEditingBio(false);
          }}
          className="text-pink-600 hover:text-pink-700"
        >
          <Check size={18} />
        </button>
      </div>
    )}
  </div>

  {isEditingBio ? (
    <div className="mt-2">
      <textarea
        value={bioInput}
        onChange={(e) => setBioInput(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none z-50 relative"
        rows={4}
        placeholder="Tell something about yourself..."
      />
      <div className="flex justify-end mt-3 space-x-2">
        <button
          onClick={() => {
            setIsEditingBio(false);
            setBioInput(profile.bio || '');
          }}
          className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            updateField('bio', bioInput.trim());
            setIsEditingBio(false);
          }}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"
        >
          Save
        </button>
      </div>
    </div>
  ) : (
    <p className="text-sm text-gray-600 whitespace-pre-line">
      {profile.bio?.trim() ? (
        profile.bio
      ) : (
        <span className="text-gray-400 italic">Click "Edit" to add your bio</span>
      )}
    </p>
  )}
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