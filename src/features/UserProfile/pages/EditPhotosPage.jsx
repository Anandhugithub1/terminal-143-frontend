import { useState, useRef } from "react"
import { Edit2, Plus, Camera } from "lucide-react"
import { toast } from "sonner"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { useEditableProfile } from "../../../Hooks/EditProfile"
import { useMyProfile } from "../Hooks/useMyProfile"
import PageHeader from "../../../shared/components/PageHeader"
import { getErrorMessage } from "../../../shared/api/getErrorMessage"

function PhotoCard({ order, isAvatar = false, imageUrl, onOpen }) {
  const hasImage = !!imageUrl

  return (
    <div className="relative rounded-xl overflow-hidden bg-input aspect-square border border-border-clr">
      {hasImage ? (
        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Plus size={32} className="text-gray-400" />
        </div>
      )}

      <button
        aria-label={isAvatar ? "Change profile photo" : "Change photo"}
        onClick={() => onOpen(order)}
        className="absolute bottom-2 right-2 bg-primary p-2 rounded-full shadow"
      >
        <Edit2 size={16} className="text-white" />
      </button>

      {isAvatar && (
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
          <Camera size={12} className="text-primary" />
          Profile
        </div>
      )}
    </div>
  )
}

export default function EditPhotosPage() {
  const galleryRef = useRef(null)
  const { uploadImage } = useEditableProfile()
  const { data: profile, isLoading } = useMyProfile()
  const [saving, setSaving] = useState(false)
  // Keyed by order: the UI lets you pick a new photo for several slots
  // before tapping the single Save button (previewMap already showed every
  // pending pick at once), but a single selectedFile/selectedOrder pair only
  // ever remembered the LAST pick — every earlier one was silently dropped
  // on save with no error, no toast, nothing. Tracking one pending file per
  // slot instead means Save uploads everything that was actually picked.
  const [pendingFiles, setPendingFiles] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [previewMap, setPreviewMap] = useState({})
  // Bumped on every pick to force the <input type="file"> to remount (via
  // `key`) instead of being reused. On mobile, resetting and re-clicking the
  // SAME input node right after a pick is unreliable — the next change event
  // can silently fail to fire, so re-picking a photo for the same slot
  // before saving looked like it "did nothing". A fresh node sidesteps that.
  const [inputKey, setInputKey] = useState(0)

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-white">
        <PageHeader title="Edit Photos" action={<Skeleton width={40} height={16} />} />

        <main className="flex-1 px-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square !block" borderRadius={12} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  const photos = profile.photos || []
  const getPhoto = (order) => photos.find((p) => p.order === order)?.url ?? null

  const openGallery = (order) => {
    setSelectedOrder(order)
    galleryRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || selectedOrder == null) return

    setPendingFiles((prev) => ({ ...prev, [selectedOrder]: file }))
    setPreviewMap((prev) => {
      const prevUrl = prev[selectedOrder]
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return { ...prev, [selectedOrder]: URL.createObjectURL(file) }
    })
    // Remount the input for the next pick instead of resetting this node's
    // value — see inputKey's comment above.
    setInputKey((k) => k + 1)
  }

  const pendingOrders = Object.keys(pendingFiles)

  // Uploads every picked slot, one at a time — NOT in parallel. Each call
  // to uploadImage reads the current "complete" photo array from the query
  // cache, adds its one slot, and saves that whole array back (see
  // EditProfile.jsx's uploadImage/updateUser — the backend trusts whatever
  // array it's sent as authoritative). Firing these concurrently would let
  // two calls read the same stale array before either write lands, so
  // whichever updateUser resolved last would silently overwrite the other's
  // slot — the exact stale-cache race already fixed once for back-to-back
  // uploads. A failure on one slot doesn't stop the rest from being tried;
  // every failure gets its own toast so a partial save is never silently
  // swallowed.
  const handleSave = async () => {
    if (!pendingOrders.length || saving) return
    try {
      setSaving(true)
      const results = []
      for (const order of pendingOrders) {
        try {
          await uploadImage(pendingFiles[order], Number(order))
          results.push({ status: "fulfilled" })
        } catch (err) {
          results.push({ status: "rejected", reason: err })
        }
      }

      const failedOrders = pendingOrders.filter((_, i) => results[i].status === "rejected")
      const succeededOrders = pendingOrders.filter((_, i) => results[i].status === "fulfilled")

      if (succeededOrders.length) {
        toast.success(succeededOrders.length > 1 ? "Photos updated" : "Photo updated")
      }
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          toast.error(getErrorMessage(r.reason))
        }
      })

      // Clear only what succeeded — a failed slot keeps its pending file and
      // preview so the user can retry it without re-picking, same as the
      // wizard's per-slot retry.
      setPendingFiles((prev) => {
        const next = { ...prev }
        succeededOrders.forEach((order) => delete next[order])
        return next
      })
      setPreviewMap((prev) => {
        const next = { ...prev }
        succeededOrders.forEach((order) => {
          const url = next[order]
          if (url) URL.revokeObjectURL(url)
          delete next[order]
        })
        return next
      })
      if (!failedOrders.length) {
        setSelectedOrder(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = (order, isAvatar) =>
    previewMap[order] ?? (isAvatar ? profile.profilePhoto : getPhoto(order)) ?? null

  const saveAction = pendingOrders.length ? (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`text-sm font-semibold transition ${saving ? "text-gray-400 cursor-not-allowed" : "text-primary"}`}
    >
      {saving ? "Saving..." : "Save"}
    </button>
  ) : (
    <div className="w-10" />
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <PageHeader title="Edit Photos" action={saveAction} />

      <main className="flex-1 px-5 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <PhotoCard order={0} isAvatar imageUrl={getImageUrl(0, true)} onOpen={openGallery} />
          <PhotoCard order={1} imageUrl={getImageUrl(1, false)} onOpen={openGallery} />
          <PhotoCard order={2} imageUrl={getImageUrl(2, false)} onOpen={openGallery} />
        </div>

        <input
          key={inputKey}
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </main>
    </div>
  )
}
