import React, { lazy, Suspense, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { FiLock, FiSlash } from "react-icons/fi"
import { RxCross1 } from "react-icons/rx"
import { FaHeart } from "react-icons/fa"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import { useMyProfile } from "../Hooks/useMyProfile"
import { useProfileByLink } from "../Hooks/getProfileByLink"
import { useMatchRequestResponse, SendProfileFeeback } from "../../UserHome/api"
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest"

import ProfileCard from "../../UserHome/components/Cards/ProfileCard"
import placeholderImage from "../../../assets/woman.png"
import { computeAge } from "../../../Utlis/utlis"
import { LoadingSpinner } from "../../../components/Ui/Spinner"
import DetailSection from "../components/PublicProfile/DetailsSection"
import { Button } from "../../../shared/Button"
import PublicTopbar from "../components/PublicProfile/TopBar"
import TopBar from "../../../components/Layout/TopNavigation"
import BottomNav from "../../../components/Layout/BottomNavigation"
import { useProtectedLocks } from "../Hooks/useProtectedLocks"
import { ConfirmationModal } from "../../../components/Ui/Confirmation"

const ProfileTabs = lazy(() => import("../../UserHome/components/Details/ProfileTabs"))

export default function PublicProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation("swipe")
  const {  username } = useParams()
  const profileLink = `${username}`
  const fromRequest = !!location.state?.fromRequest
  const isMatch = !!location.state?.isMatch

  const [confirmAction, setConfirmAction] = useState(null) // "accept" | "reject" | null

  const respondMutation = useMatchRequestResponse()
  const { send: sendMatchRequest, isSending } = useSendMatchRequest()
  const { mutate: sendFeedback, isLoading: isPassing } = SendProfileFeeback()

  // Logged-in user profile (TanStack Query)
  const {
    data: myProfile,
    isLoading: isMyProfileLoading
  } = useMyProfile()

  // Public profile by link
  const {
    data,
    isLoading: isProfileLoading,
    error: profileError
  } = useProfileByLink(profileLink)

const profileFromHook = data ?? null



  // Access = logged in AND profile loaded
  const hasAccess = !!myProfile && !!profileFromHook

const src = profileFromHook ?? {}

const images = Array.isArray(src.photos)
  ? src.photos
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(p => p.url)
  : []

const normalized = {
  name: src.name ?? src.username ?? "",
  userId: src.username ?? username,
  age: src.dob ? computeAge(src.dob) : null,
  about: src.bio ?? "",

  images: images.length ? images : [placeholderImage],

  interests: Array.isArray(src.preferences)
    ? src.preferences
    : [],

  languages: Array.isArray(src.languagesKnown)
    ? src.languagesKnown
    : [],

  location: src.location ?? "",
  job: src.job ?? "",
  healthStatus: src.healthStatus ?? {}
}


  // locks when user has no access
  const { wrapperRef, layerRef, locks } = useProtectedLocks(!hasAccess)

  const handleRespond = (action) => {
    respondMutation.mutate(
      { senderUsername: username, action },
      {
        onSuccess: () => {
          toast.success(
            action === "accept" ? t("requests.accepted") : t("requests.rejected")
          )
          navigate("/requests")
        },
        onError: () => toast.error(t("requests.genericError")),
      }
    )
    setConfirmAction(null)
  }

  const handleSendMatch = () => {
    sendMatchRequest(username, {
      onSuccess: () => toast.success(t("requests.matchRequestSent")),
    })
  }

  // Pass — record "not interested" feedback (same endpoint the swipe deck /
  // chat list use, liked:false) and step back to where we came from.
  const handlePass = () => {
    sendFeedback(
      { targetUsername: username, liked: false },
      {
        onSuccess: () => {
          toast.success(t("requests.passed"))
          navigate(-1)
        },
        onError: () => toast.error(t("requests.genericError")),
      }
    )
  }

  if (isProfileLoading || isMyProfileLoading) return <LoadingSpinner />

  if (profileError) {
    // A 404 here means the profile is missing OR the two users are blocked —
    // the backend deliberately doesn't distinguish the two (privacy), so we
    // show one neutral "unavailable" state rather than a raw error string.
    const isUnavailable = profileError.status === 404

    return (
      <div className="relative bg-gray-50 min-h-[100dvh]">
        {myProfile ? <TopBar /> : <PublicTopbar />}

        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiSlash size={24} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {isUnavailable ? "Profile unavailable" : "Something went wrong"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isUnavailable
              ? "This profile can't be shown. It may no longer exist, or it isn't available to you."
              : (profileError.message || "We couldn't load this profile. Please try again.")}
          </p>
          <Button onClick={() => navigate(myProfile ? "/matches" : "/")} className="px-6">
            {myProfile ? "Back to matches" : "Go home"}
          </Button>
        </div>

        {myProfile && <BottomNav />}
      </div>
    )
  }

  return (
    <div className="relative bg-gray-50 min-h-[100dvh]">
      {/* top bar */}
      {hasAccess ? <TopBar /> : <PublicTopbar />}

      <div
        className={`relative max-w-2xl mx-auto px-2 pt-2 ${
          !hasAccess ? "pb-36 md:pb-44" : "pb-6"
        }`}
      >
        <div className="relative">
          <ProfileCard
            profile={normalized}
            placeholderImage={placeholderImage}
          />
        </div>

        {!hasAccess && (
          <div className="mt-5 px-2 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-4 md:py-5 px-4">
              <div className="mx-auto w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                <FiLock size={18} className="text-primary font-bold" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">
                Want to see more?
              </h3>
              <p className="text-sm text-gray-500 max-w-[20rem] mx-auto">
                Sign in or create an account to view the full profile and
                connect with {normalized.name}.
              </p>
            </div>
          </div>
        )}

        {hasAccess && !isMatch && (
          <div className="flex justify-center items-center gap-8 mt-5">
            {fromRequest ? (
              <>
                <button
                  aria-label={t("requests.reject") || "Reject"}
                  onClick={() => setConfirmAction("reject")}
                  disabled={respondMutation.isLoading}
                  className="w-16 h-16 flex items-center justify-center bg-black text-white rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  <RxCross1 size={30} />
                </button>
                <button
                  aria-label={t("requests.accept") || "Accept"}
                  onClick={() => setConfirmAction("accept")}
                  disabled={respondMutation.isLoading}
                  className="w-16 h-16 flex items-center justify-center bg-black text-rose-400 rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  <FaHeart size={25} />
                </button>
              </>
            ) : (
              <>
                <button
                  aria-label={t("requests.pass") || "Pass"}
                  onClick={handlePass}
                  disabled={isPassing || isSending}
                  className="w-16 h-16 flex items-center justify-center bg-black text-white rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  <RxCross1 size={30} />
                </button>
                <button
                  aria-label="Send match request"
                  onClick={handleSendMatch}
                  disabled={isSending || isPassing}
                  className="w-16 h-16 flex items-center justify-center bg-black text-rose-400 rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  <FaHeart size={25} />
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-3 px-2 relative z-0">
          <div ref={wrapperRef} className="relative transition-all duration-300">
            {hasAccess ? (
              <Suspense fallback={null}>
                <ProfileTabs profile={normalized} authorId={normalized.userId} />
              </Suspense>
            ) : (
              <DetailSection profile={normalized} locked={!hasAccess} />
            )}
          </div>

          {!hasAccess && (
            <div
              ref={layerRef}
              aria-hidden
              className="absolute inset-0 pointer-events-none z-40"
            >
              {locks.map((lock) => (
                <div
                  key={lock.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: `${lock.top}px`,
                    left: `${lock.left}px`,
                    transform: "translate(-50%, -50%)",
                    width: `${lock.width}px`,
                    height: `${lock.height}px`,
                    pointerEvents: "none"
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!hasAccess && (
        <div
          className="fixed left-0 right-0 flex items-center justify-center px-4 z-50"
          style={{
            bottom: "env(safe-area-inset-bottom, 16px)",
            paddingBottom: "env(safe-area-inset-bottom, 16px)"
          }}
        >
          <div className="w-full max-w-md">
            <Button
              onClick={() => navigate("/login")}
              className="w-full px-4"
            >
              Sign In to View Profile
            </Button>

            <div className="mt-3 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {hasAccess && <BottomNav />}

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleRespond(confirmAction)}
        action={confirmAction}
        name={normalized.name}
      />
    </div>
  )
}
