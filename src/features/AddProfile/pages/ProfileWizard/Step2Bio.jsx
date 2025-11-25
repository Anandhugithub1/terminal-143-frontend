// Step2Bio.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { Button } from '../../../../shared/Button';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { statusOptions } from '../../utlis';

export default function Step2Bio() {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus = formData.healthStatus || {
    stdStatus: '',
    lastTestedDate: '',
  };

  // Languages state
  const [languagesList, setLanguagesList] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef();

  // Fetch + normalize languages from CDN
  useEffect(() => {
    fetch(
      'https://d36zx1g74mcorc.cloudfront.net/website_files/languages/languages.json'
    )
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error('Languages JSON is not an array', data);
          return;
        }

        const normalised = data.map((item, index) => {
          // If it's just a string like "English"
          if (typeof item === 'string') {
            return { value: item, label: item };
          }

          // Try common field names
          const value =
            item.value ||
            item.code ||
            item.shortCode ||
            item.languageCode ||
            `lang-${index}`;
          const label =
            item.label ||
            item.name ||
            item.language ||
            item.nativeName ||
            value;

          return { value, label };
        });

        // Sort alphabetically by label for nicer UX
        normalised.sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
        );

        setLanguagesList(normalised);
      })
      .catch((err) => console.error('Failed to load languages', err));
  }, []);

  // Sync selectedLanguages ONCE when languages list is loaded
  useEffect(() => {
    if (!languagesList.length) return;
    if (!formData.languagesKnown?.length) return;

    setSelectedLanguages(
      languagesList.filter((l) => formData.languagesKnown.includes(l.value))
    );
  }, [languagesList]); // 👈 removed formData.languagesKnown here

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.find((l) => l.value === lang.value)
        ? prev.filter((l) => l.value !== lang.value)
        : [...prev, lang]
    );
  };

  const handleNext = () => {
    setFormData({
      ...formData,
      languagesKnown: selectedLanguages.map((l) => l.value),
    });
    navigate('/complete/photo');
  };

  const handleBack = () => navigate('/complete/basic');

  const handleBioChange = (e) => {
    const bio = e.target.value;
    if (bio.length <= charLimit) setFormData({ ...formData, bio });
  };

  const handleStatusChange = (e) =>
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, stdStatus: e.target.value },
    });

  const handleDateChange = (e) =>
    setFormData({
      ...formData,
      healthStatus: { ...healthStatus, lastTestedDate: e.target.value },
    });

  // Filtered languages based on search
  const filteredLanguages = languagesList.filter((lang) =>
    lang.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Button label: show a nice summary
  const languageButtonLabel = (() => {
    if (!selectedLanguages.length) return 'Select languages...';
    if (selectedLanguages.length <= 2) {
      return selectedLanguages.map((l) => l.label).join(', ');
    }
    const [first, second, ...rest] = selectedLanguages;
    return `${first.label}, ${second.label} +${rest.length} more`;
  })();

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 animate-fade-in">
      <ProgressBar step={3} totalSteps={5} />

      {/* Bio */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Your Story 💬</h2>
        <textarea
          value={formData.bio || ''}
          onChange={handleBioChange}
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[160px]"
        />
        <div className="text-right text-sm text-gray-400">
          {(formData.bio?.length || 0)}/{charLimit}
        </div>
      </div>

      {/* Languages */}
      <div ref={menuRef} className="relative">
        <h3 className="mb-2 font-semibold">🌐 Languages You Know</h3>

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex w-full justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <span className={selectedLanguages.length ? '' : 'text-gray-400'}>
            {languageButtonLabel}
          </span>
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </button>

        {/* Selected language chips */}
        {!!selectedLanguages.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedLanguages.map((lang) => (
              <span
                key={lang.value}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs border border-pink-100"
              >
                {lang.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLanguage(lang);
                  }}
                  className="focus:outline-none"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-72 overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search language..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Options list */}
            <div className="overflow-auto max-h-60">
              {filteredLanguages.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No languages found.
                </div>
              )}

              {filteredLanguages.map((lang, index) => {
                const value = lang.value ?? `lang-${index}`;
                const label = lang.label ?? value;
                const isSelected = selectedLanguages.some(
                  (l) => l.value === value
                );

                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => toggleLanguage({ value, label })}
                    className={`w-full flex justify-between items-center px-4 py-2 text-left text-sm cursor-pointer ${
                      isSelected
                        ? 'bg-pink-50 text-pink-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && <CheckIcon className="w-4 h-4 text-pink-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* STD Status */}
      <div className="space-y-1">
        <h3 className="font-semibold">🧬 STD Status</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
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
        <h3 className="font-semibold">🗓️ Last Tested Date</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={handleBack}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white"
        >
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 py-3 px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
