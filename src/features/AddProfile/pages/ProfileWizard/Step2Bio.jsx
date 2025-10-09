// Step2Bio.jsx
import React, { useState, useEffect, useRef } from 'react';
// import { useWizard } from '../../contexts/ProfileWizard';
import { useWizard } from '../../contexts/ProfileWizard';

import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { statusOptions,LANGUAGES } from '../../utlis';


export default function Step2Bio() {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus = formData.healthStatus || { stdStatus: '', lastTestedDate: '' };

  // Keep languages as array of objects
  const [selectedLanguages, setSelectedLanguages] = useState(
    LANGUAGES.filter(l => formData.languagesKnown?.includes(l.value))
  );
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Sync initial formData -> state
  useEffect(() => {
    setSelectedLanguages(
      LANGUAGES.filter(l => formData.languagesKnown?.includes(l.value))
    );
  }, [formData.languagesKnown]);

  // Close when clicking outside
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLanguage = lang => {
    setSelectedLanguages(prev =>
      prev.find(l => l.value === lang.value)
        ? prev.filter(l => l.value !== lang.value)
        : [...prev, lang]
    );
  };

  const handleNext = () => {
    setFormData({
      ...formData,
      languagesKnown: selectedLanguages.map(l => l.value),
    });
    navigate('/complete/photo');
  };
  const handleBack = () => navigate('/complete/basic');

  const handleBioChange = e => {
    const bio = e.target.value;
    if (bio.length <= charLimit) setFormData({ ...formData, bio });
  };
  const handleStatusChange = e =>
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, stdStatus: e.target.value },
    });
  const handleDateChange = e =>
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, lastTestedDate: e.target.value },
    });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 animate-fade-in">
      <ProgressBar step={2} totalSteps={4} />

      {/* Bio */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Your Story 💬</h2>
        <textarea
          value={formData.bio || ''}
          onChange={handleBioChange}
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
        />
        <div className="text-right text-sm text-gray-400">
          {(formData.bio?.length || 0)}/{charLimit}
        </div>
      </div>

      {/* Languages */}
      <div ref={menuRef} className="relative">
        <h3 className="mb-2 font-semibold">Languages You Know 🌐</h3>
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex w-full justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          {selectedLanguages.length
            ? selectedLanguages.map(l => l.label).join(', ')
            : 'Select languages...'}
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
            {LANGUAGES.map(lang => {
              const isSelected = selectedLanguages.some(l => l.value === lang.value);
              return (
                <div
                  key={lang.value}
                  onClick={() => toggleLanguage(lang)}
                  className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                    isSelected ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.label}</span>
                  {isSelected && <CheckIcon className="w-5 h-5 text-pink-500" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STD Status */}
      <div className="space-y-1">
        <h3 className="font-semibold">STD Status 🧬</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
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

      {/* Date */}
      <div className="space-y-1">
        <h3 className="font-semibold">Last Tested Date 🗓️</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
        />
      </div>

      {/* Nav */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
