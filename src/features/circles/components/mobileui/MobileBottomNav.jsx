export default function MobileBottomNav({ onCompose, onCircles, selectedCircle }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bottom-safe-area">
      <div className="bg-white border-t border-border-clr shadow-2xl">
        <div className="flex items-center justify-around p-2">
          {/* Circles Button */}
          <button 
            onClick={onCircles}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">Circles</span>
          </button>

          {/* Current Circle */}
          <button 
            onClick={onCircles}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200 flex-1 max-w-[120px]"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              {selectedCircle?.name?.[0] || "C"}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {selectedCircle?.name || "Select"}
            </span>
          </button>

          {/* Compose Button */}
          <button 
            onClick={onCompose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}