/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, lazy, Suspense } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import TopNav from "../../../components/Layout/TopNavigation"
import BottomNav from "../../../components/Layout/BottomNavigation"
import ProfileSkeleton from "../components/ProfileSkeleton"
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest"
import placeholderImage from "../../../assets/woman.png"
import { getSuggestions, postSeen } from "../../../features/Profiles/profilesapi"
import LocationBar from "../components/Actions/LocationBar"
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile"
import { formatLastSeen } from "../../Profiles/utlis"
import { computeAge } from "../../../Utlis/utlis"
import { useAddToHomeScreen } from "../Hooks/useAddToHomeScreen"
import AddToHomeBanner from "../components/AddToHomeBanner"
import { getLanguageName } from "../utlis/getLanguageName"

const ProfileCard = lazy(() => import("../components/Cards/ProfileCard"))
const DetailSection = lazy(() => import("../components/Details/Details"))
const ActionControls = lazy(() => import("../components/Actions/ActionControls"))
const AlertMessage = lazy(() => import("../../../components/Ui/Alerts"))
const SwipeDeck = lazy(() => import("../components/Actions/SwipeDeck"))

export default function UserHomePage() {
  const { data: myProfile } = useMyProfile()

  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const [requestError, setRequestError] = useState("")
  const [suggestionError, setSuggestionError] = useState("")
  const [nextBatch, setNextBatch] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [currentSource, setCurrentSource] = useState(null)
const { canShow, showPrompt, dismiss } = useAddToHomeScreen()

  const locationTitle = myProfile?.location?.placeName || "Location"
  const locationSubtitle = myProfile?.location
    ? `${myProfile.location.placeName}, ${myProfile.location.countryCode}`
    : ""

  /* ---------------- Fetch suggestions ---------------- */

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getSuggestions({ limit: 10 }),
    staleTime: 1000 * 30,
    onError: (err) => {
      setSuggestionError(
        err?.response?.status === 500
          ? "Unexpected error occurred. Please try again."
          : err?.message || "Something went wrong"
      )
    }
  })

  const profiles = data?.profiles || []
  const source = data?.source || null

  useEffect(() => {
    if (source) setCurrentSource(source)
  }, [source])

  const { send: sendMatchRequest } = useSendMatchRequest()

  const seenMutation = useMutation({
    mutationFn: postSeen,
    onError: (err) => {
      setRequestError(err?.response?.data?.error || err.message)
    }
  })

  /* ---------------- Prefetch trigger ---------------- */

  useEffect(() => {
    if (!hasMore) return
    if (profiles.length === 0) return
    if (profiles.length - idx > 2) return
    if (nextBatch.length > 0) return

    getSuggestions({ limit: 10 })
      .then((res) => {
        const nextProfiles = res?.profiles || []
        if (nextProfiles.length === 0) {
          setHasMore(false)
          return
        }
        setNextBatch(nextProfiles)
      })
      .catch((err) => {
        setSuggestionError(
          err?.response?.status === 500
            ? "Unexpected error occurred while loading profiles."
            : "Failed to load more profiles."
        )
        setHasMore(false)
      })
  }, [idx, profiles.length, nextBatch.length, hasMore])

  /* ---------------- Actions ---------------- */

const handleRefresh = useCallback(async () => {
  setIsRefreshing(true)

  setIdx(0)
  setNextBatch([])
  setHasMore(true)
  setSuggestionError("")

  await refetch()

  // keep button in refreshing state for at least 1.5s (optional but nicer UX)
  setTimeout(() => {
    setIsRefreshing(false)
  }, 1500)

}, [refetch])

  const advance = useCallback(
    (dir) => {
      setDirection(dir)

      setIdx((prev) => {
        const current = profiles[prev]

        if (current) {
          if (currentSource) {
            seenMutation.mutate({
              index: current.suggestionIndex,
              direction: dir === 1 ? "r" : "l",
              source: currentSource
            })
          }

          if (dir === 1 && current.PK) {
            sendMatchRequest(current.PK)
          }
        }

        const next = prev + 1

        if (next >= profiles.length - 1 && nextBatch.length > 0) {
          setNextBatch([])
          refetch()
        }

        return next
      })
    },
    [profiles, currentSource, seenMutation, sendMatchRequest, nextBatch, refetch]
  )

  /* ---------------- States ---------------- */

  if (isLoading && profiles.length === 0) {
    return <ProfileSkeleton />
  }

  const isEnd = !hasMore || idx >= profiles.length
  const rawProfile = profiles[idx] || {}

  /* ---------------- Profile mapping ---------------- */

  const images = Array.isArray(rawProfile.photos)
    ? rawProfile.photos
        .sort((a, b) => a.order - b.order)
        .map((p) => p.url)
    : []

  const profile = {
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

  /* ---------------- Render ---------------- */

  return (
    <div className="relative bg-white min-h-screen pb-20 flex flex-col">
      <TopNav />

      <LocationBar
        title={locationTitle}
        subtitle={locationSubtitle}
        onChange={() => {}}
      />

      {requestError && (
        <div className="px-4 mt-4">
          <Suspense fallback={<ProfileSkeleton />}>
            <AlertMessage
              message={requestError}
              type="error"
              isVisible
              onClose={() => setRequestError("")}
            />
          </Suspense>
        </div>
      )}

      <div className="relative flex-1">
        {suggestionError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Unexpected error
            </h2>

            <p className="mt-2 text-gray-500 max-w-md">
              {suggestionError}
            </p>

            <button
              onClick={handleRefresh}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-full shadow"
            >
              Try again
            </button>
          </div>
        ) : isEnd ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              You are all caught up
            </h2>

            <p className="mt-2 text-gray-500 max-w-md">
              You’ve seen all the nearby profiles. Come back later — new faces
              are always joining.
            </p>

            <button
  onClick={handleRefresh}
  disabled={isRefreshing}
  className={`mt-6 px-6 py-2 rounded-full shadow transition-all duration-200 ${
    isRefreshing
      ? "bg-gray-100 text-black cursor-not-allowed"
      : "bg-primary text-white hover:opacity-90"
  }`}
>
  {isRefreshing ? "Refreshing..." : "Refresh profiles"}
</button>

          </div>
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

              <div className="mt-16 sm:mt-14 px-4 relative z-10">
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
      />
    )}
    </div>
  )
}
