import React, { useState } from 'react';
import womanInRedShirt from '../../assets/woman.png';
import manInWhiteShirt from '../../assets/man.png';
import { FindMatchCard,MatchProviderCard } from '../../components/Card';

const ChooseCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleContinue = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Replace the URL with your actual API endpoint
      const response = await fetch('/select-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers here if needed, e.g.:
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN',
        },
        body: JSON.stringify({ userType: selectedCategory })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setSuccess(data.message);
        // Optionally navigate to the next page or update state
      }
    } catch (err) {
      setError('Network error ' ,err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Right: Language Selector */}
      <div className="flex justify-end p-4">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12a9 9 0 1018 0 9 9 0 00-18 0zm0 0v0a9 9 0 0018 0v0a9 9 0 00-18 0zm9-9v18"
            />
          </svg>
          <span className="text-sm font-medium">English</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-left mb-6 sm:mb-8 ">
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
