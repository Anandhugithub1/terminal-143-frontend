/* eslint-disable no-unused-vars */
import React, { useState, useCallback, lazy, Suspense } from "react"
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
    isLoading
  } = useSuggestions()

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


  /* ---------------- Swipe Logic ---------------- */

  const advance = useCallback(
  (dir) => {

    setDirection(dir)

    setIdx((prev) => {

      const current = profiles[prev]

      if (!current) return prev

      if (currentSource) {
        seenMutation.mutate({
          username: current.PK,
          source: currentSource
        })
      }

      if (dir === 1 && current.PK) {
        sendMatchRequest(current.PK)
      }

      const next = prev + 1

      if (next >= profiles.length) {
        return prev
      }

      if (profiles.length - next <= 2) {
        refetch()
      }

      return next
    })

  },
  [profiles, currentSource, seenMutation, sendMatchRequest, refetch]
)


  /* ---------------- Loading ---------------- */

  if (isLoading) return <ProfileSkeleton />

  const isNoPool =
    !computing && !hadPool && profiles.length === 0

  const isEnd =
    !computing && hadPool && profiles.length === 0

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

      <div className="relative flex-1">

        {computing ? (
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
    </div>
  )
}
