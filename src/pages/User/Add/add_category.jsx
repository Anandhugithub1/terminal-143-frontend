import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import womanInRedShirt from '../../../assets/woman.png';
import manInWhiteShirt from '../../../assets/man.png';
import { MatchProviderCard, FindMatchCard } from '../../../components/Cards/ChooseCard';
import { LANGUAGE_LABELS } from '../../../Utlis/utlis';
import LanguageIcon from '../../../assets/svgs/language.svg';

const ChooseCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const USER_TYPE_MAP = { provider: 'mp', match: 'fm' };

  useEffect(() => {
    const lang = localStorage.getItem('selectedLanguage');
    if (lang) setSelectedLang(lang);
  }, []);

  const handleContinue = () => {
    if (!selectedCategory) return;
    navigate('/register', { state: { userType: USER_TYPE_MAP[selectedCategory] } });
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header - made more compact */}
      <div className="flex-shrink-0 p-3 sm:p-4 flex justify-end">
        <button
          className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm transition text-xs sm:text-sm"
          onClick={() => navigate('/select-language')}
        >
          <img src={LanguageIcon} alt="Language" className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium">
            {LANGUAGE_LABELS[selectedLang] || 'English'}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable content with Continue button placed just below cards */}
      <div className="flex-1 overflow-auto px-3 sm:px-4 py-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
          Choose Category
        </h1>
        <div className="space-y-2 sm:space-y-4">
          <MatchProviderCard
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            womanInRedShirt={womanInRedShirt}
          />
          <FindMatchCard
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            manInWhiteShirt={manInWhiteShirt}
          />
        </div>

        {/* Continue button below cards */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleContinue}
            className="w-full max-w-md bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2.5 sm:py-3 rounded-full hover:opacity-90 transition text-xs sm:text-sm md:text-base"
            disabled={!selectedCategory}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseCategory;
