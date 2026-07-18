import {
  ArrowLeft,
  Search,
  Check,
  Sparkles,
  X,
  Calendar,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { availableCircles, onboardingCategories as categories } from "../constants/onboardingCircles";
import { useJoinCircle } from "../hooks/useMembership";
import TopNav from "../../../components/Layout/TopNavigation";
import NavBar from "../../../components/Layout/Navbar";

export default function OnboardingPage({ onComplete, onBack }) {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const { mutateAsync: joinCircle, isPending: isJoining } = useJoinCircle();
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [step, setStep] = useState(1);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isCompleting, setIsCompleting] = useState(false);

  const handleImageError = (circleId) => {
    setImageErrors((prev) => new Set(prev).add(circleId));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const filteredCircles = availableCircles.filter((circle) => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || circle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCircle = (circleId) => {
    setSelectedCircles((prev) => {
      const isSelected = prev.includes(circleId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId];
      if (step === 2 && newSelection.length < 3) setStep(1);
      return newSelection;
    });
  };

  const selectedCirclesData = availableCircles.filter((circle) =>
    selectedCircles.includes(circle.id)
  );

  const handleContinue = () => {
    if (selectedCircles.length >= 3) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    if (selectedCircles.length < 3) return;

    setIsCompleting(true);
    try {
      if (onComplete) {
        // Complete profile first so circle joins have an authenticated profile
        await onComplete(selectedCirclesData);
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
            onClick={step === 2 ? () => setStep(1) : (onBack || (() => navigate(-1)))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 shrink-0"
            aria-label={t("onboarding.goBack")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">
                {step === 1 ? t("onboarding.stepSelect") : t("onboarding.stepConfirm")}
              </span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {t("onboarding.selectedCount", { count: selectedCircles.length })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: step === 1
                    ? `${Math.min((selectedCircles.length / 3) * 100, 100)}%`
                    : "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div key={step} className="animate-fadeIn">
        {step === 1 ? (
          <>
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

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("onboarding.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
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

            <div className="overflow-x-auto mb-6 pb-2 -mx-1 px-1 scrollbar-hide">
              <div className="flex gap-2 min-w-min">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filteredCircles.map((circle) => {
                const isSelected = selectedCircles.includes(circle.id);
                const Icon = circle.icon;
                return (
                  <button
                    key={circle.id}
                    onClick={() => toggleCircle(circle.id)}
                    className={`relative text-left p-3 rounded-2xl transition-all hover:shadow-md active:scale-[0.98] ${
                      isSelected
                        ? "bg-primary text-white shadow-lg ring-2 ring-primary ring-offset-2"
                        : `${circle.bgColor}`
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 ${isSelected ? "bg-white/20" : circle.iconBg}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? "text-white" : circle.iconColor}`} />
                    </div>
                    <div className="relative mb-3">
                      {imageErrors.has(circle.id) ? (
                        <div className={`w-full h-28 sm:h-32 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/10" : circle.iconBg}`}>
                          <Icon className={`w-8 h-8 ${isSelected ? "text-white" : circle.iconColor}`} />
                        </div>
                      ) : (
                        <img
                          src={circle.image}
                          alt={circle.name}
                          className={`w-full h-28 sm:h-32 object-cover rounded-xl ${isSelected ? "opacity-90" : ""}`}
                          loading="lazy"
                          onError={() => handleImageError(circle.id)}
                        />
                      )}
                      <span className={`absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${isSelected ? "bg-white/20 text-white" : "bg-black/40 text-white"}`}>
                        {circle.category}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
                        {circle.name}
                      </h3>
                      <p className={`text-xs line-clamp-2 mb-2 ${isSelected ? "text-white/80" : "text-gray-600"}`}>
                        {circle.description}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {circle.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-white text-gray-500"}`}
                          >
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
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Sparkles className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("onboarding.confirmHeading")}</h2>
              <p className="text-gray-600 max-w-md mx-auto px-4">
                {t("onboarding.confirmSubheading", { count: selectedCircles.length })}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-800 px-1">{t("onboarding.yourCircles")}</h3>
              {selectedCirclesData.map((circle, index) => {
                const Icon = circle.icon;
                return (
                  <div key={circle.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-base">{index + 1}</span>
                    </div>
                    <div className={`${circle.iconBg} p-2 rounded-xl flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${circle.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{circle.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{circle.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {circle.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCircle(circle.id)}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors active:bg-red-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={t("onboarding.removeCircle")}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 sm:p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{t("onboarding.whatToExpect")}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{t("onboarding.naturalConnections.title")}</h4>
                    <p className="text-sm text-gray-600">{t("onboarding.naturalConnections.body")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{t("onboarding.regularMeetups.title")}</h4>
                    <p className="text-sm text-gray-600">{t("onboarding.regularMeetups.body")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-40 sm:h-44" />
          </>
        )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-lg safe-bottom">
        <div className="max-w-3xl mx-auto">
          {step === 1 ? (
            <button
              onClick={handleContinue}
              disabled={selectedCircles.length < 3}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                selectedCircles.length >= 3 ? "bg-primary text-white hover:shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {t("onboarding.continueWithCount", { count: selectedCircles.length, plural: selectedCircles.length !== 1 ? 's' : '' })}
              {selectedCircles.length < 3 && t("onboarding.needMoreSuffix", { count: 3 - selectedCircles.length })}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleComplete}
                disabled={selectedCircles.length < 3 || isJoining || isCompleting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                  selectedCircles.length >= 3 && !isJoining && !isCompleting ? "bg-primary text-white hover:shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isJoining
                  ? t("onboarding.joining")
                  : isCompleting
                  ? t("onboarding.settingUpProfile")
                  : t("onboarding.joinAndStart", { count: selectedCircles.length, plural: selectedCircles.length !== 1 ? "s" : "" })}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={isJoining || isCompleting}
                className="w-full py-3 text-gray-600 font-medium hover:text-primary transition-colors active:bg-gray-100 rounded-xl disabled:opacity-50"
              >
                {t("onboarding.addMoreCircles")}
              </button>
            </div>
          )}
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