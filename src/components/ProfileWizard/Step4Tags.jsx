import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { useAuth } from '../../pages/Auth/State';
import { useState } from 'react';

const categories = {
  '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
  '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
  '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert']
};

export default function Step4Tags() {
  const { formData, setFormData } = useWizard();
  const { userType, accessToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (category, value) => {
    const current = formData[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [category]: updated });
  };

  const handleBack = () => navigate('/complete/photo');

  // Flatten selected tags across all categories
  const selectedInterests = Object.entries(categories).flatMap(([cat]) => formData[cat] || []);

  const uploadToS3 = async (file) => {
    const res = await fetch('http://localhost:4000/api/users/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fileType: file.type }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    const { presignedUrl, publicUrl } = await res.json();

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Failed to upload file');
    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Upload photos if any, but do not display them in UI
      let photoUrls = [];
      if (userType === 'mp') {
        const files = formData.profilePhotos || [];
        for (const file of files) {
          const url = await uploadToS3(file);
          photoUrls.push(url);
        }
      } else {
        const file = formData.profilePhoto;
        if (file) {
          const url = await uploadToS3(file);
          photoUrls.push(url);
        }
      }

      // Prepare payload
      const payload = {
        name: formData.name || '',
        age: formData.dob || '',
        location: formData.location || '',
        interest: selectedInterests,
        bio: formData.bio || '',
        gender: formData.gender || '',
        popularity: formData.popularity || 0,
      };
      if (userType === 'mp') {
        payload.photos = photoUrls;
      } else {
        payload.photo = photoUrls[0] || '';
      }

      const response = await fetch('http://localhost:4000/api/users/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-user-type': userType,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error: msg } = await response.json();
        throw new Error(msg || 'Profile update failed');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Touch! 🌟</h2>
        <p className="text-gray-500">Select your interests to find better matches</p>
      </div>

      {/* Image previews removed: uploaded images are hidden in this step */}

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
            <div className="flex flex-wrap gap-3">
              {items.map(item => (
                <button
                  key={item}
                  onClick={() => toggle(title, item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    formData[title]?.includes(item)
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
