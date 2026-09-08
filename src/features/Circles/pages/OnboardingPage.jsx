import { ArrowLeft, Search, Sparkles, X, Compass } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useOnboardingCircles, onboardingCategories as categories } from "../constants/onboardingCircles";
import { useJoinCircle } from "../hooks/useMembership";
import TopNav from "../../../components/Layout/TopNavigation";
import NavBar from "../../../components/Layout/Navbar";

export default function OnboardingPage({ onComplete, onBack }) {
  const { t } = useTranslation("circles");
  const availableCircles = useOnboardingCircles();
  const navigate = useNavigate();
  const { mutateAsync: joinCircle, isPending: isJoining } = useJoinCircle();
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isCompleting, setIsCompleting] = useState(false);

  const handleImageError = (circleId) => {
    setImageErrors((prev) => new Set(prev).add(circleId));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const filteredCircles = availableCircles.filter((circle) => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || circle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCircle = (circleId) => {
    setSelectedCircles((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const selectedCirclesData = availableCircles.filter((circle) =>
    selectedCircles.includes(circle.id)
  );

  const handleComplete = async () => {
    if (selectedCircles.length < 3) return;

    setIsCompleting(true);
    try {
      if (onComplete) {
        // Complete profile first so circle joins have an authenticated profile.
        // onComplete (Tags.jsx's handleComplete) already shows its own error
        // toast and rethrows on failure — stop here without a second,
        // redundant toast, and without joining circles or navigating.
        try {
          await onComplete(selectedCirclesData);
        } catch {
          return;
        }
      }

      // Join circles after profile is ready
      await Promise.allSettled(
        selectedCirclesData.map((circle) => joinCircle(circle.circleId))
      );

      if (onComplete) {
        toast.success(t("onboarding.profileReadyToast"));
        navigate("/home", { state: { profileJustCompleted: true } });
      } else {
        navigate("/circles");
      }
    } catch {
      toast.error(t("onboarding.genericErrorToast"));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      {onComplete ? <NavBar /> : <TopNav />}

      {/* Progress sub-bar */}
      <div className="sticky top-[65px] z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack || (() => navigate(-1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 shrink-0"
            aria-label={t("onboarding.goBack")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">
                {t("onboarding.stepSelect")}
              </span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {t("onboarding.selectedCount", { count: selectedCircles.length })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((selectedCircles.length / 3) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-fadeIn">
          <div className="text-center mb-8 bg-gray-100 -mx-4 px-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("onboarding.heading")}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto px-4">
              {t("onboarding.subheading")}
            </p>
          </div>

          {selectedCircles.length < 3 && selectedCircles.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-amber-700 text-sm font-medium">
                {t("onboarding.selectMoreWarning", { count: 3 - selectedCircles.length, plural: 3 - selectedCircles.length === 1 ? '' : 's' })}
              </p>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder={t("onboarding.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[43px] pl-11 pr-10 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t("common.clearSearch")}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="overflow-x-auto no-scrollbar mb-6 pb-2 -mx-1 px-1 scrollbar-hide">
            <div className="flex gap-2 min-w-min">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`glass-rim glass-rim-host flex-shrink-0 h-[30px] px-4 rounded-full text-[13px] font-medium transition-all whitespace-nowrap [backdrop-filter:blur(20px)_saturate(180%)] ${
                    selectedCategory === category
                      ? "bg-primary/90 text-white"
                      : "bg-white/70 text-gray-700 active:bg-white/90"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Circles Grid — card layout matches the Discover Circles design
              (photo, glass-rim category badge, overlapping avatar, name,
              description). Selection is shown with a primary-colored border
              ring, since these cards toggle selection rather than joining
              immediately. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredCircles.map((circle) => {
              const isSelected = selectedCircles.includes(circle.id);
              const Icon = circle.icon;
              const showFallback = !circle.image || imageErrors.has(circle.id);
              return (
                <button
                  key={circle.id}
                  onClick={() => toggleCircle(circle.id)}
                  className={`relative text-left bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border-2 transition-all active:scale-[0.98] ${
                    isSelected ? "border-primary" : "border-gray-100"
                  }`}
                >
                  <div className="relative">
                    {showFallback ? (
                      <div className={`w-full h-[81px] flex items-center justify-center ${circle.iconBg || "bg-primary/10"}`}>
                        {Icon ? (
                          <Icon className={`w-7 h-7 ${circle.iconColor}`} />
                        ) : (
                          <Compass className="w-7 h-7 text-primary" />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-[81px] bg-gray-100 overflow-hidden">
                        <img
                          src={circle.image}
                          alt={circle.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(circle.id)}
                        />
                      </div>
                    )}
                    <span className="glass-rim absolute top-2 left-2 text-[11px] font-normal px-3 py-1 rounded-full text-[#F5F5F5] bg-[#7d8582]/40 [backdrop-filter:blur(14px)]">
                      {circle.category}
                    </span>
                    <div className="absolute -bottom-5 left-2.5 w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                      {showFallback ? (
                        <div className={`w-full h-full flex items-center justify-center ${circle.iconBg || "bg-primary/10"}`}>
                          {Icon ? (
                            <Icon className={`w-4 h-4 ${circle.iconColor}`} />
                          ) : (
                            <Compass className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ) : (
                        <img
                          src={circle.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="px-3 pb-3 pt-5 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-gray-900 mb-0.5 line-clamp-1">{circle.name}</h3>
                    <p className="text-xs leading-snug text-gray-500 line-clamp-2 mb-2 flex-1">
                      {circle.description}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {circle.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[11px] text-primary bg-white border border-primary/30 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCircles.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("common.noCirclesFound")}</h3>
              <p className="text-gray-500 mb-4">{t("common.tryAdjustingSearch")}</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:shadow-md transition-all active:scale-95"
              >
                {t("common.clearFilters")}
              </button>
            </div>
          )}
          <div className="h-28 sm:h-32" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-lg safe-bottom">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleComplete}
            disabled={selectedCircles.length < 3 || isJoining || isCompleting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
              selectedCircles.length >= 3 && !isJoining && !isCompleting
                ? "bg-primary text-white hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isJoining
              ? t("onboarding.joining")
              : isCompleting
              ? t("onboarding.settingUpProfile")
              : t("onboarding.continueWithCount", { count: selectedCircles.length, plural: selectedCircles.length !== 1 ? 's' : '' })}
            {!isJoining && !isCompleting && selectedCircles.length < 3 && t("onboarding.needMoreSuffix", { count: 3 - selectedCircles.length })}
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out; }
      `}</style>
    </div>
  );
}
