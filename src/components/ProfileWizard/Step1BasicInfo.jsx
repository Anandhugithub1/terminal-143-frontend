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

const SOCIAL_PLATFORMS = ['IG', 'FB', 'Telegram', 'Line', 'Wechat', 'Other'];

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialInput, setSocialInput] = useState('');

  const currentYear = new Date().getFullYear();
  const minDob = '1950-01-01';
  const maxDob = `${currentYear}-12-31`;

  const validateLink = (value) => {
    const urlPattern = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
    if (value.startsWith('http://')) return false;
    if (value.startsWith('https://')) return urlPattern.test(value);
    return true; // Allow usernames
  };

  const addSocialLink = () => {
    if (!socialPlatform || !socialInput.trim()) return;

    if (!validateLink(socialInput.trim())) {
      setError('Invalid link. Must be https:// or plain username.');
      return;
    }

    const updatedLinks = [
      ...(formData.socialMediaLinks || []),
      {
        platform: socialPlatform,
        usernameOrLink: socialInput.trim(),
      },
    ];

    setFormData({ ...formData, socialMediaLinks: updatedLinks });
    setSocialInput('');
    setSocialPlatform('');
    setError('');
  };

  const removeSocialLink = (index) => {
    const updated = [...(formData.socialMediaLinks || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, socialMediaLinks: updated });
  };

  const handleNext = () => {
    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }
    const age = calculateAge(formData.dob);
    if (age < 18) {
      setError('You must be at least 18 years old to continue.');
      return;
    }
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
        <InputField
          id="fullName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full Name *"
          className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
        />

        {/* DOB */}
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <InputField
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            min={minDob}
            max={maxDob}
            className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Preferences */}
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

        {/* Social Media Links */}

<div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Add Social Media Links <span className="text-xs text-gray-400">(optional)</span>
  </label>

  {/* Input Row */}
  <div className="flex flex-wrap items-center gap-2 mb-3">
    <div className="flex-1 min-w-[120px]">
      <select
        value={socialPlatform}
        onChange={e => setSocialPlatform(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        <option value="" disabled>Choose platform</option>
        {SOCIAL_PLATFORMS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
    <div className="flex-2 flex-grow min-w-[180px]">
      <input
        type="text"
        value={socialInput}
        onChange={e => setSocialInput(e.target.value)}
        placeholder="Username or https://link"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
    <button
      onClick={addSocialLink}
      disabled={!socialPlatform || !socialInput.trim()}
      className={`px-4 py-2 rounded-lg font-medium
        ${socialPlatform && socialInput.trim()
          ? 'bg-pink-500 text-white hover:bg-pink-600'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
    >
      Add
    </button>
  </div>

  {/* Validation Error */}
  {error && (
    <p className="text-xs text-red-600 mb-2">{error}</p>
  )}

  {/* Chips List */}
  {formData.socialMediaLinks?.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {formData.socialMediaLinks.map((link, idx) => (
        <span
          key={idx}
          className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
        >
          <strong className="uppercase">{link.platform}</strong>
          <span className="truncate max-w-[120px]">{link.usernameOrLink}</span>
          <button
            onClick={() => removeSocialLink(idx)}
            className="flex-none text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  )}
</div>

      </div>

      {/* Continue */}
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
