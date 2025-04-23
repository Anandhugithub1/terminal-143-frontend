import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';
import {
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Globe2,
  Film,
  PartyPopper,
  Compass,
  Umbrella,
  Edit2
} from 'lucide-react';
import '@fontsource-variable/inter';

const initialFields = [
  { key: 'gender',    label: 'Gender',    value: 'Male',    icon: User },
  { key: 'age',       label: 'Age',       value: '24',      icon: Calendar },
  { key: 'location',  label: 'Location',  value: 'Germany', icon: MapPin },
  { key: 'languages', label: 'Languages', value: 'German',  icon: Globe2 }
];

const initialInterests = [
  { key: 'travel',     label: 'Travel',     icon: Globe2 },
  { key: 'movies',     label: 'Movies',     icon: Film },
  { key: 'parties',    label: 'Parties',    icon: PartyPopper },
  { key: 'adventures', label: 'Adventures', icon: Compass },
  { key: 'beach',      label: 'Beach',      icon: Umbrella }
];

function ProfilePage() {
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [avatar, setAvatar] = useState('/path/to/avatar.jpg');
  const [bio, setBio] = useState(
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
  );
  const [fields, setFields] = useState(initialFields);
  const [interests, setInterests] = useState(initialInterests);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  // Show upload options dropdown
  const handleEditPhotoClick = () => {
    setShowUploadOptions((prev) => !prev);
  };

  // Trigger gallery upload
  const triggerGalleryUpload = () => {
    galleryInputRef.current?.click();
    setShowUploadOptions(false);
  };

  // Trigger camera upload
  const triggerCameraUpload = () => {
    cameraInputRef.current?.click();
    setShowUploadOptions(false);
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      // TODO: upload to server
    }
  };

  // Edit bio via prompt
  const handleEditBio = () => {
    const newBio = window.prompt('Update your bio:', bio);
    if (newBio !== null) {
      setBio(newBio);
      // TODO: persist change
    }
  };

  // Edit a field value
  const handleEditField = (key, currentValue) => {
    const newValue = window.prompt(
      `Update ${key.charAt(0).toUpperCase() + key.slice(1)}:`,
      currentValue
    );
    if (newValue !== null) {
      setFields(
        fields.map((f) => (f.key === key ? { ...f, value: newValue } : f))
      );
      // TODO: persist change
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      <TopNav />

      <section className="bg-white px-5 pt-6 pb-8 flex flex-col items-center border-b border-gray-200">
        <div className="relative">
          <img
            src={avatar}
            alt="Profile avatar"
            className="w-24 h-24 rounded-full border-4 border-pink-400 object-cover"
          />
          <button
            onClick={handleEditPhotoClick}
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow"
            aria-label="Edit profile picture"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>

          {/* Hidden file inputs */}
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />

          {/* Inline Upload Options */}
          {showUploadOptions && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-lg z-10 w-52">
              <h3 className="text-center font-semibold mb-2">Upload Photo</h3>
              <button
                onClick={triggerCameraUpload}
                className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Use Camera
              </button>
              <button
                onClick={triggerGalleryUpload}
                className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Choose from Gallery
              </button>
              <button
                onClick={() => setShowUploadOptions(false)}
                className="w-full py-2 bg-red-100 rounded-lg hover:bg-red-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Rodri Alexander</h2>
      </section>

      <div className="p-5 space-y-6">
        <section className="bg-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>
              <p className="mt-2 text-sm text-gray-600">{bio}</p>
            </div>
            <button
              onClick={handleEditBio}
              className="text-pink-600 text-sm font-medium hover:underline"
            >
              Edit
            </button>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">About Me</h2>
          </div>
          {fields.map(({ key, label, value, icon: Icon }) => (
            <div
              key={key}
              onClick={() => handleEditField(key, value)}
              className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className="text-gray-700" />
                <span className="text-gray-700 font-medium">{label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{value}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </section>

        <section className="bg-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Interests</h2>
            <button className="text-pink-600 text-sm font-medium hover:underline">
              Edit
            </button>
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

        <BottomNav />
      </div>
    </div>
  );
}

export default ProfilePage;
