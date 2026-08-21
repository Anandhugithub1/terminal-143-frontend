import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMyProfile,
  updateMyProfile,
  getPresignedUrl
} from "../features/UserProfile/api/profile"
import { ensureNormalizedImage } from "../utils/imageConversion"
// Aliased: this hook has its own uploadToS3 that wraps the presigned-URL fetch.
import { uploadToS3 as putToS3 } from "../shared/utils/uploadToS3"

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
    // Seed the cache with the server's response directly rather than only
    // invalidating: invalidateQueries schedules a background refetch but
    // does not wait for it, so a caller awaiting mutateAsync can still read
    // stale data from the cache immediately after. That mattered concretely
    // for photo uploads/removals fired back-to-back — see uploadImage.
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["my-profile"], data.user)
      } else {
        queryClient.invalidateQueries(["my-profile"])
      }
    }
  })

  /**
   * Generic profile field update
   */
  const updateProfileData = async (key, value) => {
    await updateMutation.mutateAsync({ [key]: value })
  }

  // FileTransfer.uploadFile (see shared/utils/uploadToS3) can resolve
  // successfully on native platforms even when the object never actually
  // landed in S3 — seen in production as a photo that saves fine (updateUser
  // succeeds) but 404s from CloudFront forever after, because nothing in the
  // upload path ever confirms the object exists before we trust it. A HEAD
  // against the public URL closes that gap. CloudFront can take a moment to
  // reflect a just-written object, so this retries briefly before giving up.
  const VERIFY_RETRIES = 3
  const VERIFY_DELAY_MS = 800

  const verifyUploaded = async (publicUrl) => {
    for (let attempt = 0; attempt <= VERIFY_RETRIES; attempt++) {
      try {
        const res = await fetch(publicUrl, { method: "HEAD", cache: "no-store" })
        if (res.ok) return
      } catch {
        // Network hiccup on the verification HEAD itself — treat the same as
        // a not-yet-visible object and retry below.
      }
      if (attempt < VERIFY_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, VERIFY_DELAY_MS))
      }
    }
    throw new Error("UPLOAD_NOT_VERIFIED")
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

    await putToS3(presignedUrl, uploadFile)

    // Don't trust putToS3 resolving as proof the object exists — verify
    // before this URL is ever handed to updateUser and persisted.
    await verifyUploaded(publicUrl)

    return publicUrl
  }

  /**
   * Upload image to specific order slot
   */
  const uploadImage = async (file, order = 0) => {
    const publicUrl = await uploadToS3(file, order)

    // The backend treats whatever `photos` we send as the complete,
    // authoritative set (see updateUser's comment server-side) — so this
    // must be the freshest known photos, not this hook's own `profile`
    // snapshot, which can be behind if another upload just landed in the
    // same session and this component hasn't re-rendered with it yet.
    // Reading straight from the query cache avoids that stale-closure race.
    const latestProfile = queryClient.getQueryData(["my-profile"])
    const currentPhotos = latestProfile?.photos || profile?.photos || []
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

    // The mutation's shared onSuccess (above) seeds the cache with the
    // server's response synchronously, so by the time mutateAsync resolves
    // here, getQueryData(["my-profile"]) at the top of this function is
    // guaranteed fresh for the next call — no separate invalidate needed.
    await updateMutation.mutateAsync({
      photos: updatedPhotos.filter(Boolean)
    })
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
