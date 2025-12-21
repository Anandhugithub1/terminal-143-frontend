/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import TopNav from '../../../components/Layout/TopNavigation'
import BottomNav from '../../../components/Layout/BottomNavigation'
import ProfileSkeleton from '../components/ProfileSkeleton'
import { useSendMatchRequest } from '../../../Hooks/sendMatchRequest'
import placeholderImage from '../../../assets/woman.png'
import { getMatchProviders, postSeen } from '../../../features/Profiles/profilesapi'
import LocationBar from '../components/Actions/LocationBar'
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile"
import { formatLastSeen } from '../../Profiles/utlis'
// Lazy-loaded components
const ProfileCard = lazy(() => import('../components/Cards/ProfileCard'))
const DetailSection = lazy(() => import('../components/Details/Details'))
const ActionControls = lazy(() => import('../components/Actions/ActionControls'))
const AlertMessage = lazy(() => import('../../../components/Ui/Alerts'))
const SwipeDeck = lazy(() => import('../components/Actions/SwipeDeck'))

export default function UserHomePage() {
  const { data: myProfile } = useMyProfile()

  const locationTitle = myProfile?.location?.placeName || "Location"
  const locationSubtitle = myProfile?.location
    ? `${myProfile.location.placeName}, ${myProfile.location.countryCode}`
    : ""

  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => getMatchProviders({ limit: 10 }),
    staleTime: 1000 * 30
  })

  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const [requestError, setRequestError] = useState('')
  const [nextBatch, setNextBatch] = useState([])

  const { send: sendMatchRequest } = useSendMatchRequest()

  const seenMutation = useMutation({
    mutationFn: postSeen,
    onError: (err) => {
      setRequestError(err.response?.data?.error || err.message)
    }
  })

  // --- Preload next batch locally when near end ---
  useEffect(() => {
    if (profiles.length - idx <= 2 && nextBatch.length === 0) {
      getMatchProviders({ limit: 10 })
        .then(setNextBatch)
        .catch(() => {})
    }
  }, [idx, profiles, nextBatch])

  const handleRefresh = useCallback(() => {
    setIdx(0)
    setNextBatch([])
    refetch()
  }, [refetch])

  const advance = useCallback(
    (dir) => {
      setDirection(dir)
      setIdx((prev) => {
        const current = profiles[prev]

        if (current) {
          seenMutation.mutate({
            suggestionIndex: current.suggestionIndex,
            direction: dir === 1 ? 'r' : 'l'
          })

          const recipientId = current.username || current.pk || current.id
          if (dir === 1 && recipientId) {
            sendMatchRequest(recipientId)
          }
        }

        const next = prev + 1

        if (next >= profiles.length - 1 && nextBatch.length > 0) {
          profiles.push(...nextBatch)
          setNextBatch([])
        }

        return next
      })
    },
    [profiles, seenMutation, sendMatchRequest, nextBatch]
  )

  if (isLoading && profiles.length === 0) return <ProfileSkeleton />
  if (isError) return <div className="p-4 text-red-500">{error.message}</div>

  const isEnd = profiles.length === 0 || idx >= profiles.length

  if (isEnd) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">
          {profiles.length === 0
            ? 'No profiles available'
            : 'Reached the end of profiles'}
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full shadow"
        >
          Refresh Profiles
        </button>
      </div>
    )
  }

  const rawProfile = profiles[idx] || {}
  const images = rawProfile.photos?.length ? rawProfile.photos : []

  const profile = {
    name: rawProfile.name || 'Unknown',
    age: rawProfile.age || 'N/A',
    about: rawProfile.bio || '',
    gender:
      rawProfile.gender === 'F'
        ? 'Female'
        : rawProfile.gender === 'M'
        ? 'Male'
        : rawProfile.gender,
    images,
    location: rawProfile.location || '',
    popularity: rawProfile.popularity || 0,
    healthStatus: rawProfile.healthStatus || {
      status: 'Unknown',
      lastTestedDate: 'Unknown'
    },
    lastSeen: formatLastSeen(rawProfile.lastSeen),

    job: rawProfile.jobTitle || '',
    languages: rawProfile.languagesKnown?.length
      ? rawProfile.languagesKnown
      : rawProfile.language
      ? [rawProfile.language]
      : [],
    interests: rawProfile.interest || [],
    userId: rawProfile.username,
    suggestionIndex: rawProfile.suggestionIndex
  }

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      <LocationBar
        title={locationTitle}
        subtitle={locationSubtitle}
        onChange={() => console.log("Change pressed")}
      />

      {requestError && (
        <div className="px-4 mt-4">
          <Suspense fallback={<ProfileSkeleton />}>
            <AlertMessage
              message={requestError}
              type="error"
              isVisible
              onClose={() => setRequestError('')}
            />
          </Suspense>
        </div>
      )}

      <div className="relative">
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
                onConnectClick={() => {}}
                onMessageClick={() => console.log('Message clicked')}
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
      </div>

      <BottomNav />
    </div>
  )
}
