/* eslint-disable no-unused-vars */
import React, { useState, useCallback, lazy, Suspense, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import PageLayout from "../../../shared/components/PageLayout";
import { ProfileSkeletonContent } from "../components/ProfileSkeleton";
import { useReportUser } from "../api";
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import { postSeen } from "../../../features/Profiles/profilesapi";
import { useSuggestions } from "../Hooks/useSuggestions";

import placeholderImage from "../../../assets/woman.png";
import LocationBar from "../components/Actions/LocationBar";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { restoreMyAccount } from "../../UserProfile/api/profile";
import { formatLastSeen } from "../../Profiles/utlis";
import { computeAge } from "../../../Utlis/utlis";
import { useAddToHomeScreen } from "../Hooks/useAddToHomeScreen";
import AddToHomeBanner from "../components/AddToHomeBanner";
import PendingDeletionBanner from "../components/PendingDeletionBanner";
import { getLanguageName } from "../utlis/getLanguageName";
import ComputingLoading from "../components/Loading/Computing";
import { useLocation } from "react-router-dom";
import { subscribeToPush } from "../utlis/subscribeToPush";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";

import BravePushHelpModal from "../components/Modals/BravePushHelpModal";
import { useTranslation } from "react-i18next";
const ProfileCard = lazy(() => import("../components/Cards/ProfileCard"));
const ProfileTabs = lazy(() => import("../components/Details/ProfileTabs"));
const ActionControls = lazy(
  () => import("../components/Actions/ActionControls"),
);
const AlertMessage = lazy(() => import("../../../components/Ui/Alerts"));
const SwipeDeck = lazy(() => import("../components/Actions/SwipeDeck"));
import ReportUserModal from "../components/Modals/ReportUserModal";
export default function UserHomePage() {
  const { t } = useTranslation("swipe");
  const { data: myProfile } = useMyProfile();
  const queryClient = useQueryClient();
  const location = useLocation();
  const restoreMutation = useMutation({
    mutationFn: restoreMyAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(["my-profile"]);
    },
  });
const { mutate: reportUser } = useReportUser();
  const {
    profiles,
    idx,
    setIdx,
    computing,
    hadPool,
    exhausted,
    canRefresh,
    nextRefreshInSeconds,
    suggestionError,
    currentSource,
    handleRefresh,
    isLoading,
    isFetching,
    isRefreshing,
    refetch,
  } = useSuggestions({
    shouldAutoRefresh: Boolean(location.state?.profileJustCompleted),
  });
const [showReport, setShowReport] = useState(false);
  const [showBraveHelp, setShowBraveHelp] = useState(false);
  const [direction, setDirection] = useState(0);
  const [requestError, setRequestError] = useState("");

  const { canShow, showPrompt, dismiss, isIOSDevice } = useAddToHomeScreen();

  const handleReportSubmit = ({ reportedUsername, reason }) => {
  reportUser(
    { reportedUsername, reason },
    {
      onSuccess: () => {
        setShowReport(false);
      }
    }
  );
};

  const { send: sendMatchRequest } = useSendMatchRequest();

  const seenMutation = useMutation({
    mutationFn: postSeen,
    onError: (err) => {
      console.error("Seen error:", err);
      setRequestError(getErrorMessage(err));
    },
  });

  useEffect(() => {
    if (idx >= profiles.length && profiles.length > 0) {
      setIdx(0);
    }
  }, [profiles.length]);

  useEffect(() => {
    if (!location.state?.justLoggedIn && !location.state?.profileJustCompleted) return;

    const timer = setTimeout(async () => {
      try {
        await subscribeToPush();
      } catch (err) {
        const brave =
          navigator.brave && navigator.brave.isBrave
            ? await navigator.brave.isBrave()
            : false;

        if (brave) {
          setShowBraveHelp(true);
        }
      }

      window.history.replaceState({}, document.title);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.state?.justLoggedIn, location.state?.profileJustCompleted]);

  const advance = useCallback(
    (dir) => {
      setDirection(dir);

      const current = profiles[idx];
      if (!current) return;

      if (currentSource) {
        seenMutation.mutate({
          username: current.PK,
          source: currentSource,
          direction: dir === 1 ? "r" : "l",
        });
      }

      if (dir === 1 && current.PK) {
        sendMatchRequest(current.PK);
      }

      const next = idx + 1;

      if (next >= profiles.length) {
        setIdx(0);
        refetch();
        return;
      }

      setIdx(next);
    },
    [profiles, idx, currentSource, seenMutation, sendMatchRequest, refetch],
  );

  const isNoPool = !computing && !hadPool && profiles.length === 0;

  const isBuffering = isFetching;

  const isEnd = !computing && hadPool && profiles.length === 0 && !exhausted;

  const rawProfile = idx < profiles.length ? profiles[idx] : null;

  let profile = null;

  if (rawProfile) {
    const images = Array.isArray(rawProfile.photos)
      ? rawProfile.photos.sort((a, b) => a.order - b.order).map((p) => p.url)
      : [];

    profile = {
      name: rawProfile.name || t("unknown"),
      age: computeAge(rawProfile.dob),
      about: rawProfile.bio || "",
      gender:
        rawProfile.gender === "F"
          ? t("genderFemale")
          : rawProfile.gender === "M"
            ? t("genderMale")
            : rawProfile.gender,
      images,
      location: rawProfile.location
        ? `${rawProfile.location.placeName}, ${rawProfile.location.countryCode}`
        : "",
      popularity: rawProfile.popularity || 0,
      healthStatus: rawProfile.healthStatus || {
        status: t("unknown"),
        lastTestedDate: t("unknown"),
      },
      lastSeen: formatLastSeen(rawProfile.lastSeen),
      job: rawProfile.jobTitle || "",
      languages: Array.isArray(rawProfile.languagesKnown)
        ? rawProfile.languagesKnown.map(getLanguageName)
        : [],
      interests: rawProfile.interest || [],
      userId: rawProfile.PK,
      suggestionIndex: rawProfile.suggestionIndex,
      feedback: rawProfile.feedback || {},
      healthDisclosures: rawProfile.healthDisclosures || [],
    };
  }

  return (
    <PageLayout className="relative bg-white">

      <LocationBar
        title={myProfile?.location?.placeName || t("locationFallback")}
        subtitle={
          myProfile?.location
            ? `${myProfile.location.placeName}, ${myProfile.location.countryCode}`
            : ""
        }
        onChange={() => {}}
      />

      <div className="relative flex-1">
        {exhausted && canRefresh ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-sm text-gray-500 mb-4">
              {t("caughtUp.message")}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-6 py-2 rounded-full shadow-md transition duration-200 ${
                isRefreshing
                  ? "bg-primary/70 text-white cursor-wait"
                  : "bg-primary text-white hover:opacity-90 active:scale-95"
              }`}
            >
              {isRefreshing ? t("caughtUp.refreshing") : t("caughtUp.refreshProfiles")}
            </button>
          </div>
        ) : isLoading && profiles.length === 0 && !exhausted ? (
          <ProfileSkeletonContent />
        ) : computing ? (
          <ComputingLoading />
        ) : suggestionError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">{t("unexpectedError.title")}</h2>
            <p className="mt-2 text-gray-500">{suggestionError}</p>
            <button
              onClick={handleRefresh}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-full"
            >
              {t("unexpectedError.tryAgain")}
            </button>
          </div>
        ) : isNoPool ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">{t("noPool.title")}</h2>
            <p className="mt-2 text-gray-500">
              {t("noPool.subtitle")}
            </p>
          </div>
        ) : isEnd ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">{t("allSeen.title")}</h2>
            <p className="mt-2 text-gray-500">
              {t("allSeen.subtitle")}
            </p>
          </div>
        ) : isBuffering ? (
          <ProfileSkeletonContent />
        ) : profiles.length === 0 ? null : (
          <Suspense fallback={<ProfileSkeletonContent />}>
            <SwipeDeck
              idx={idx}
              direction={direction}
              profilesLength={profiles.length}
              onAdvance={advance}
            >
              <div className="relative">
                {profile && (
                  <ProfileCard
                    profile={profile}
                    placeholderImage={placeholderImage}
                    onReport={()=>setShowReport(true)}
                  />
                )}

                <div className="flex justify-center mt-2 mb-2">
                  <ActionControls
                    onReject={() => advance(-1)}
                    onRefresh={handleRefresh}
                    onLike={() => advance(1)}
                  />
                </div>
              </div>

              <div className="mt-4 px-4 relative z-10">
                <ProfileTabs profile={profile} authorId={profile?.userId} />
              </div>
            </SwipeDeck>
          </Suspense>
        )}
      </div>

      {myProfile?.tobeDeleted && (
        <PendingDeletionBanner
          expiresAt={myProfile.expiresAt}
          onRestore={() => restoreMutation.mutate()}
          isRestoring={restoreMutation.isPending}
        />
      )}

      {canShow && (
        <AddToHomeBanner
          onAdd={showPrompt}
          onClose={dismiss}
          isIOS={isIOSDevice}
        />
      )}

      <ReportUserModal
  open={showReport}
  username={profile?.userId}
  onClose={() => setShowReport(false)}
  onSubmit={handleReportSubmit}
/>

      <BravePushHelpModal
        open={showBraveHelp}
        onClose={() => setShowBraveHelp(false)}
      />
    </PageLayout>
  );
}