/* ========== Step2Bio.jsx ========== */
import React from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import ReactCountryFlag from 'react-country-flag';

const LANGUAGES = {
  ENGLISH: 'en',
  THAI: 'th',
  RUSSIAN: 'ru',
  CHINESE: 'zh',
  SPANISH: 'es',
  MEXICAN: 'mx',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  FRENCH: 'fr',
  GERMAN: 'de',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  ARABIC: 'ar',
  VIETNAMESE: 'vi',
  TURKISH: 'tr',
  TAMIL: 'ta',
  URDU: 'ur',
  DUTCH: 'nl',
  GREEK: 'el',
  POLISH: 'pl',
  SWEDISH: 'sv',
  HEBREW: 'he',
  INDONESIAN: 'id',
  FILIPINO: 'fil',
  MALAY: 'ms',
  UKRAINIAN: 'uk',
  CZECH: 'cs',
  ROMANIAN: 'ro',
  HUNGARIAN: 'hu',
  DANISH: 'da',
  NORWEGIAN: 'no',
  FINNISH: 'fi',
};

const STD_STATUS = {
  POSITIVE: 'p',
  NEGATIVE: 'n',
  PREFER_NOT_TO_SAY: 'pns',
};

const languageOptions = [
  { label: 'English', value: LANGUAGES.ENGLISH, countryCode: 'GB' },
  { label: 'Spanish', value: LANGUAGES.SPANISH, countryCode: 'ES' },
  { label: 'French', value: LANGUAGES.FRENCH, countryCode: 'FR' },
  { label: 'German', value: LANGUAGES.GERMAN, countryCode: 'DE' },
  { label: 'Mandarin', value: LANGUAGES.CHINESE, countryCode: 'CN' },
  { label: 'Thai', value: LANGUAGES.THAI, countryCode: 'TH' },
  { label: 'Russian', value: LANGUAGES.RUSSIAN, countryCode: 'RU' },
  { label: 'Mexican', value: LANGUAGES.MEXICAN, countryCode: 'MX' },
  { label: 'Italian', value: LANGUAGES.ITALIAN, countryCode: 'IT' },
  { label: 'Portuguese', value: LANGUAGES.PORTUGUESE, countryCode: 'PT' },
  { label: 'Japanese', value: LANGUAGES.JAPANESE, countryCode: 'JP' },
  { label: 'Korean', value: LANGUAGES.KOREAN, countryCode: 'KR' },
  { label: 'Arabic', value: LANGUAGES.ARABIC, countryCode: 'SA' },
  { label: 'Vietnamese', value: LANGUAGES.VIETNAMESE, countryCode: 'VN' },
  { label: 'Turkish', value: LANGUAGES.TURKISH, countryCode: 'TR' },
  { label: 'Tamil', value: LANGUAGES.TAMIL, countryCode: 'IN' },
  { label: 'Dutch', value: LANGUAGES.DUTCH, countryCode: 'NL' },
  { label: 'Greek', value: LANGUAGES.GREEK, countryCode: 'GR' },
  { label: 'Polish', value: LANGUAGES.POLISH, countryCode: 'PL' },
  { label: 'Swedish', value: LANGUAGES.SWEDISH, countryCode: 'SE' },
  { label: 'Hebrew', value: LANGUAGES.HEBREW, countryCode: 'IL' },
  { label: 'Indonesian', value: LANGUAGES.INDONESIAN, countryCode: 'ID' },
  { label: 'Filipino', value: LANGUAGES.FILIPINO, countryCode: 'PH' },
  { label: 'Malay', value: LANGUAGES.MALAY, countryCode: 'MY' },
  { label: 'Ukrainian', value: LANGUAGES.UKRAINIAN, countryCode: 'UA' },
  { label: 'Czech', value: LANGUAGES.CZECH, countryCode: 'CZ' },
  { label: 'Romanian', value: LANGUAGES.ROMANIAN, countryCode: 'RO' },
  { label: 'Hungarian', value: LANGUAGES.HUNGARIAN, countryCode: 'HU' },
  { label: 'Danish', value: LANGUAGES.DANISH, countryCode: 'DK' },
  { label: 'Norwegian', value: LANGUAGES.NORWEGIAN, countryCode: 'NO' },
  { label: 'Finnish', value: LANGUAGES.FINNISH, countryCode: 'FI' },
];

const statusOptions = [
  { label: 'Positive', value: STD_STATUS.POSITIVE },
  { label: 'Negative', value: STD_STATUS.NEGATIVE },
  { label: 'Prefer not to say', value: STD_STATUS.PREFER_NOT_TO_SAY },
];

const Step2Bio = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus = formData.healthStatus || {
    stdStatus: '',
    lastTestedDate: '',
  };

  const handleNext = () => navigate('/complete/photo');
  const handleBack = () => navigate('/complete/basic');

  const toggleLanguage = (code) => {
    const known = formData.languagesKnown || [];
    const updated = known.includes(code)
      ? known.filter((c) => c !== code)
      : [...known, code];
    setFormData({ ...formData, languagesKnown: updated });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        stdStatus: e.target.value,
      },
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        lastTestedDate: e.target.value,
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={2} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Story 💬</h2>
        <p className="text-gray-500">What makes you unique?</p>
      </div>

      {/* Bio Field */}
      <div className="relative mb-8">
        <textarea
          value={formData.bio || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value.slice(0, charLimit),
            })
          }
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-400">
          {(formData.bio?.length || 0)}/{charLimit}
        </div>
      </div>

      {/* Languages Known */}
      {/* Languages Known */}
<div className="mb-6">
  <h3 className="text-md font-semibold mb-2">Languages You Know 🌐</h3>
  <select
    multiple
    value={formData.languagesKnown || []}
    onChange={(e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      setFormData({ ...formData, languagesKnown: selectedOptions });
    }}
    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300 h-[200px]"
  >
    {languageOptions.map(({ label, value }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
  <p className="text-sm text-gray-400 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
</div>


      {/* STD Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        >
          <option value="" disabled>
            Select your STD status
          </option>
          {statusOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Last Tested Date */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Last Tested Date 🗓️</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Bio;
