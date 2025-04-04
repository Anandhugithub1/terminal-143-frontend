
export const MatchProviderCard = ({ selectedCategory, setSelectedCategory, womanInRedShirt }) => {
  return (
    <div
      onClick={() => setSelectedCategory('provider')}
      className={`relative rounded-2xl shadow-lg p-5 sm:p-8 flex items-center justify-between gap-6 transition-all cursor-pointer border-2 overflow-hidden ${
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
          <li className="flex items-center"><span className="mr-2">•</span>Create profiles</li>
          <li className="flex items-center"><span className="mr-2">•</span>Add bio &amp; photos</li>
          <li className="flex items-center"><span className="mr-2">•</span>Respond to request and Chat</li>
        </ul>
        <div
          className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border w-max shadow-sm mt-3 ${
            selectedCategory === 'provider'
              ? 'bg-white border-blue-200 text-blue-600'
              : 'bg-gradient-to-r from-pink-50 to-purple-50 border-gray-200'
          }`}
        >
          Free forever
        </div>
      </div>

      {/* Image */}
      <div className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0">
        <img src={womanInRedShirt} alt="Match Provider" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export const FindMatchCard = ({ selectedCategory, setSelectedCategory, manInWhiteShirt }) => {
    return (
      <div
        onClick={() => setSelectedCategory('match')}
        className={`relative rounded-2xl shadow-lg p-5 sm:p-8 transition-all cursor-pointer border-2 overflow-hidden ${
          selectedCategory === 'match'
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white border-gray-200 opacity-70 hover:bg-gray-50'
        }`}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-100/40 via-purple-50/30 to-sky-200/50 top-[-15%] right-[-10%] opacity-90 blur-[80px]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-200/50 via-cyan-100/40 to-blue-100/30 bottom-[-20%] left-[-15%] opacity-75 blur-[60px]" />
        </div>
  
        {/* Content */}
        <div className="relative z-10 flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Find Match</h2>
            <ul className="text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li className="flex items-center"><span className="mr-2">•</span>Match by location</li>
              <li className="flex items-center"><span className="mr-2">•</span>Match by languages</li>
              <li className="flex items-center"><span className="mr-2">•</span>Match by interests</li>
            </ul>
            <div
              className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border shadow-sm mt-3 ${
                selectedCategory === 'match'
                  ? 'bg-white border-blue-200 text-blue-600'
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-gray-200'
              }`}
            >
              <span className="text-gray-500">1st month Free then </span>
              <span className="text-blue-600 font-bold">99 THB</span>
            </div>
          </div>
  
          <div className="relative z-10 w-41 h-34 sm:w-45 sm:h-48 flex-shrink-0 md:w-56">
            <img src={manInWhiteShirt} alt="Find Match" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  };

