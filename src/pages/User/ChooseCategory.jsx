import React, { useState } from 'react';
import womanInRedShirt from '../../assets/woman.png';
import manInWhiteShirt from '../../assets/man.png';
import smallPic1 from '../../assets/small.jpg';
import smallPic2 from '../../assets/small1.jpg';
import smallPic3 from '../../assets/small.jpg';
import smallPic4 from '../../assets/small.jpg';

const ChooseCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Right: Language Selector */}
      <div className="flex justify-end p-4">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2">
          {/* Globe icon (example) */}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
          Choose Category
        </h1>

        {/* Cards Container */}
        <div className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6">

         {/* Card 1: Match Provider */}
<div
  onClick={() => setSelectedCategory('provider')}
  className={`relative rounded-2xl shadow-lg p-5 sm:p-8 flex items-center justify-between gap-6
    transition-all cursor-pointer border-2 overflow-hidden
    ${
      selectedCategory === 'provider'
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 opacity-70 hover:bg-gray-50'
    }`}
>
  {/* Gradient Background */}
  <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 top-[-30%] right-[-30%] opacity-80 z-0" />
  <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-purple-50 to-pink-50 top-[-20%] right-[-20%] opacity-80 z-0" />

  {/* Text Content */}
  <div className="relative z-10 flex-1">
    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
      Match Provider
    </h2>
    <ul className="text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
      <li className="flex items-center">
        <span className="mr-2">•</span>Create profiles
      </li>
      <li className="flex items-center">
        <span className="mr-2">•</span>Add bio &amp; photos
      </li>
      <li className="flex items-center">
        <span className="mr-2">•</span>Respond to request and Chat
      </li>
    </ul>
    <div
      className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border w-max shadow-sm mt-3
        ${
          selectedCategory === 'provider'
            ? 'bg-white border-blue-200 text-blue-600'
            : 'bg-gradient-to-r from-pink-50 to-purple-50 border-gray-200'
        }`}
    >
      Free forever
    </div>
  </div>

  {/* Woman Image  */}
  <div className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0">
    <img
      src={womanInRedShirt}
      alt="Match Provider"
      className="w-full h-full object-cover "
    />
  </div>
</div>


{/* Card 2: Find Match */}
<div
  onClick={() => setSelectedCategory('match')}
  className={`relative rounded-2xl shadow-lg p-5 sm:p-8 transition-all cursor-pointer border-2 overflow-hidden
    ${
      selectedCategory === 'match'
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 opacity-70 hover:bg-gray-50'
    }`}
>
  {/* ===== Gradient Background ===== */}
  <div className="absolute inset-0 overflow-hidden z-0">
    <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-100/40 via-purple-50/30 to-sky-200/50 top-[-15%] right-[-10%] opacity-90 blur-[80px]" />
    <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-200/50 via-cyan-100/40 to-blue-100/30 bottom-[-20%] left-[-15%] opacity-75 blur-[60px]" />
  </div>

  {/* ===== Main Content ===== */}
  <div className="relative z-10 flex flex-row items-center justify-between gap-4">
    {/* === Text Section === */}
    <div className="flex-1">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
        Find Match
      </h2>
      <ul className="text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
        <li className="flex items-center">
          <span className="mr-2">•</span>Match by location
        </li>
        <li className="flex items-center">
          <span className="mr-2">•</span>Match by languages
        </li>
        <li className="flex items-center">
          <span className="mr-2">•</span>Match by interests
        </li>
      </ul>
      <div
        className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border shadow-sm mt-3
          ${
            selectedCategory === 'match'
              ? 'bg-white border-blue-200 text-blue-600'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-gray-200'
          }`}
      >
        <span className="text-gray-500">1st month Free then </span>
        <span className="text-blue-600 font-bold">99 THB</span>
      </div>
    </div>

    {/* === Man Image + Floating Profile Pics (Aesthetic Placement) === */}
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
      {/* Main Person */}
      <img
        src={manInWhiteShirt}
        alt="Find Match"
        className="w-full h-full object-contain rounded-full relative"
      />

      {/* Floating mini-profile images - Positioned Aesthetically */}
      <img
        src={smallPic1}
        alt="User 1"
        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow"
        style={{
          top: '-15%',
          left: '10%',
        }}
      />
      <img
        src={smallPic2}
        alt="User 2"
        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow"
        style={{
          top: '-20%',
          right: '5%',
        }}
      />
      <img
        src={smallPic3}
        alt="User 3"
        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow"
        style={{
          top: '-5%',
          left: '-10%',
        }}
      />
      <img
        src={smallPic4}
        alt="User 4"
        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow"
        style={{
          top: '-10%',
          right: '-10%',
        }}
      />
    </div>
  </div>
</div>


        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 pb-4 sm:pb-6 flex justify-center">
        <button
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
