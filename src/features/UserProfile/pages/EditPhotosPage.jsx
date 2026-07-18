import { useState, useRef } from "react"
import { Edit2, Plus, Camera } from "lucide-react"
import { toast } from "sonner"
import { useEditableProfile } from "../../../Hooks/EditProfile"
import { useMyProfile } from "../Hooks/useMyProfile"
import PageHeader from "../../../shared/components/PageHeader"

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

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Loading your photos...</p>
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
    e.target.value = ""
    setSelectedFile(file)
    setPreviewMap((prev) => ({ ...prev, [selectedOrder]: URL.createObjectURL(file) }))
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
      toast.error(err?.response?.data?.error || "Failed to update photo")
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
