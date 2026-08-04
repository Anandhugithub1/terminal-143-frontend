import React, { lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

import PageHeader from "../../../shared/components/PageHeader"
import SkeletonLoader from "../../../components/Ui/Skeleton"
import EmptyState from "../../../shared/components/EmptyState"
import { useMyProfile } from "../Hooks/useMyProfile"

const QRShareCard = lazy(() => import("../components/Qrcode/Card"))

export default function ShareQRCodePage() {
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useMyProfile()

  const handleShare = async () => {
    if (!profile?.profileLink) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: "Check out my PassorMatch profile!",
          url: profile.profileLink,
        })
      } catch (err) {
        if (err?.name !== "AbortError") toast.error("Failed to share profile")
      }
      return
    }

    try {
      await navigator.clipboard.writeText(profile.profileLink)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  const handleCopyLink = async () => {
    if (!profile?.profileLink) return
    try {
      await navigator.clipboard.writeText(profile.profileLink)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  const handleDownload = async () => {
    if (!profile?.qrCodeUrl) return
    const qrCodeSrc = profile.qrCodeUrl.startsWith("http")
      ? profile.qrCodeUrl
      : `https://${profile.qrCodeUrl}`

    try {
      const res = await fetch(qrCodeSrc)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${profile.name || "profile"}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Unable to download QR code")
    }
  }

  const renderSkeleton = () => (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <SkeletonLoader height={56} width={56} circle className="mx-auto mb-3" />
      <SkeletonLoader height={20} width="50%" className="mx-auto mb-6" />
      <SkeletonLoader height={224} width={224} className="mx-auto mb-6 !rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonLoader height={44} className="!rounded-xl" />
        <SkeletonLoader height={44} className="!rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      <PageHeader title="Share Profile" onBack={() => navigate(-1)} />

      <main className="flex-1 flex items-start justify-center px-4 py-6">
        {isLoading && renderSkeleton()}

        {!isLoading && profile && (
          <Suspense fallback={renderSkeleton()}>
            <QRShareCard
              profile={profile}
              onShare={handleShare}
              onCopyLink={handleCopyLink}
              onDownload={handleDownload}
            />
          </Suspense>
        )}

        {isError && (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load your profile"
            subtitle="Check your connection and try again."
            action={
              <button
                onClick={() => refetch()}
                className="px-6 py-2.5 btn-filled text-sm rounded-full"
              >
                Retry
              </button>
            }
          />
        )}
      </main>
    </div>
  )
}
