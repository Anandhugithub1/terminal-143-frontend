/* ========== Step4Tags.jsx ========== */
import React from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { useDispatch, useSelector } from 'react-redux';
import {
  uploadProfileImage,
  completeProfile,
} from '../../features/UserProfile';

const categories = {
  '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
  '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
  '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert'],
};

export default function Step4Tags() {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userType = localStorage.getItem('userType');

  const { completeStatus, error: apiError } = useSelector(
    (s) => s.userProfile
  );

  // Toggle tag selection
  const toggle = (category, value) => {
    const current = formData[category] || [];
    setFormData({
      ...formData,
      [category]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const selectedInterests = Object.entries(categories).flatMap(
    ([cat]) => formData[cat] || []
  );

  const handleBack = () => navigate('/complete/photo');

  const handleSubmit = async () => {
    try {
      // 1) Upload photos and collect URLs in correct order
      const photoUrls = [];
      if (userType === 'mp' && formData.profilePhotos?.length) {
        for (let i = 0; i < formData.profilePhotos.length; i++) {
          const { publicUrl } = await dispatch(
            uploadProfileImage({
              file: formData.profilePhotos[i],
              photoIndex: i,
            })
          ).unwrap();
          photoUrls.push(publicUrl);
        }
      } else if (formData.profilePhoto) {
        const { publicUrl } = await dispatch(
          uploadProfileImage({ file: formData.profilePhoto, photoIndex: 0 })
        ).unwrap();
        photoUrls.push(publicUrl);
      }

      // 2) Build payload to match backend schema
      const payload = {
        ...formData,
        interest: selectedInterests,
      };
      if (userType === 'mp') {
        payload.photos = photoUrls;            // array of strings
      } else {
        payload.photo = photoUrls[0] || '';    // single string
      }

      // 3) Dispatch completion
      await dispatch(completeProfile(payload)).unwrap();
      navigate('/home');
    } catch (err) {
      console.error('Profile completion error:', err);
    }
  };

  const isLoading = completeStatus === 'loading';

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Final Touch! 🌟
        </h2>
        <p className="text-gray-500">
          Select your interests to find better matches
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {title}
            </h3>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => toggle(title, item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    formData[title]?.includes(item)
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {apiError && (
        <p className="mt-4 text-center text-red-500">{apiError}</p>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
                     text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
