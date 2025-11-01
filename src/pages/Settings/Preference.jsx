import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../shared/Button';
import { fetchProfile, updateProfile } from '../../features/UserProfile';
import '@fontsource-variable/inter';
import { useTranslation } from 'react-i18next';
import { User, UserPlus, Heart, Smile, Star } from 'lucide-react';

const PreferencesPage = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const PREFERENCES = [
    { label: t('male'), value: 'M', icon: <User size={20} /> },
    { label: t('female'), value: 'F', icon: <UserPlus size={20} /> },
    { label: t('toFemale'), value: 'tF', icon: <Heart size={20} /> },
    { label: t('toMale'), value: 'tM', icon: <Smile size={20} /> },
    { label: t('others'), value: 'Ot', icon: <Star size={20} /> },
  ];

  const [selectedPreference, setSelectedPreference] = useState('');
  const [initialPreference, setInitialPreference] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (profile?.preferences?.length === 1) {
      setSelectedPreference(profile.preferences[0]);
      setInitialPreference(profile.preferences[0]);
    }
  }, [profile?.preferences]);

  const handleSave = () => {
    if (!selectedPreference) return;
    dispatch(updateProfile({ preferences: [selectedPreference] }))
      .then(() => navigate(-1))
      .catch((err) => console.error('Failed to update preferences', err));
  };

  const hasChanged = selectedPreference && selectedPreference !== initialPreference;

  return (
    <div className="min-h-screen bg-white font-inter flex flex-col justify-between">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft size={22} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-5">
        <h2 className="text-gray-900 text-lg font-semibold mb-6">
          Choose Your Gender Preferences
        </h2>

        <div className="space-y-3">
          {PREFERENCES.map(({ label, value, icon }) => {
            const isSelected = selectedPreference === value;
            return (
              <button
                key={value}
                onClick={() => setSelectedPreference(value)}
                className={`w-full flex justify-between items-center px-4 py-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-pink-50 border-pink-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-gray-600 ${
                      isSelected ? 'text-pink-600' : ''
                    }`}
                  >
                    {icon}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      isSelected ? 'text-pink-600' : 'text-gray-800'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Right-side radio */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-pink-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Save Button (only visible when changed) */}
      {hasChanged && (
        <div className="px-5 pb-6 transition-all duration-300">
          <Button
            onClick={handleSave}
            className="w-full rounded-2xl py-3 text-base font-semibold bg-pink-500 text-white hover:bg-pink-600 transition-all duration-200"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreferencesPage;
