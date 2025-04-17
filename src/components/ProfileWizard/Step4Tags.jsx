import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { useAuth } from '../../pages/Auth/State';
import { useState } from 'react';
import axios from 'axios';

const categories = {
  '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
  '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
  '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert'],
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

  const selectedInterests = Object.entries(categories).flatMap(([cat]) => formData[cat] || []);

  const uploadToS3 = async (file) => {
    const { data: { presignedUrl, publicUrl } } = await axios.post(
      'http://localhost:4000/api/users/presigned-url',
      { fileType: file.type },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const uploadRes = await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    if (uploadRes.status !== 200) throw new Error('Failed to upload file');
    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
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

      const payload = {
        name: formData.name || '',
        age: formData.dob || '',
        location: formData.location || '',
        interest: selectedInterests,
        bio: formData.bio || '',
        gender: formData.gender || '',
        popularity: formData.popularity || 0,
        ...(userType === 'mp' ? { photos: photoUrls } : { photo: photoUrls[0] || '' }),
      };

      const response = await axios.post(
        'http://localhost:4000/api/users/complete-profile',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-user-type': userType,
          },
        }
      );

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
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
