export default function MobileCirclesDrawer({ circles, selectedCircleId, onSelectCircle, onClose, tags, tagFilter, onTagFilter, onCreateCircle, loading }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Content */}
      <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl slide-in overflow-y-auto">
        <div className="p-4 border-b border-border-clr">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Circles</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {/* Mobile Search in Drawer */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              placeholder="Search circles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-clr text-sm bg-gray-100"
            />
          </div>
        </div>

        <div className="p-4">
          {/* Circles List */}
          <div className="space-y-2 mb-6">
            {loading ? (
              <MobileSkeletonList lines={3} />
            ) : circles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm">No circles found</div>
              </div>
            ) : (
              circles.map((c, index) => (
                <button
                  key={c.circleId}
                  onClick={() => onSelectCircle(c.circleId)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedCircleId === c.circleId 
                      ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-primary" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 truncate">{c.description}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-900">Tags</h4>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => onTagFilter("")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  tagFilter === "" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                All
              </button>
              {tags.map(t => (
                <button 
                  key={t}
                  onClick={() => onTagFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    tagFilter === t
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button 
            onClick={onCreateCircle}
            className="w-full py-3.5 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Create New Circle
          </button>
        </div>
      </div>
    </div>
  );
}
function MobileSkeletonList({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}