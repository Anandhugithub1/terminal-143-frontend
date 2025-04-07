import React, { useState } from 'react';

const LANGUAGES = {
  ENGLISH: 'en',
  THAI: 'th',
  RUSSIAN: 'ru',
  CHINESE: 'zh',
  SPANISH: 'es',
  MEXICAN: 'mx',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
};

const SelectLanguage = () => {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES.ENGLISH);

  const getLanguageLabel = (code) => {
    switch (code) {
      case LANGUAGES.ENGLISH:
        return 'English';
      case LANGUAGES.THAI:
        return 'Thai';
      case LANGUAGES.RUSSIAN:
        return 'Russian';
      case LANGUAGES.CHINESE:
        return 'Chinese';
      case LANGUAGES.SPANISH:
        return 'Spanish';
      case LANGUAGES.MEXICAN:
        return 'Mexican';
      case LANGUAGES.ITALIAN:
        return 'Italian';
      case LANGUAGES.PORTUGUESE:
        return 'Portuguese';
      default:
        return 'Unknown';
    }
  };

  const handleSelectLanguage = (langCode) => {
    setSelectedLang(langCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex justify-center">
      <div className="w-full max-w-sm bg-white shadow-md min-h-screen flex flex-col">
        {/* Navigation Bar with Back Button */}
        <div className="flex items-center space-x-4 px-4 py-2 border-b border-gray-200">
          <button className="flex items-center space-x-1 text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="px-4 py-2 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Choose Your Language</h1>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto">
          {Object.values(LANGUAGES).map((langCode) => {
            const label = getLanguageLabel(langCode);
            const isSelected = selectedLang === langCode;
            return (
              <button
                key={langCode}
                onClick={() => handleSelectLanguage(langCode)}
                className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none"
              >
                <span className="text-sm font-medium">{label}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectLanguage;
