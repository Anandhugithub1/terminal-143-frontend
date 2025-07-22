// Step2Bio.jsx
import React from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';

const STD_STATUS = [
  { label: 'Positive',       value: 'p'  },
  { label: 'Negative',       value: 'n'  },
  { label: 'Prefer not to say', value: 'pns' },
];

const LANGUAGES = [
  { label: 'English',   value: 'en' },
  { label: 'Spanish',   value: 'es' },
  { label: 'French',    value: 'fr' },
  { label: 'German',    value: 'de' },
  { label: 'Mandarin',  value: 'zh' },
  { label: 'Thai',      value: 'th' },
  { label: 'Russian',   value: 'ru' },
  { label: 'Italian',   value: 'it' },
  { label: 'Portuguese',value: 'pt' },
  { label: 'Japanese',  value: 'jp' },
  { label: 'Korean',    value: 'kr' },
  { label: 'Hindi',     value: 'hi' },
  { label: 'Arabic',    value: 'ar' },
  { label: 'Bengali',   value: 'bn' },
  { label: 'Urdu',      value: 'ur' },
  { label: 'Turkish',   value: 'tr' },
  { label: 'Vietnamese',value: 'vi' },
  { label: 'Polish',    value: 'pl' },
  { label: 'Dutch',     value: 'nl' },
  { label: 'Hebrew',    value: 'he' },
  { label: 'Swedish',   value: 'sv' },
  { label: 'Greek',     value: 'el' },
];

export default function Step2Bio() {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus      = formData.healthStatus || { stdStatus: '', lastTestedDate: '' };
  const selectedLanguages = formData.languagesKnown || [];

  const handleNext = () => navigate('/complete/photo');
  const handleBack = () => navigate('/complete/basic');

  const handleBioChange = e => {
    const bio = e.target.value;
    if (bio.length <= charLimit) setFormData({ ...formData, bio });
  };

  const handleLanguagesChange = e => {
    const options = Array.from(e.target.selectedOptions);
    const values  = options.map(o => o.value);
    setFormData({ ...formData, languagesKnown: values });
  };

  const handleStatusChange = e => {
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, stdStatus: e.target.value },
    });
  };

  const handleDateChange = e => {
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, lastTestedDate: e.target.value },
    });
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto p-4">
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
        <select
          multiple
          value={selectedLanguages}
          onChange={handleLanguagesChange}
          className="w-full h-40 p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {LANGUAGES.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Hold <kbd className="px-1 bg-gray-200 rounded">Ctrl</kbd> (or <kbd className="px-1 bg-gray-200 rounded">⌘</kbd> on Mac) to select multiple.
        </p>
      </div>

      {/* STD Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="" disabled>
            Select your STD status
          </option>
          {STD_STATUS && statusOptions.length
            ? statusOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))
            : null}
        </select>
      </div>

      {/* Last Tested Date */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Last Tested Date 🗓️</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
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
}
