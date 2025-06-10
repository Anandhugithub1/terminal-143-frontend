// src/pages/LanguagePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import '@fontsource-variable/inter';
import clsx from 'clsx';
import ReactCountryFlag from 'react-country-flag';

// Supported languages
const LANGUAGES = [
  { code: 'en', countryCode: 'US', label: 'English' },
  { code: 'th', countryCode: 'TH', label: 'Thai' },
  { code: 'ru', countryCode: 'RU', label: 'Russian' },
  { code: 'zh', countryCode: 'CN', label: 'Chinese' },
  { code: 'ko', countryCode: 'KR', label: 'Korean' },
  { code: 'ms', countryCode: 'MY', label: 'Malay' }
];

const LanguagePage = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('lang') || 'en');

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    localStorage.setItem('lang', code);
    // i18n.changeLanguage(code); // Uncomment if using i18n
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Select Language</h1>
      </header>

      <div className="p-4">
        <nav className="mt-6 space-y-3">
          {LANGUAGES.map(({ code, countryCode, label }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={clsx(
                "flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left",
                selectedLang === code && "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    borderRadius: '50%',
                    boxShadow: '0 0 0.5px rgba(0,0,0,0.3)'
                  }}
                  aria-label={countryCode}
                />
                <span className="text-gray-800 font-medium">{label}</span>
              </div>
              {selectedLang === code && (
                <Check className="text-blue-600" size={20} />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default LanguagePage;
