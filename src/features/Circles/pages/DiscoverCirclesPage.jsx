import { ArrowLeft, Search, X, Compass } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BottomNav from "../../../components/Layout/BottomNavigation";
import TopNav from "../../../components/Layout/TopNavigation";
import { useOnboardingCircles, onboardingCategories as categories } from "../constants/onboardingCircles";
import { useCircles, useCircleSearch, useCircleTagSearch } from "../hooks/useCircles";
import { useJoinCircle } from "../hooks/useMembership";
import { queryKeys } from "../queries/queryKeys";

export default function DiscoverCirclesPage() {
  const { t } = useTranslation("circles");
  const availableCircles = useOnboardingCircles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: circlesData } = useCircles();
  const { mutate: joinCircle } = useJoinCircle();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [joiningId, setJoiningId] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // A query starting with "#" searches by exact tag instead of name prefix —
  // same convention post tag search already uses elsewhere in Circles. A bare
  // word (no "#") still gets a tag search too, as a fallback once the name
  // search comes back empty, so "hiking" alone also finds circles tagged
  // #hiking instead of requiring the "#" to be typed.
  const trimmedQuery = searchQuery.trim();
  const isTagQuery = trimmedQuery.startsWith("#");
  const tagQuery = isTagQuery ? trimmedQuery.slice(1) : trimmedQuery;

  // Typing searches ALL circles server-side (Redis-backed) rather than
  // filtering the hardcoded starter list — that list can't surface circles
  // other users created.
  const nameSearch = useCircleSearch(isTagQuery ? "" : searchQuery);
  const nameSearchEmpty =
    nameSearch.isActive && !nameSearch.isSearching && nameSearch.circles.length === 0;
  const shouldTagSearch = isTagQuery || nameSearchEmpty;
  const tagSearch = useCircleTagSearch(shouldTagSearch ? tagQuery : "");
  const { circles: searchResults, isSearching, isActive: isSearchActive } =
    isTagQuery
      ? tagSearch
      : nameSearchEmpty
        ? { ...tagSearch, isActive: nameSearch.isActive }
        : nameSearch;

  const joinedCircleIds = new Set((circlesData?.circles || []).map((circle) => circle.circleId));

  // Search results come from the server already scoped to public+active
  // circles; honour the category chip so the two filters compose the way
  // they look like they should. Joined circles stay in the list (shown as
  // "Joined") instead of being filtered out.
  const searchCircleResults = searchResults.filter(
    (circle) => selectedCategory === "All" || circle.category === selectedCategory
  );

  const browseCircles = availableCircles.filter(
    (circle) => selectedCategory === "All" || circle.category === selectedCategory
  );

  const filteredCircles = isSearchActive ? searchCircleResults : browseCircles;

  const handleImageError = (circleId) => {
    setImageErrors((prev) => new Set(prev).add(circleId));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleJoin = (circle) => {
    // Private circles are excluded from both the curated starter list
    // (onboardingCircles.js filters to visibility === "public") and search
    // results (circleSearchIndex.js never indexes a private circle), so
    // this instant-join path should be unreachable for one today. Kept as
    // a defensive branch rather than an assumption: if a private circle's
    // card ever does render here, send the user to its details page (which
    // has the real request-to-join flow, message field included) instead
    // of instant-joining into a guaranteed 403.
    if (circle.visibility === "private") {
      navigate(`/circles/${circle.circleId}`);
      return;
    }

    setJoiningId(circle.circleId);
    joinCircle(circle.circleId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.circles });
      },
      onSettled: () => setJoiningId(null),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white pb-20">
      <TopNav />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border-clr px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-text-sec">{t("discoverCircles.header")}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 space-y-4">
        {availableCircles.length > 0 && availableCircles.every((circle) => joinedCircleIds.has(circle.circleId)) ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("discoverCircles.allJoinedTitle")}</h2>
            <p className="text-gray-500 text-sm">
              {t("discoverCircles.allJoinedBody")}
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("discoverCircles.searchPlaceholderWithTags")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={t("common.clearSearch")}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
              <div className="flex gap-2 min-w-min">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 active:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Circles Grid — renders both the curated starter list (icon +
                description) and server search results (coverPhoto +
                memberCount), which carry different fields. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCircles.map((circle) => {
                const key = circle.id ?? circle.circleId;
                const Icon = circle.icon;
                const isJoining = joiningId === circle.circleId;
                const isJoined = joinedCircleIds.has(circle.circleId);
                const image = circle.image || circle.coverPhoto;
                const showFallback = !image || imageErrors.has(key);
                return (
                  <div key={key} className={`${circle.bgColor || "bg-white border border-gray-200"} rounded-2xl p-3`}>
                    <div className="relative mb-3">
                      {showFallback ? (
                        <div className={`w-full h-24 rounded-xl flex items-center justify-center ${circle.iconBg || "bg-primary/10"}`}>
                          {Icon ? (
                            <Icon className={`w-8 h-8 ${circle.iconColor}`} />
                          ) : (
                            <Compass className="w-8 h-8 text-primary" />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-xl bg-gray-100 overflow-hidden">
                          <img
                            src={image}
                            alt={circle.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain"
                            onError={() => handleImageError(key)}
                          />
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                        {circle.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">{circle.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[2rem]">
                      {circle.description ||
                        t("discoverCircles.memberCount", { count: circle.memberCount ?? 0 })}
                    </p>
                    <button
                      onClick={() =>
                        isJoined ? navigate(`/circles/${circle.circleId}`) : handleJoin(circle)
                      }
                      disabled={isJoining}
                      className={`w-full py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60 ${
                        isJoined
                          ? "bg-primary/10 text-primary"
                          : "bg-primary text-white"
                      }`}
                    >
                      {isJoining
                        ? t("discoverCircles.joining")
                        : isJoined
                        ? t("circleSearch.joinedBadge")
                        : circle.visibility === "private"
                        ? t("discoverCircles.requestToJoin")
                        : t("discoverCircles.joinCircle")}
                    </button>
                  </div>
                );
              })}
            </div>

            {isSearching && filteredCircles.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400">
                {t("discoverCircles.searching")}
              </div>
            )}

            {!isSearching && filteredCircles.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("common.noCirclesFound")}</h3>
                <p className="text-gray-500 mb-4">{t("common.tryAdjustingSearch")}</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium active:scale-95 transition-transform"
                >
                  {t("common.clearFilters")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
