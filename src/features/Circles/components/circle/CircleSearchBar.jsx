import { useEffect, useRef, useState } from "react";
import { Search, X, Compass, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCircleSearch } from "../../hooks/useCircles";

// Server-backed circle search (Redis prefix index over ALL circles), shown as
// a dropdown of results. Used on the Circles home page so a user can find any
// circle without going to Discover first.
export default function CircleSearchBar({ joinedCircleIds, onSelect }) {
  const { t } = useTranslation("circles");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { circles, isSearching, isActive } = useCircleSearch(query);

  // Close the dropdown on an outside tap — otherwise it stays over the feed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const clear = () => {
    setQuery("");
    setOpen(false);
  };

  const handleSelect = (circle) => {
    onSelect?.(circle);
    clear();
  };

  const showDropdown = open && isActive;

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t("discoverCircles.searchPlaceholder")}
        className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
      />
      {query && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t("common.clearSearch")}
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {isSearching && circles.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("discoverCircles.searching")}
            </div>
          ) : circles.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              {t("common.noCirclesFound")}
            </div>
          ) : (
            circles.map((circle) => {
              const joined = joinedCircleIds?.has(circle.circleId);
              return (
                <button
                  key={circle.circleId}
                  onClick={() => handleSelect(circle)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden">
                    {circle.coverPhoto ? (
                      <img
                        src={circle.coverPhoto}
                        alt={circle.name}
                        className="w-9 h-9 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Compass className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{circle.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {circle.category} · {t("discoverCircles.memberCount", { count: circle.memberCount ?? 0 })}
                    </p>
                  </div>
                  {joined && (
                    <span className="text-[10px] font-semibold text-primary shrink-0">
                      {t("circleSearch.joinedBadge")}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
