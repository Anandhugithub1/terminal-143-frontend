export default function DesktopCirclesPanel({ circles, selectedCircleId, onSelectCircle, tags, tagFilter, onTagFilter, onCreateCircle, loading }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-gray-900">Your Circles</h4>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
            {circles.length}
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
          {loading ? (
            <SkeletonList lines={4} />
          ) : circles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No circles found</div>
              <button 
                onClick={onCreateCircle}
                className="mt-3 text-primary text-sm font-medium hover:underline"
              >
                Create your first circle
              </button>
            </div>
          ) : (
            circles.map((c, index) => (
              <button
                key={c.circleId}
                onClick={() => onSelectCircle(c.circleId)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group slide-in ${
                  selectedCircleId === c.circleId 
                    ? "ring-2 ring-primary shadow-md bg-gradient-to-r from-purple-50 to-blue-50" 
                    : "hover:shadow-md hover:bg-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
              <div
  className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-200"
>
  {c.coverPhoto ? (
    <img
      src={c.coverPhoto}
      alt={c.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary">
      {c.name?.[0] || "C"}
    </div>
  )}
</div>

                    {c.onlineCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold truncate text-gray-900">{c.name}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${
                        c.visibility === 'public' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.visibility}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mb-2">{c.description}</div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{c.memberCount} members</span>
                      <span>{c.onlineCount} online</span>
                    </div>
                  </div>
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500">
                        #{t}
                      </span>
                    ))}
                    {c.tags.length > 2 && (
                      <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500">
                        +{c.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button 
            onClick={onCreateCircle}
            className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Create New Circle
          </button>
        </div>
      </div>

      {/* Tags panel */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <div className="text-sm font-bold mb-4 text-gray-900">Popular Tags</div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => onTagFilter("")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tagFilter === "" 
                ? "bg-primary text-white shadow-md" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {tags.map(t => (
            <button 
              key={t}
              onClick={() => onTagFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tagFilter === t
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function SkeletonList({ lines = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}