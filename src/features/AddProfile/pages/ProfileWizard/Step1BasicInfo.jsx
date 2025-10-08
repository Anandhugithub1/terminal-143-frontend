import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../../../contexts/ProfileWizard';
import { InputField } from '../../../../shared/common';
import { ProgressBar } from './Progess';

import PreferenceCheckbox from '../../components/PreferenceCheckbox';
import SocialLinkInput from '../../components/SocialLinkInput';
import SocialLinkChip from '../../components/SocialLinkChip';

import { calculateAge, validateLink, PREFERENCES, SOCIAL_PLATFORMS } from '../../utlis';
import { useTranslation } from 'react-i18next';

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialInput, setSocialInput] = useState('');

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
    navigate('/complete/bio');
  };

  const handlePreferenceChange = (value) => {
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
      <ProgressBar step={1} totalSteps={4} />
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <InputField
          id="fullName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('fullName')}
          className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
        />

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
            {t('dob')}
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('preferencesTitle')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PREFERENCES).map(([label, value]) => (
              <PreferenceCheckbox
                key={value}
                label={label}
                value={value}
                checked={(formData.preferences || []).includes(value)}
                onChange={() => handlePreferenceChange(value)}
              />
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
            <div className="flex flex-wrap gap-2">
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

      <button
        onClick={handleNext}
        className="mt-8 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg shadow-pink-500/20"
      >
        {t('continue')}
      </button>
    </div>
  );
};

export default Step1BasicInfo;
