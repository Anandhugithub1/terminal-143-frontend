import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMyProfile,
  updateMyProfile,
  getPresignedUrl
} from "../features/UserProfile/api/profile"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]

export function useEditableProfile() {
  const queryClient = useQueryClient()
  const [localAvatar, setLocalAvatar] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // READ
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile
  })

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["my-profile"])
    }
  })

  const updateProfileData = async (key, value) => {
    await updateMutation.mutateAsync({ [key]: value })
  }

  // UPLOAD IMAGE (client-side)
  const uploadImage = async (file, photoIndex = 0) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Invalid image format")
      return
    }

    setIsUploading(true)
    const preview = URL.createObjectURL(file)
    setLocalAvatar(preview)

    try {
      const { presignedUrl, publicUrl } =
        await getPresignedUrl({ fileType: file.type, photoIndex })

      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      })

      await updateMutation.mutateAsync({
        photos: [{ url: publicUrl, isProfile: photoIndex === 0, order: photoIndex }]
      })

      queryClient.invalidateQueries(["my-profile"])
    } finally {
      setIsUploading(false)
    }
  }

  return {
    profile,
    status: isLoading ? "loading" : "succeeded",
    isUploading,
    isFetching: isLoading,
    localAvatar,
    updateProfileData,
    uploadImage
  }
}
