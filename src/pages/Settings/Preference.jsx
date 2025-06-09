// src/pages/PreferencesPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, UserPlus, Heart, Smile, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PrimaryButton, SecondaryButton } from '../../shared/Button';
import { fetchProfile, updateProfilePreferences } from '../../features/UserProfile'; // assuming updateProfilePreferences exists
import '@fontsource-variable/inter';

const PREFERENCES = [
  { label: 'Male', value: 'M', icon: <User size={20} /> },
  { label: 'Female', value: 'F', icon: <UserPlus size={20} /> },
  { label: 'To Female', value: 'tF', icon: <Heart size={20} /> },
  { label: 'To Male', value: 'tM', icon: <Smile size={20} /> },
  { label: 'Others', value: 'Ot', icon: <Star size={20} /> },
];

const PreferencesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const [selectedPreferences, setSelectedPreferences] = useState([]);

  // Load profile when idle
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  // When profile loaded → sync preferences
  useEffect(() => {
    if (profile?.preferences) {
      setSelectedPreferences(profile.preferences);
    }
  }, [profile?.preferences]);

  const togglePreference = (value) => {
    setSelectedPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSave = () => {
    // Call redux action to update profile
    dispatch(updateProfilePreferences(selectedPreferences))
      .then(() => {
        navigate(-1); // Go back after saving
      })
      .catch((err) => {
        console.error('Failed to update preferences', err);
      });
  };

  return (
    <div className="min-h-screen bg-white font-inter relative">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Preferences</h1>
      </header>

      <div className="p-4">
        <h2 className="text-gray-700 text-md font-medium mb-4">Select your preferences:</h2>

        <nav className="space-y-3">
          {PREFERENCES.map(({ label, value, icon }) => {
            const isSelected = selectedPreferences.includes(value);

            return (
              <button
                key={value}
                onClick={() => togglePreference(value)}
                className={`flex w-full items-center space-x-3 p-3 border rounded-lg transition text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white border-transparent shadow-lg'
                    : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={isSelected ? 'text-white' : 'text-gray-600'}>{icon}</div>
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <PrimaryButton onClick={handleSave} to="#">
            Save Preferences
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate(-1)} to="#">
            Cancel
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
