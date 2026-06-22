/* eslint-disable no-unused-vars */
import React, { useState, useCallback, lazy, Suspense, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import PageLayout from "../../../shared/components/PageLayout";
import ProfileSkeleton from "../components/ProfileSkeleton";
import { useReportUser } from "../api";
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import { postSeen } from "../../../features/Profiles/profilesapi";
import { useSuggestions } from "../Hooks/useSuggestions";

import placeholderImage from "../../../assets/woman.png";
import LocationBar from "../components/Actions/LocationBar";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { formatLastSeen } from "../../Profiles/utlis";
import { computeAge } from "../../../Utlis/utlis";
import { useAddToHomeScreen } from "../Hooks/useAddToHomeScreen";
import AddToHomeBanner from "../components/AddToHomeBanner";
import { getLanguageName } from "../utlis/getLanguageName";
import ComputingLoading from "../components/Loading/Computing";
import { useLocation } from "react-router-dom";
import { subscribeToPush } from "../utlis/subscribeToPush";

import BravePushHelpModal from "../components/Modals/BravePushHelpModal";
const ProfileCard = lazy(() => import("../components/Cards/ProfileCard"));
const DetailSection = lazy(() => import("../components/Details/Details"));
const ActionControls = lazy(
  () => import("../components/Actions/ActionControls"),
);
const AlertMessage = lazy(() => import("../../../components/Ui/Alerts"));
const SwipeDeck = lazy(() => import("../components/Actions/SwipeDeck"));
import ReportUserModal from "../components/Modals/ReportUserModal";
export default function UserHomePage() {
  const { data: myProfile } = useMyProfile();
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
  } = useSuggestions();
const [showReport, setShowReport] = useState(false);
  const location = useLocation();
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
      setRequestError(err?.response?.data?.error || err.message);
    },
  });

  useEffect(() => {
    if (idx >= profiles.length && profiles.length > 0) {
      setIdx(0);
    }
  }, [profiles.length]);

  useEffect(() => {
    if (!location.state?.justLoggedIn) return;

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
  }, [location.state?.justLoggedIn]);

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
      name: rawProfile.name || "Unknown",
      age: computeAge(rawProfile.dob),
      about: rawProfile.bio || "",
      gender:
        rawProfile.gender === "F"
          ? "Female"
          : rawProfile.gender === "M"
            ? "Male"
            : rawProfile.gender,
      images,
      location: rawProfile.location
        ? `${rawProfile.location.placeName}, ${rawProfile.location.countryCode}`
        : "",
      popularity: rawProfile.popularity || 0,
      healthStatus: rawProfile.healthStatus || {
        status: "Unknown",
        lastTestedDate: "Unknown",
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
        title={myProfile?.location?.placeName || "Location"}
        subtitle={
          myProfile?.location
            ? `${myProfile.location.placeName}, ${myProfile.location.countryCode}`
            : ""
        }
        onChange={() => {}}
      />

      {exhausted && canRefresh && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-sm text-gray-500 mb-4">
            You're all caught up. Refresh to discover new profiles.
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
            {isRefreshing ? "Refreshing..." : "Refresh Profiles"}
          </button>
        </div>
      )}

      <div className="relative flex-1">
        {isLoading && profiles.length === 0 && !exhausted ? (
          <ProfileSkeleton />
        ) : computing ? (
          <ComputingLoading />
        ) : suggestionError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">Unexpected error</h2>
            <p className="mt-2 text-gray-500">{suggestionError}</p>
            <button
              onClick={handleRefresh}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-full"
            >
              Try again
            </button>
          </div>
        ) : isNoPool ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">No matches found nearby</h2>
            <p className="mt-2 text-gray-500">
              Try expanding your search radius or updating your preferences.
            </p>
          </div>
        ) : isEnd ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-xl font-semibold">You are all caught up</h2>
            <p className="mt-2 text-gray-500">
              You’ve seen all nearby profiles.
            </p>
          </div>
        ) : isBuffering ? (
          <ProfileSkeleton />
        ) : profiles.length === 0 || (exhausted && canRefresh) ? null : (
          <Suspense fallback={<ProfileSkeleton />}>
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

              <div className="mt-16 px-4 relative z-10">
                <DetailSection profile={profile} />
              </div>
            </SwipeDeck>
          </Suspense>
        )}
      </div>

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