import { useState, useRef } from "react"
import { toast } from "sonner"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]

export function useAvatarUpload(uploadImage) {
  const [showUpload, setShowUpload] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)

  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  const toggleUpload = () => setShowUpload(prev => !prev)

  const openGallery = () => {
    galleryRef.current?.click()
    setShowUpload(false)
  }

  const openCamera = () => {
    cameraRef.current?.click()
    setShowUpload(false)
  }

const handleFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  e.target.value = ""

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error("Invalid image format")
    return
  }

  const previewUrl = URL.createObjectURL(file)
setLocalPreview(previewUrl)

try {
  await uploadImage(file)
  toast.success("Profile photo updated")
} catch {
  setLocalPreview(null)
  toast.error("Unable to upload photo. Please try again.")
} finally {
  URL.revokeObjectURL(previewUrl)
}

}


  const handleRemovePhoto = () => {
    setLocalPreview(null)
    setShowUpload(false)
  }

  return {
    showUpload,
    toggleUpload,
    openGallery,
    openCamera,
    galleryRef,
    cameraRef,
    handleFileChange,
    handleRemovePhoto,
    localPreview
  }
}
