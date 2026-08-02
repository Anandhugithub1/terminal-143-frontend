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
  const [selectedFile, setSelectedFile] = useState(null)
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

    setSelectedFile(file)
    setPreviewMap((prev) => {
      const prevUrl = prev[selectedOrder]
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return { ...prev, [selectedOrder]: URL.createObjectURL(file) }
    })
    // Remount the input for the next pick instead of resetting this node's
    // value — see inputKey's comment above.
    setInputKey((k) => k + 1)
  }

  const handleSave = async () => {
    if (!selectedFile || saving) return
    try {
      setSaving(true)
      await uploadImage(selectedFile, selectedOrder)
      toast.success("Photo updated")
      setSelectedFile(null)
      setSelectedOrder(null)
      setPreviewMap({})
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = (order, isAvatar) =>
    previewMap[order] ?? (isAvatar ? profile.profilePhoto : getPhoto(order)) ?? null

  const saveAction = selectedFile ? (
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
