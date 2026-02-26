/* eslint-disable no-unused-vars */
import React, { useState, useCallback, lazy, Suspense,useEffect } from "react"
import { useMutation } from "@tanstack/react-query"

import TopNav from "../../../components/Layout/TopNavigation"
import BottomNav from "../../../components/Layout/BottomNavigation"
import ProfileSkeleton from "../components/ProfileSkeleton"

import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest"
import { postSeen } from "../../../features/Profiles/profilesapi"
import { useSuggestions } from "../Hooks/useSuggestions"

import placeholderImage from "../../../assets/woman.png"
import LocationBar from "../components/Actions/LocationBar"
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile"
import { formatLastSeen } from "../../Profiles/utlis"
import { computeAge } from "../../../Utlis/utlis"
import { useAddToHomeScreen } from "../Hooks/useAddToHomeScreen"
import AddToHomeBanner from "../components/AddToHomeBanner"
import { getLanguageName } from "../utlis/getLanguageName"
import ComputingLoading from "../components/Loading/Computing"
import { useLocation } from "react-router-dom";
import { subscribeToPush } from "../utlis/subscribeToPush";

import BravePushHelpModal from "../components/Modals/BravePushHelpModal";
const ProfileCard = lazy(() => import("../components/Cards/ProfileCard"))
const DetailSection = lazy(() => import("../components/Details/Details"))
const ActionControls = lazy(() => import("../components/Actions/ActionControls"))
const AlertMessage = lazy(() => import("../../../components/Ui/Alerts"))
const SwipeDeck = lazy(() => import("../components/Actions/SwipeDeck"))

export default function UserHomePage() {
  const { data: myProfile } = useMyProfile()

const {
  profiles,
  idx,
  setIdx,
  computing,
  hadPool,
  suggestionError,
  currentSource,
  handleRefresh,
  refetch,
  isLoading,
  isFetching,
  isRefreshing,
  canRefresh,
  nextRefreshInSeconds,
  exhausted
} = useSuggestions()
const location = useLocation();
const [showBraveHelp, setShowBraveHelp] = useState(false);
  const [direction, setDirection] = useState(0)
  const [requestError, setRequestError] = useState("")

  const { canShow, showPrompt, dismiss, isIOSDevice } =
    useAddToHomeScreen()

  const { send: sendMatchRequest } = useSendMatchRequest()

 
const seenMutation = useMutation({
  mutationFn: postSeen,
  onError: (err) => {
    console.error("Seen error:", err)
    setRequestError(
      err?.response?.data?.error || err.message
    )
  }
})

useEffect(() => {
  if (!location.state?.justLoggedIn) return;

  console.log("Push effect triggered");

  const timer = setTimeout(async () => {
    try {
      await subscribeToPush();
      console.log("Push success");
    } catch (err) {
      console.log("Caught push error");
      console.error("Push subscription failed:", err);

      const brave =
        navigator.brave && navigator.brave.isBrave
          ? await navigator.brave.isBrave()
          : false;

      console.log("Is Brave:", brave);

      if (brave) {
        setShowBraveHelp(true);
      }
    }

    // Clear router state AFTER logic
    window.history.replaceState({}, document.title);

  }, 2000);

  return () => clearTimeout(timer);

}, [location.state?.justLoggedIn]);
  /* ---------------- Swipe Logic ---------------- */

  const advance = useCallback(
  (dir) => {

    setDirection(dir)

    setIdx((prev) => {

      const current = profiles[prev]

if (!current) {
  refetch()
  return prev + 1
}

      if (currentSource) {
  seenMutation.mutate({
    username: current.PK,
    source: currentSource,
    direction: dir === 1 ? "r" : "l"
  })
}

      if (dir === 1 && current.PK) {
        sendMatchRequest(current.PK)
      }


const next = prev + 1

// If we're at end, trigger refetch and allow index to move
if (next >= profiles.length) {
  refetch()
  return next
}

// Prefetch earlier for smoother UX
if (profiles.length - next <= 3) {
  refetch()
}



      return next
    })

  },
  [profiles, currentSource, seenMutation, sendMatchRequest, refetch]
)


  /* ---------------- Loading ---------------- */



  const isNoPool =
    !computing && !hadPool && profiles.length === 0
const isBuffering =
  !computing &&
  profiles.length > 0 &&
  idx >= profiles.length

const isEnd =
  !computing && hadPool && profiles.length === 0 && !exhausted

  /* ---------------- Profile Selection ---------------- */

  const rawProfile =
    idx < profiles.length ? profiles[idx] : null

  /* ---------------- Profile Mapping ---------------- */

  let profile = null

  if (rawProfile) {
    const images = Array.isArray(rawProfile.photos)
      ? rawProfile.photos
          .sort((a, b) => a.order - b.order)
          .map((p) => p.url)
      : []

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
        lastTestedDate: "Unknown"
      },
      lastSeen: formatLastSeen(rawProfile.lastSeen),
      job: rawProfile.jobTitle || "",
      languages: Array.isArray(rawProfile.languagesKnown)
        ? rawProfile.languagesKnown.map(getLanguageName)
        : [],
      interests: rawProfile.interest || [],
      userId: rawProfile.username,
      suggestionIndex: rawProfile.suggestionIndex
    }
  }

  /* ---------------- Render ---------------- */

 return (
  <div className="relative bg-white min-h-screen pb-20 flex flex-col">
    <TopNav />

    <LocationBar
      title={myProfile?.location?.placeName || "Location"}
      subtitle={
        myProfile?.location
          ? `${myProfile.location.placeName}, ${myProfile.location.countryCode}`
          : ""
      }
      onChange={() => {}}
    />


{exhausted && (
  <div className="flex flex-col items-center mt-3">
    <div className="text-sm text-gray-500">
      {/* No new profiles. Showing recycled matches. */}
    </div>

    {canRefresh ? (
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`mt-3 px-6 py-2 rounded-full shadow-md transition ${
          isFetching
            ? "bg-gray-400 text-white"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
        {isRefreshing ? "Refreshing..." : "Find New Matches"}
      </button>
    ) : nextRefreshInSeconds > 0 ? (
      <div className="mt-2 text-xs text-gray-400">
        New refresh available in {Math.ceil(nextRefreshInSeconds)} seconds
      </div>
    ) : null}
  </div>
)}

    <div className="relative flex-1">

      {/* Initial loading (only when no profiles yet) */}
      {(isLoading || isFetching) && profiles.length === 0 ? (
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
          <h2 className="text-xl font-semibold">
            No matches found nearby
          </h2>
          <p className="mt-2 text-gray-500">
            Try expanding your search radius or updating your preferences.
          </p>
        </div>

      ) : isEnd ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-xl font-semibold">
            You are all caught up
          </h2>
          <p className="mt-2 text-gray-500">
            You’ve seen all nearby profiles.
          </p>
        </div>

      ) : isBuffering ? (
        <ProfileSkeleton />

      ) : !profile ? (
        <ProfileSkeleton />

      ) : (
        <Suspense fallback={<ProfileSkeleton />}>
          <SwipeDeck
            idx={idx}
            direction={direction}
            profilesLength={profiles.length}
            onAdvance={advance}
          >
            <div className="relative">
              <ProfileCard
                profile={profile}
                placeholderImage={placeholderImage}
              />
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

    <BottomNav />

    {canShow && (
      <AddToHomeBanner
        onAdd={showPrompt}
        onClose={dismiss}
        isIOS={isIOSDevice}
      />
    )}
   <BravePushHelpModal
  open={showBraveHelp}
  onClose={() => setShowBraveHelp(false)}
/>
  </div>
  
)

}
