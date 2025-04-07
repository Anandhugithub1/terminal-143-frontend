import React, { useState } from 'react';

const LANGUAGES = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  GERMAN: 'de',
  CHINESE: 'zh',
  JAPANESE: 'ja',
  ARABIC: 'ar',
};

const SelectLanguage = () => {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES.ENGLISH);

  const getLanguageLabel = (code) => {
    switch (code) {
      case LANGUAGES.ENGLISH:
        return 'English';
      case LANGUAGES.FRENCH:
        return 'France';
      case LANGUAGES.GERMAN:
        return 'Germany';
      case LANGUAGES.CHINESE:
        return 'Chinese';
      case LANGUAGES.JAPANESE:
        return 'Japanese';
      case LANGUAGES.ARABIC:
        return 'Arabic';
      default:
        return 'Unknown';
    }
  };

  const handleSelectLanguage = (langCode) => {
    setSelectedLang(langCode);
  };

  return (
    <div className="min-h-screen bg-white text-black flex justify-center">
      <div className="w-full lg:max-w-3xl lg:mx-auto min-h-screen flex flex-col">
        {/* Back Button */}
        <div className="flex items-center px-8 pt-8 pb-4">
          <button className="flex items-center text-gray-600 text-base font-medium">
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
          {Object.values(LANGUAGES).map((langCode, index) => {
            const label = getLanguageLabel(langCode);
            const isSelected = selectedLang === langCode;
            return (
              <div
                key={langCode}
                onClick={() => handleSelectLanguage(langCode)}
                className={`flex justify-between items-center px-8 py-4 ${
                  index === 0 ? '' : 'border-t border-gray-200'
                } cursor-pointer hover:bg-gray-50 transition`}
              >
                <span className="text-lg">{label}</span>
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
