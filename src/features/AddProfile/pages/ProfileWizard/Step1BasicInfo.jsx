import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/ProfileWizard';
import { InputField } from '../../../../shared/common';
import { ProgressBar } from './Progess';
import {Button} from '../../../../shared/Button'
import SocialLinkInput from '../../components/SocialLinkInput';
import SocialLinkChip from '../../components/SocialLinkChip';
import { AiOutlineCalendar } from 'react-icons/ai';
import { useRef } from 'react';

import { calculateAge, validateLink, PREFERENCES, SOCIAL_PLATFORMS } from '../../utlis';
import { useTranslation } from 'react-i18next';

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialInput, setSocialInput] = useState('');
const dobRef = useRef(null);

  const { t } = useTranslation('common');

  const currentYear = new Date().getFullYear();
  const minDob = '1950-01-01';
  const maxDob = `${currentYear}-12-31`;

  const handleNext = () => {
    if (!formData.name.trim()) return setError(t('nameError'));
    if (!formData.dob) return setError(t('dobRequired'));

    const age = calculateAge(formData.dob);
    if (age < 18) return setError(t('dobError'));

    if (!formData.preferences || formData.preferences.length === 0)
      return setError(t('preferencesRequired'));

    setError('');
    navigate('/complete/location');
  };

  const togglePreference = (value) => {
    const prefs = formData.preferences || [];
    setFormData({
      ...formData,
      preferences: prefs.includes(value)
        ? prefs.filter((p) => p !== value)
        : [...prefs, value],
    });
  };

  const addSocialLink = () => {
    const trimmed = socialInput.trim();
    if (!socialPlatform || !trimmed) return;
    if (!validateLink(trimmed)) return setError(t('invalidLink'));

    const updated = [
      ...(formData.socialMediaLinks || []),
      { platform: socialPlatform, usernameOrLink: trimmed },
    ];
    setFormData({ ...formData, socialMediaLinks: updated });
    setSocialInput('');
    setSocialPlatform('');
    setError('');
  };

  const removeSocialLink = (index) => {
    const updated = [...(formData.socialMediaLinks || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, socialMediaLinks: updated });
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={1} totalSteps={5} />
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <InputField
          id="fullName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('fullName')}
          className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
        />

        {/* Date of Birth */}
<div>
  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
    {t('dob')}
  </label>

  <div className="relative mt-1">
    <InputField
      ref={dobRef}
      id="dob"
      type="date"
      value={formData.dob}
      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
      min={minDob}
      max={maxDob}
      className="w-full p-4 pr-11 border-0 bg-gray-50 rounded-xl
                 focus:ring-2 focus:ring-pink-500 appearance-none with-custom-date-icon"
    />

    <button
      type="button"
      className="absolute right-4 top-1/2 -translate-y-1/2"
      onClick={() => {
        if (dobRef.current?.showPicker) {
          // Modern browsers
          dobRef.current.showPicker();
        } else {
          // Fallback
          dobRef.current?.focus();
        }
      }}
    >
      <AiOutlineCalendar className="text-gray-400" size={20} />
    </button>
  </div>
</div>



        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Preferences as Chips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('preferencesTitle')}
          </label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(PREFERENCES).map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => togglePreference(value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  (formData.preferences || []).includes(value)
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('socialLabel')}{' '}
            <span className="text-xs text-gray-400">{t('socialOptional')}</span>
          </label>

          <SocialLinkInput
            platforms={SOCIAL_PLATFORMS}
            selectedPlatform={socialPlatform}
            input={socialInput}
            onPlatformChange={(e) => setSocialPlatform(e.target.value)}
            onInputChange={(e) => setSocialInput(e.target.value)}
            onAdd={addSocialLink}
            disabled={!socialPlatform || !socialInput.trim()}
          />

          {formData.socialMediaLinks?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.socialMediaLinks.map((link, idx) => (
                <SocialLinkChip
                  key={idx}
                  platform={link.platform}
                  usernameOrLink={link.usernameOrLink}
                  onRemove={() => removeSocialLink(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

   <Button
  onClick={handleNext}
  className="mt-8 py-4"
>
  {t('continue')}
</Button>

    </div>
  );
};

export default Step1BasicInfo;
