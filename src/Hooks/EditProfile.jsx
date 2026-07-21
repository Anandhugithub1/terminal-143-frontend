import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMyProfile,
  updateMyProfile,
  getPresignedUrl
} from "../features/UserProfile/api/profile"
import { ensureNormalizedImage } from "../utils/imageConversion"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
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
  const uploadToS3 = async (file, order) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("INVALID_FILE_TYPE")
    }

    const uploadFile = await ensureNormalizedImage(file)

    const { presignedUrl, publicUrl } =
      await getPresignedUrl({ fileType: uploadFile.type, photoIndex: order })

    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadFile.type },
      body: uploadFile
    })

    return publicUrl
  }

  /**
   * Upload image to specific order slot
   */
  const uploadImage = async (file, order = 0) => {
    const publicUrl = await uploadToS3(file, order)

    const currentPhotos = profile?.photos || []
    const newPhoto = {
      url: publicUrl,
      isProfile: order === 0,
      slot: order,
      order: order
    }

    // Replace in place at `order` instead of appending — appending would
    // put e.g. a slot-1 upload after an existing slot-2 photo.
    const updatedPhotos = [...currentPhotos]
    updatedPhotos[order] = newPhoto

    await updateMutation.mutateAsync({
      photos: updatedPhotos.filter(Boolean)
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
    uploadImage
  }
}
