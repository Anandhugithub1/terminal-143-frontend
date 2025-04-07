import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/State'; // Adjust the path as necessary
import womanInRedShirt from '../../assets/woman.png';
import manInWhiteShirt from '../../assets/man.png';
import { FindMatchCard, MatchProviderCard } from '../../components/Card';
import { LANGUAGE_LABELS } from '../../Utlis/utlis';
import LanguageIcon from '../../assets/svgs/language.svg';

const ChooseCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const USER_TYPE_MAP = {
    FIND_MATCH: 'fm',
    MATCH_PROVIDER: 'mp',
  };

  // Get token from AuthContext
  const { accessToken } = useAuth();

  useEffect(() => {
    const lang = localStorage.getItem('selectedLanguage');
    if (lang) {
      setSelectedLang(lang);
    }
  }, []);

  const handleContinue = async () => {
    if (!selectedCategory) return;
    const userTypeValue = USER_TYPE_MAP[selectedCategory];

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use token from AuthContext
      const response = await fetch('http://localhost:4000/api/users/select-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the token in the Authorization header:
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userType: userTypeValue })  // ✅ use enum value

      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setSuccess(data.message);
        navigate('/complete-details'); // Adjust the path as necessary
        // Optionally navigate to the next page or update state
      }
    } catch (err) {
      setError('Network error ' + (err.message || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Right: Language Selector */}
      <div className="flex justify-end p-4">
        <button
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm transition-colors"
          onClick={() => navigate('/select-language')}
        >
          <img src={LanguageIcon} alt="Language Icon" className="h-5 w-5" />
          <span className="text-sm font-medium">
            {LANGUAGE_LABELS[selectedLang] || 'English'}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-left mb-6 sm:mb-8">
          Choose Category
        </h1>
        {/* Cards Container */}
        <div className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6">
          {/* Card 1: Match Provider */}
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
      </div>

      {/* Error & Success Messages */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {success && <div className="text-green-500 text-center mb-4">{success}</div>}

      {/* Continue Button */}
      <div className="px-4 pb-4 sm:pb-6 flex justify-center">
        <button
          onClick={handleContinue}
          className="w-full max-w-md bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 sm:py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg text-sm sm:text-base"
          disabled={!selectedCategory || loading}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default ChooseCategory;
