import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';

// Supported languages
const LANGUAGES = [
  { code: 'en', countryCode: 'US', label: 'English' },
  { code: 'th', countryCode: 'TH', label: 'Thai' },
  { code: 'ru', countryCode: 'RU', label: 'Russian' },
  { code: 'zh', countryCode: 'CN', label: 'Chinese' },
  { code: 'ko', countryCode: 'KR', label: 'Korean' },
  { code: 'ms', countryCode: 'MY', label: 'Malay' },
];

const SelectLanguage = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('selectedLanguage') || 'en');

  const handleSelectLanguage = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    // i18n.changeLanguage(langCode); // if using i18n library
  };

  return (
    <div className="min-h-screen bg-white text-black flex justify-center">
      <div className="w-full lg:max-w-3xl lg:mx-auto min-h-screen flex flex-col">
        {/* Back Button */}
        <div className="flex items-center px-8 pt-8 pb-4">
          <button className="flex items-center text-gray-600 text-base font-medium" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Title */}
        <div className="px-8 pb-6">
          <h1 className="text-2xl font-bold">Choose Your Language</h1>
        </div>

        {/* Language List */}
        <div className="flex-1">
          {LANGUAGES.map(({ code, countryCode, label }, index) => {
            const isSelected = selectedLang === code;
            return (
              <div
                key={code}
                onClick={() => handleSelectLanguage(code)}
                className={`flex justify-between items-center px-8 py-4 ${
                  index === 0 ? '' : 'border-t border-gray-200'
                } cursor-pointer hover:bg-gray-50 transition`}
              >
                <div className="flex items-center space-x-4">
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{
                      width: '1.8em',
                      height: '1.8em',
                      borderRadius: '50%',
                      boxShadow: '0 0 0.5px rgba(0,0,0,0.3)',
                    }}
                    aria-label={countryCode}
                  />
                  <span className="text-lg">{label}</span>
                </div>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 
                      4.707 9.293a1 1 0 00-1.414 1.414l4 4 
                      a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectLanguage;
