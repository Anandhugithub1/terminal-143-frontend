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

  /**
   * Generic profile field update
   */
  const updateProfileData = async (key, value) => {
    await updateMutation.mutateAsync({ [key]: value })
  }

  /**
   * Internal helper to upload a photo to S3
   */
  const uploadToS3 = async (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("INVALID_FILE_TYPE")
    }

    const { presignedUrl, publicUrl } =
      await getPresignedUrl({ fileType: file.type })

    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    })

    return publicUrl
  }

  /**
   * Upload PROFILE photo
   * - Always slot 0
   */
  const uploadProfileImage = async (file) => {
    const publicUrl = await uploadToS3(file)

    await updateMutation.mutateAsync({
      photos: [
        {
          url: publicUrl,
          isProfile: true,
          slot: 0,
          order: 0
        }
      ]
    })

    queryClient.invalidateQueries(["my-profile"])
  }

  /**
   * Upload GALLERY image
   * - slot must be 1–4
   */
  const uploadGalleryImage = async (file, slot) => {
    if (!Number.isInteger(slot) || slot < 1 || slot > 4) {
      throw new Error("INVALID_GALLERY_SLOT")
    }

    const publicUrl = await uploadToS3(file)

    await updateMutation.mutateAsync({
      photos: [
        {
          url: publicUrl,
          isProfile: false,
          slot,
          order: slot
        }
      ]
    })

    queryClient.invalidateQueries(["my-profile"])
  }

  return {
    profile,
    status: isLoading ? "loading" : "succeeded",
    isFetching: isLoading,

    // non-photo updates
    updateProfileData,

    // photo uploads
    uploadProfileImage,
    uploadGalleryImage
  }
}
