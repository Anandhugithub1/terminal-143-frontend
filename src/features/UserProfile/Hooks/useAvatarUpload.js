import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { getErrorMessage } from "../../../shared/api/getErrorMessage"

export function useAvatarUpload(uploadImage, profile, updateProfileData) {

  const [showUpload, setShowUpload] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(0)
  const [removing, setRemoving] = useState(false)

  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  const toggleUpload = () => setShowUpload(prev => !prev)

  const openGallery = (order = 0) => {
    setCurrentOrder(order)
    if (galleryRef.current) {
      galleryRef.current.click()
    }
    setShowUpload(false)
  }

  const openCamera = (order = 0) => {
    setCurrentOrder(order)
    if (cameraRef.current) {
      cameraRef.current.click()
    }
    setShowUpload(false)
  }

  const handleFileChange = async (e) => {

    const file = e.target?.files?.[0]
    if (!file) return

    e.target.value = ""

    if (!file.type || !file.type.startsWith("image")) {
      toast.error("Invalid image format")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)

    try {

      // pass order here
      await uploadImage(file, currentOrder)

      toast.success("Photo updated")

    } catch (err) {

      setLocalPreview(null)

      toast.error(getErrorMessage(err))
    }
  }

  const handleRemovePhoto = async () => {

    if (localPreview) {
      URL.revokeObjectURL(localPreview)
    }
    setLocalPreview(null)
    setShowUpload(false)

    const currentPhotos = profile?.photos || []
    const remainingPhotos = currentPhotos.filter(p => p.order !== currentOrder)

    if (remainingPhotos.length === currentPhotos.length) return

    if (remainingPhotos.length === 0) {
      toast.error("You need at least one photo")
      return
    }

    setRemoving(true)
    try {
      await updateProfileData("photos", remainingPhotos)
      toast.success("Photo removed")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRemoving(false)
    }
  }

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
    removing,
    localPreview
  }
}