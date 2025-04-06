import React, { useState, useRef, useEffect } from 'react';
import { InputField } from '../shared/common';
import { Link } from 'react-router-dom';
import { useAuth } from './Auth/State';
import { TagSection } from '../components/Tags';
const predefinedInterests = ['Travel', 'Music', 'Sports', 'Reading', 'Cooking', 'Photography', 'Art', 'Technology'];
const predefinedLanguages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic', 'Portuguese'];

export const ProfileDetails = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [interests, setInterests] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // const navigate = useNavigate();
  const { accessToken } = useAuth();

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    setIsMobile(/Android(?!.*Mobile)|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      setShowUploadOptions(false);
    }
  };

  const toggleOption = (option, list, setter) => {
    setter(prev => prev.includes(option)
      ? prev.filter(item => item !== option)
      : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');

    try {
      let photoUrl = '';
      if (profilePhoto) {
        // Presigned URL and upload logic remains the same
      }

      const profilePayload = {
        name,
        bio,
        age,
        interests: interests.join(', '),
        languages: languages.join(', '),
        photo: photoUrl,
      };

      // Submit profile logic remains the same
      
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8">
        <div className="absolute top-4 right-4">
          <Link to="/dashboard" className="flex items-center text-sm text-pink-600 font-semibold hover:underline">
            Skip for now
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name *"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short Bio"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={3}
          />

          <InputField
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            min="18"
            max="100"
          />

          <div className="space-y-2">
            <label className="block text-gray-500 text-sm mb-1">Profile Photo</label>
            <button
              type="button"
              onClick={() => setShowUploadOptions(true)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Choose Photo
            </button>
            {profilePhotoPreview && (
              <img
                src={profilePhotoPreview}
                alt="Preview"
                className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-pink-100"
              />
            )}
          </div>

          <TagSection
            label="Interests"
            predefinedOptions={predefinedInterests}
            selectedOptions={interests}
            onToggle={(option) => toggleOption(option, interests, setInterests)}
          />

          <TagSection
            label="Languages Known"
            predefinedOptions={predefinedLanguages}
            selectedOptions={languages}
            onToggle={(option) => toggleOption(option, languages, setLanguages)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Save Profile
          </button>
        </form>

        {/* Upload Options Modal */}
        {showUploadOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Photo</h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full bg-pink-500 text-white py-2 px-4 rounded-xl hover:bg-pink-600 transition-colors"
                >
                  From Gallery
                </button>
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    Take Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUploadOptions(false)}
                  className="w-full text-gray-600 py-2 px-4 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};



export default ProfileDetails;
