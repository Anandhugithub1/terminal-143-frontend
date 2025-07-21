// Smaller, more compact card styles
export const MatchProviderCard = ({ selectedCategory, setSelectedCategory, womanInRedShirt }) => (
  <div
    onClick={() => setSelectedCategory('provider')}
    className={`relative rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-between gap-4 cursor-pointer border-2 transition-all overflow-hidden ${
      selectedCategory === 'provider'
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 opacity-80 hover:bg-gray-50'
    }`}
  >
    <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 top-[-25%] right-[-25%] opacity-80 z-0" />
    <div className="relative z-10 flex-1">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
        Match Provider
      </h2>
      <ul className="text-gray-600 space-y-1 text-xs sm:text-sm">
        <li>• Create profiles</li>
        <li>• Add bio & photos</li>
        <li>• Respond & Chat</li>
      </ul>
      <div className="mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-gray-200">
        Free forever
      </div>
    </div>
    <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
      <img src={womanInRedShirt} alt="Match Provider" className="w-full h-full object-cover rounded-xl" />
    </div>
  </div>
);

export const FindMatchCard = ({ selectedCategory, setSelectedCategory, manInWhiteShirt }) => (
  <div
    onClick={() => setSelectedCategory('match')}
    className={`relative rounded-2xl shadow-lg p-4 sm:p-6 cursor-pointer border-2 transition-all overflow-hidden ${
      selectedCategory === 'match'
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 opacity-80 hover:bg-gray-50'
    }`}
  >
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-pink-100/40 via-purple-50/30 to-sky-200/50 top-[-20%] right-[-15%] opacity-90 blur-2xl" />
    </div>
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex-1">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Find Match</h2>
        <ul className="text-gray-600 space-y-1 text-xs sm:text-sm">
          <li>• Match by location</li>
          <li>• Match by languages</li>
          <li>• Match by interests</li>
        </ul>
        <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200">
          <span className="font-semibold text-blue-600">Beta Access</span> • 100% Free
        </div>
      </div>
      <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
        <img src={manInWhiteShirt} alt="Find Match" className="w-full h-full object-cover rounded-xl" />
      </div>
    </div>
  </div>
);