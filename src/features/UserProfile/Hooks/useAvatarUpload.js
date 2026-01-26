import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"

export function useAvatarUpload(uploadImage) {
  const [showUpload, setShowUpload] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)

  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  const toggleUpload = () => setShowUpload(prev => !prev)

  const openGallery = () => {
    galleryRef.current && galleryRef.current.click()
    setShowUpload(false)
  }

  const openCamera = () => {
    cameraRef.current && cameraRef.current.click()
    setShowUpload(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // allow re-selecting same image
    e.target.value = ""

    // ✅ iOS-safe check (HEIC etc.)
    if (!file.type || !file.type.startsWith("image")) {
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

  const message =
    err?.response?.data?.error ||
    err?.message ||
    "Unable to upload photo. Please try again."

  toast.error(message)
    }
  }

  const handleRemovePhoto = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
    }
    setLocalPreview(null)
    setShowUpload(false)
  }

  // cleanup only when preview actually changes / unmounts
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

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
