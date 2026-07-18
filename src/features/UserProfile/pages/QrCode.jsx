// src/pages/ShareQRCodePage.jsx
import React, { useEffect, useState, lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Qrcode/Header"
import Toast from "../components/Qrcode/Toast"
import SkeletonLoader from "../../../components/Ui/Skeleton"
import { useMyProfile } from "../Hooks/useMyProfile"

const QRShareCard = lazy(() => import("../components/Qrcode/Card"))

export default function ShareQRCodePage() {
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useMyProfile()

  const [toast, setToast] = useState({ open: false, message: "" })



  const showToast = (message) => {
    setToast({ open: true, message })
    setTimeout(() => setToast({ open: false, message: "" }), 3000)
  }

  const handleShare = async () => {
    if (!profile?.profileLink) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: "View my MatchMaker profile!",
          url: profile.profileLink
        })
        showToast("Shared successfully")
      } catch {
        showToast("Share cancelled")
      }
    } else {
      showToast("Sharing not supported")
    }
  }

  const renderSkeleton = () => (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-md">
      <SkeletonLoader height={40} width="60%" className="mb-4" />
      <SkeletonLoader height={200} width="100%" className="mb-4" />
      <SkeletonLoader height={40} width="40%" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-pink-50 to-purple-50 font-inter">
      <Header onBack={() => navigate(-1)} />

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        {isLoading && renderSkeleton()}

        {!isLoading && profile && (
          <Suspense fallback={renderSkeleton()}>
            <QRShareCard profile={profile} onShare={handleShare} />
          </Suspense>
        )}

        {isError && (
          <div className="text-center text-red-500 mt-4">
            {error?.message || "Failed to load profile"}
          </div>
        )}
      </main>

      <Toast open={toast.open} message={toast.message} />
    </div>
  )
}
