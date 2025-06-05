import { useState } from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../shared/common';
import { ProgressBar } from './Progess';

// Preference options (multi-select)
const PREFERENCES = {
  MALE: 'M',
  FEMALE: 'F',
  TO_FEMALE: 'tF',  // Ladyboy, Shemale, Trans Women
  TO_MALE: 'tM',    // Trans Man, Tomboy
  OTHERS: 'Ot',
};

// Helper to calculate age from date string (YYYY-MM-DD)
const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const minDob = '1950-01-01';
  const maxDob = `${currentYear}-12-31`;

  const handleNext = () => {
    // Name required
    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }
    // Age validation
    const age = calculateAge(formData.dob);
    if (age < 18) {
      setError('You must be at least 18 years old to continue.');
      return;
    }
    // Clear errors and proceed
    setError('');
    navigate('/complete/bio');
  };

  const handlePreferenceChange = (value) => {
    const current = formData.preferences || [];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        preferences: current.filter((p) => p !== value),
      });
    } else {
      setFormData({
        ...formData,
        preferences: [...current, value],
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={1} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome! 👋</h2>
        <p className="text-gray-500">Let's start with the basics</p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <InputField
            id="fullName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name *"
            className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <InputField
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            placeholder="Date of Birth"
            min={minDob}
            max={maxDob}
            className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Preferences (Multi-checkbox) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who are you interested in?
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PREFERENCES).map(([label, value]) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={value}
                  checked={(formData.preferences || []).includes(value)}
                  onChange={() => handlePreferenceChange(value)}
                  className="h-5 w-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-700">
                  {label.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleNext}
        className="mt-8 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg shadow-pink-500/20"
      >
        Continue
      </button>
    </div>
  );
};

export default Step1BasicInfo;
