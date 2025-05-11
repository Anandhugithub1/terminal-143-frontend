import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { ChevronRight, User, ChevronLeft, MapPin, Globe2, Film, PartyPopper, Compass, Umbrella, Edit2, Calendar } from 'lucide-react';
import '@fontsource-variable/inter';
import { fetchProfile, selectProfile, selectProfileStatus } from '../../../Redux/User/slice';

function ProfileEditPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [localAvatar, setLocalAvatar] = useState('');
  const [localBio, setLocalBio] = useState('');

  const profile = useSelector(selectProfile);
  const status = useSelector(selectProfileStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'succeeded') {
      setLocalAvatar(profile.photo || profile.profilePhoto || '');
      setLocalBio(profile.bio || '');
    }
  }, [status, profile]);

  const fields = useMemo(() => {
    const age = profile.dob
      ? Math.floor((new Date() - new Date(profile.dob)) / (1000 * 60 * 60 * 24 * 365))
      : '';
    return [
      { key: 'gender', label: 'Gender', value: profile.gender === 'M' ? 'Male' : 'Female', icon: User },
      { key: 'age', label: 'Age', value: age.toString(), icon: Calendar },
      { key: 'location', label: 'Location', value: profile.location || 'Not set', icon: MapPin },
      { key: 'languages', label: 'Languages', value: (profile.languagesKnown || []).join(', ') || 'Not set', icon: Globe2 },
    ];
  }, [profile]);

  const interests = useMemo(() => {
    const interestMap = {
      Travel: { label: 'Travel', icon: Globe2 },
      Movies: { label: 'Movies', icon: Film },
      Parties: { label: 'Parties', icon: PartyPopper },
      Adventures: { label: 'Adventures', icon: Compass },
      Beach: { label: 'Beach', icon: Umbrella },
    };
    return (profile.interest || []).map((key) => ({ key: key.toLowerCase(), ...interestMap[key] }));
  }, [profile]);

  const handleEditPhotoClick = () => setShowUploadOptions(prev => !prev);
  const triggerGalleryUpload = () => { galleryInputRef.current?.click(); setShowUploadOptions(false); };
  const triggerCameraUpload = () => { cameraInputRef.current?.click(); setShowUploadOptions(false); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAvatar(url);
      // TODO: dispatch upload avatar thunk
    }
  };

  const handleEditBio = () => {
    const newBio = window.prompt('Update your bio:', localBio);
    if (newBio !== null) {
      setLocalBio(newBio);
      // TODO: dispatch update bio thunk
    }
  };

  const handleEditField = (key, currentValue) => {
    const newValue = window.prompt(
      `Update ${key.charAt(0).toUpperCase() + key.slice(1)}:`, currentValue
    );
    if (newValue !== null) {
      // TODO: dispatch(updateProfileField({ key, value: newValue }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <main className="flex-1 overflow-y-auto pb-20">
        <section className="relative bg-white px-5 pt-6 pb-8 border-b border-gray-200">
          {/* Back + Title */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-1 rounded-full hover:bg-gray-100"
            >
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
              <button onClick={handleEditPhotoClick} className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow" aria-label="Edit profile picture">
                <Edit2 size={16} className="text-gray-600" />
              </button>
              <input type="file" accept="image/*" ref={galleryInputRef} onChange={handlePhotoChange} className="hidden" />
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handlePhotoChange} className="hidden" />
              {showUploadOptions && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-lg z-10 w-52">
                  <h3 className="text-center font-semibold mb-2">Upload Photo</h3>
                  <button onClick={triggerCameraUpload} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">Use Camera</button>
                  <button onClick={triggerGalleryUpload} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">Choose from Gallery</button>
                  <button onClick={() => setShowUploadOptions(false)} className="w-full py-2 bg-red-100 rounded-lg hover:bg-red-200">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          <section className="bg-gray-100 rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>
                <p className="mt-2 text-sm text-gray-600">{localBio}</p>
              </div>
              <button onClick={handleEditBio} className="text-pink-600 text-sm font-medium hover:underline">Edit</button>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">About Me</h2>
            </div>
            {fields.map(({ key, label, value, icon: Icon }) => (
              <div key={key} onClick={() => handleEditField(key, value)} className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition cursor-pointer">
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
              <button className="text-pink-600 text-sm font-medium hover:underline">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition">
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

export default ProfileEditPage;
