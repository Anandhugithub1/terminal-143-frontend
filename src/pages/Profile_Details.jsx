import React, { useState, useRef, useEffect } from 'react';
import { InputField } from '../shared/common';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/State';

export const ProfileDetails = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoFileName, setPhotoFileName] = useState(''); // to store the selected file name
  const [interests, setInterests] = useState('');
  const [languages, setLanguages] = useState('');
  const [error, setError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { accessToken } = useAuth(); // Get token from context

  // Refs for hidden file inputs
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    setIsMobile(/Android(?!.*Mobile)|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent));
  }, []);

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPhotoFileName(file.name);
      setShowUploadOptions(false);
      console.log('Selected file:', file);
    }
  };

  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');

    try {
      let photoUrl = '';

      // If a profile photo is selected, upload it to S3 using a pre-signed URL from the backend
      if (profilePhoto) {
        // 1. Request a pre-signed URL
        const presignResponse = await fetch('http://localhost:3000/api/users/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          // Only fileType is needed since the backend generates a unique filename
          body: JSON.stringify({
            fileType: profilePhoto.type,
          }),
        });

        // Try parsing response as JSON; if it fails, read it as text to log better error details
        let presignData;
        const contentType = presignResponse.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          presignData = await presignResponse.json();
        } else {
          const text = await presignResponse.text();
          throw new Error(text || 'Failed to get pre-signed URL');
        }

        if (!presignResponse.ok) {
          throw new Error(presignData.error || 'Could not get pre-signed URL');
        }

        const { presignedUrl, publicUrl } = presignData;

        // 2. Upload the file to S3 using the pre-signed URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': profilePhoto.type,
          },
          body: profilePhoto,
        });

        if (!uploadResponse.ok) {
            const errText = await uploadResponse.text();

          throw new Error(`Failed to upload image to S3: ${uploadResponse.statusText} - ${errText}`);
          
        }

        // Use the returned public URL
        photoUrl = publicUrl;
      }

      // Prepare profile details payload, including photoUrl if available
      const profilePayload = {
        name,
        bio,
        age,
        interests,
        languages,
        photo: photoUrl,
      };

      // 3. Send profile details to the backend (to update DynamoDB)
      const profileResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profilePayload),
      });

      const result = await profileResponse.json();

      if (!profileResponse.ok) {
        setError(result.error || 'Profile update failed');
      } else {
        console.log('Profile updated successfully', result);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred, please try again');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8">
        {/* Skip Option */}
        <div className="absolute top-4 right-4">
          <Link
            to="/dashboard"
            className="flex items-center text-sm text-pink-600 font-semibold hover:underline"
          >
            Skip for now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Header / Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
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
            placeholder="Full Name"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short Bio"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={3}
            required
          />

          <InputField
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
          />

          {/* Upload Profile Photo Section */}
          <div className="space-y-2">
            <label className="block text-gray-500 text-sm mb-1">
              Upload Profile Photo
            </label>
            <button
              type="button"
              onClick={() => setShowUploadOptions(true)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Choose Photo
            </button>
            {photoFileName && (
              <p className="text-sm text-gray-600 mt-1">Selected: {photoFileName}</p>
            )}
          </div>

          {/* Hidden File Inputs */}
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

          <InputField
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Interests (comma separated)"
          />

          <InputField
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Languages Known (comma separated)"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Save Profile
          </button>
        </form>

        {/* Modal for Upload Options */}
        {showUploadOptions && (
          <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b bg-opacity-20 z-10">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Choose Upload Option
              </h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openGallery}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Upload from Gallery
                </button>
                {isMobile && (
                  <button
                    type="button"
                    onClick={openCamera}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Upload using Camera
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUploadOptions(false)}
                  className="w-full text-gray-600 py-2 px-4 rounded-xl hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
