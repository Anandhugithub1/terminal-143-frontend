import React, { useMemo } from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import ReactCountryFlag from 'react-country-flag';
import Select from 'react-select';

const STD_STATUS = {
  POSITIVE: 'p',
  NEGATIVE: 'n',
  PREFER_NOT_TO_SAY: 'pns',
};

const extendedLanguageOptions = [
  { label: 'English', value: 'gb' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Mandarin', value: 'cn' },
  { label: 'Thai', value: 'th' },
  { label: 'Russian', value: 'ru' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'jp' },
  { label: 'Korean', value: 'kr' },
  { label: 'Hindi', value: 'in' },
  { label: 'Arabic', value: 'sa' },
  { label: 'Bengali', value: 'bd' },
  { label: 'Urdu', value: 'pk' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Vietnamese', value: 'vn' },
  { label: 'Polish', value: 'pl' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Hebrew', value: 'il' },
  { label: 'Swedish', value: 'se' },
  { label: 'Greek', value: 'gr' },
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

  const healthStatus = formData.healthStatus || { stdStatus: '', lastTestedDate: '' };
  const selectedLanguages = formData.languagesKnown || [];

  const handleNext = () => navigate('/complete/photo');
  const handleBack = () => navigate('/complete/basic');

  const handleBioChange = (e) => {
    const bio = e.target.value;
    if (bio.length <= charLimit) {
      setFormData({ ...formData, bio });
    }
  };

  const handleLanguagesChange = (selected) => {
    const values = selected?.map((opt) => opt.value) || [];
    setFormData({ ...formData, languagesKnown: values });
  };

  const handleStatusChange = (selected) => {
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, stdStatus: selected?.value || '' },
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, lastTestedDate: e.target.value },
    });
  };

  const languageOptions = useMemo(
    () => extendedLanguageOptions.map(({ label, value }) => ({ label, value })),
    []
  );

  const formatOptionLabel = ({ label, value }) => (
    <div className="flex items-center gap-2">
      <ReactCountryFlag
        countryCode={value.toUpperCase()}
        svg
        style={{ width: '1.2em', height: '1.2em' }}
      />
      {label}
    </div>
  );

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
          onChange={handleBioChange}
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-400">
          {(formData.bio?.length || 0)}/{charLimit}
        </div>
      </div>

      {/* Languages Known */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Languages You Know 🌐</h3>
        <Select
          options={languageOptions}
          value={languageOptions.filter((opt) => selectedLanguages.includes(opt.value))}
          onChange={handleLanguagesChange}
          placeholder="Select languages"
          isSearchable
          isMulti
          className="mb-4"
          classNamePrefix="react-select"
          formatOptionLabel={formatOptionLabel}
        />

        {/* Selected Languages Pills */}
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((code) => {
            const lang = extendedLanguageOptions.find((l) => l.value === code);
            return (
              <button
                key={code}
                onClick={() =>
                  handleLanguagesChange(
                    selectedLanguages
                      .filter((c) => c !== code)
                      .map((val) => ({ label: val, value: val }))
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-pink-500 text-white"
              >
                <ReactCountryFlag
                  countryCode={code.toUpperCase()}
                  svg
                  style={{ width: '1.2em', height: '1.2em' }}
                />
                {lang?.label || code}
              </button>
            );
          })}
        </div>
      </div>

      {/* STD Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <Select
          options={statusOptions}
          value={statusOptions.find((opt) => opt.value === healthStatus.stdStatus) || null}
          onChange={handleStatusChange}
          placeholder="Select your STD status"
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
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
