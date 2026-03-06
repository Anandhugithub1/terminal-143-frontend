import React, { useState } from "react"
import { Edit2, Plus, Camera, ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useEditableProfile } from "../../../Hooks/EditProfile"
import { useMyProfile } from "../Hooks/useMyProfile"

export default function EditPhotosPage() {

  const navigate = useNavigate()

  const { uploadImage } = useEditableProfile()
  const { data: profile, isLoading } = useMyProfile()
const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [previewMap, setPreviewMap] = useState({})

  const galleryRef = React.useRef(null)

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading your photos...</p>
      </div>
    )
  }

  const photos = profile.photos || []

  const getPhoto = (order) => {
    const found = photos.find(p => p.order === order)
    return found ? found.url : null
  }

  const openGallery = (order) => {
    setSelectedOrder(order)
    galleryRef.current.click()
  }

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file || selectedOrder == null) return

  e.target.value = "" // important: allow re-selecting same file & avoid stale state

  const preview = URL.createObjectURL(file)

  setSelectedFile(file)

  setPreviewMap(prev => ({
    ...prev,
    [selectedOrder]: preview
  }))
}
const handleSave = async () => {
  if (!selectedFile || saving) return

  try {
    setSaving(true)

    await uploadImage(selectedFile, selectedOrder)

    toast.success("Photo updated")

    setSelectedFile(null)
    setSelectedOrder(null)
    setPreviewMap({}) // clear previews so UI reflects server data

  } catch (err) {
    console.error(err)
    toast.error(err?.response?.data?.error || "Failed to update photo")
  } finally {
    setSaving(false)
  }
}

  const PhotoCard = ({ order, isAvatar = false }) => {

     const imageUrl =
    previewMap[order] ??
    (isAvatar ? profile.profilePhoto : getPhoto(order)) ??
    null

    const hasImage = !!imageUrl

    return (
      <div className="relative rounded-xl overflow-hidden bg-input aspect-square border border-border-clr">

        {hasImage ? (
          <img
            src={imageUrl}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plus size={32} className="text-gray-400" />
          </div>
        )}

        <button
          onClick={() => openGallery(order)}
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

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
<section className="px-5 pt-6 pb-6 border-b border-border-clr">
  <div className="flex items-center">

    <button
      onClick={() => navigate(-1)}
      className="p-1 rounded-full hover:bg-gray-100"
    >
      <ChevronLeft size={24} className="text-gray-700" />
    </button>

    <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">
      Edit Photos
    </h1>

    {selectedFile ? (
      <button
        onClick={handleSave}
        disabled={saving}
        className={`text-sm font-semibold transition
          ${saving
            ? "text-gray-400 cursor-not-allowed"
            : "text-primary"}
        `}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    ) : (
      <div className="w-6" />
    )}

  </div>
</section>

      <main className="flex-1 px-5 pt-6">

     

        <div className="grid grid-cols-2 gap-4">

          <PhotoCard order={0} isAvatar />

          <PhotoCard order={1} />

          <PhotoCard order={2} />

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