import { useEffect, useRef, useState } from "react";
import { Search, X, Compass, Loader2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCircleSearch, usePostTagSearch } from "../../hooks/useCircles";

// Combined search: one input, results split into Circles and Posts tabs.
//
// The two searches take different inputs and can't share a ranking — circles
// match on a NAME PREFIX ("loc" -> Locals Who Wander), posts on an EXACT TAG
// ("hiking"). Tabs keep that honest instead of blending two incomparable
// relevance scores into one list (which is also how Instagram/Reddit/X do it).
//
// Circles is the default tab because prefix search returns something for
// partial input; defaulting to Posts would show an empty tab on every
// half-typed word and read as broken.
const TABS = { CIRCLES: "circles", POSTS: "posts" };

export default function CircleSearchBar({ joinedCircleIds, onSelect, onSelectPost }) {
  const { t } = useTranslation("circles");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(TABS.CIRCLES);
  const containerRef = useRef(null);

  const { circles, isSearching: circlesLoading, isActive } = useCircleSearch(query);
  const { posts, isSearching: postsLoading } = usePostTagSearch(query);

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
    setTab(TABS.CIRCLES);
  };

  const handleSelectCircle = (circle) => {
    onSelect?.(circle);
    clear();
  };

  const handleSelectPost = (post) => {
    onSelectPost?.(post);
    clear();
  };

  const showDropdown = open && isActive;
  const isPosts = tab === TABS.POSTS;
  const loading = isPosts ? postsLoading : circlesLoading;
  const results = isPosts ? posts : circles;

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
        placeholder={t("search.placeholder")}
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
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Tabs — counts tell the user where the results are without
              having to switch tabs to find out. */}
          <div className="flex border-b border-gray-100" role="tablist">
            {[
              { id: TABS.CIRCLES, label: t("search.tabCircles"), count: circles.length },
              { id: TABS.POSTS, label: t("search.tabPosts"), count: posts.length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === id
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {count > 0 && <span className="ml-1.5 text-xs text-gray-400">{count}</span>}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("discoverCircles.searching")}
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 px-4 text-center text-sm text-gray-400">
                {isPosts
                  ? // Say WHY it's empty — tag search is exact, so a partial
                    // word legitimately finds nothing. Naming the tag teaches
                    // the rule in one line.
                    t("search.noPostsTagged", { tag: query.trim().toLowerCase() })
                  : t("common.noCirclesFound")}
              </div>
            ) : isPosts ? (
              posts.map((post) => (
                <button
                  key={post.postId}
                  onClick={() => handleSelectPost(post)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden">
                    {post.media?.[0]?.url ? (
                      <img src={post.media[0].url} alt="" className="w-9 h-9 object-cover" loading="lazy" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 truncate">
                      {post.content || t("search.postNoText")}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {post.circleName} · {post.authorName}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              circles.map((circle) => {
                const joined = joinedCircleIds?.has(circle.circleId);
                return (
                  <button
                    key={circle.circleId}
                    onClick={() => handleSelectCircle(circle)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden">
                      {circle.coverPhoto ? (
                        <img src={circle.coverPhoto} alt={circle.name} className="w-9 h-9 object-cover" loading="lazy" />
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
        </div>
      )}
    </div>
  );
}
