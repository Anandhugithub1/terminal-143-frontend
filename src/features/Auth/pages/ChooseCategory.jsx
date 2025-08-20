import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchProviderCard, FindMatchCard } from '../components/ChooseCard';
import { LANGUAGE_LABELS } from '../../../Utlis/utlis';
import LanguageIcon from '../../../assets/svgs/language.svg';
import { useTranslation } from 'react-i18next';

const ChooseCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState('provider');
  const navigate = useNavigate();
  // pull everything we need from context
  const { t } = useTranslation('auth');

  const [selectedLang, setSelectedLang] = useState('en');

  const USER_TYPE_MAP = {
    provider: 'mp',
    match: 'fm',
  };
 
  // load persisted language
  useEffect(() => {
    // const lang = localStorage.getItem('selectedLanguage');
    const lang = localStorage.getItem('lang') || localStorage.getItem('selectedLanguage');

    if (lang) setSelectedLang(lang);
  }, []);

  const handleContinue = () => {
    if (!selectedCategory) return;

    const userTypeValue = USER_TYPE_MAP[selectedCategory];
    localStorage.setItem('userType', userTypeValue);
    navigate('/register', { state: { userType: userTypeValue } });

    
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Language selector */}
      <div className="flex justify-end p-4">
        <button
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm transition-colors"
          onClick={() => navigate('/language')}
        >
          <img src={LanguageIcon} alt="Language Icon" className="h-5 w-5" />
          <span className="text-sm font-medium">
            {LANGUAGE_LABELS[selectedLang] || t('english')}

          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-left mb-6 sm:mb-8">
          {t('chooseCategory')}

        </h1>
        <div className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6">
          <MatchProviderCard
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            womanInRedShirt='https://d36zx1g74mcorc.cloudfront.net/websitephotos/woman.png'
          />
          <FindMatchCard
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            manInWhiteShirt='https://d36zx1g74mcorc.cloudfront.net/websitephotos/man.png'
          />
        </div>
      </div>

      {/* Continue button */}
      <div className="sticky bottom-0 px-4 py-4 sm:py-6  flex justify-center">


        <button
          onClick={handleContinue}
          className="w-full max-w-md bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 sm:py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg text-sm sm:text-base"
          disabled={!selectedCategory}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChooseCategory;
