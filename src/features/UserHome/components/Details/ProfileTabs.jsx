import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import DetailSection from "./Details";
import { CircleChipSkeleton } from "../../../Circles/components/common/Skeletons";
import EmptyState from "../../../../shared/components/EmptyState";
import { useUserCircles } from "../../../Circles/hooks/useCircles";

const PREVIEW_LIMIT = 20;

// Info/Circles tab switcher below the profile card (ProfileCard + the
// pass/refresh/like row above this are untouched — this only replaces what
// used to be a bare <DetailSection>). Circles are fetched lazily: nothing
// hits the API until the user actually switches to the Circles tab.
//
// There is no separate flat "Posts" tab anymore — each circle row drills
// into ProfileCirclePostsPage, scoped to just that circle and that person
// (Option A from the design review: a real navigation to a scoped screen,
// not an in-place accordion).
export default function ProfileTabs({ profile, authorId }) {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const {
    data: circlesData,
    isLoading: isLoadingCircles,
    isError: isCirclesError,
    refetch: refetchCircles,
  } = useUserCircles(activeTab === "circles" ? authorId : null, { limit: PREVIEW_LIMIT });
  const circles = circlesData?.circles || [];

  return (
    <div className="px-1 pb-6">
      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "info"
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-400"
          }`}
        >
          {t("profileTabs.info")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("circles")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "circles"
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-400"
          }`}
        >
          {t("profileTabs.circles")}
        </button>
      </div>

      {activeTab === "info" && <DetailSection profile={profile} />}

      {activeTab === "circles" && (
        <div className="space-y-2.5 pt-1">
          {isLoadingCircles && (
            <>
              <CircleChipSkeleton />
              <CircleChipSkeleton />
            </>
          )}

          {isCirclesError && (
            <EmptyState
              title={t("myPosts.loadFailedTitle")}
              subtitle={t("myPosts.loadFailedBody")}
              action={
                <button
                  onClick={() => refetchCircles()}
                  className="px-6 py-2.5 btn-filled text-sm rounded-full"
                >
                  {t("circlesHome.retry")}
                </button>
              }
            />
          )}

          {/* Empty here means "no circles," "activity hidden," or
              "blocked" — the backend deliberately never distinguishes
              which (see listUserCircles.js), so this can't say which
              either. A generic empty state is the correct, private
              behavior, not a bug. */}
          {!isLoadingCircles && !isCirclesError && circles.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm">
              <EmptyState
                icon={Users}
                title={t("profileTabs.noCirclesTitle")}
              />
            </div>
          )}

          {!isLoadingCircles && !isCirclesError && circles.map((circle) => (
            <button
              key={circle.circleId}
              type="button"
              onClick={() => navigate(`/user/${authorId}/circles/${circle.circleId}`)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 text-left active:opacity-80 transition-opacity"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0 overflow-hidden">
                {circle.coverPhoto ? (
                  <img
                    src={circle.coverPhoto}
                    alt={circle.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  circle.name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{circle.name}</p>
                  {circle.visibility === "private" && (
                    <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {t("common.membersCount", { count: circle.memberCount ?? 0 })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
