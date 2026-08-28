// features/UserProfile/useMyProfile.js
import { useQuery } from "@tanstack/react-query"
import { fetchMyProfile } from "../api/profile"




export const mapProfile = (data) => {
  const photos = Array.isArray(data?.photos) ? data.photos : []
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  const profilePhoto =
    photos.find(p => p.role === "profile")?.url ||
    sortedPhotos[0]?.url ||
    null

  return {
    username: data?.PK || "",
    name: data?.name || "User",
    dob: data?.dob || null,
    gender: data?.gender || null,
    bio: data?.bio || "",
    languagesKnown: data?.languagesKnown || [],
    preferences: data?.preferences || [],
    interest: data?.interest || [],
    socialMediaLinks: data?.socialMediaLinks || [],
    location: data?.location || null,
    qrCodeUrl: data?.qrCodeUrl || null,
    profileCompleted: Boolean(data?.profileCompleted),
    popularity: data?.popularity || 0,
    photos,
    profileLink:data?.profileLink || "",
    profilePhoto,
    tobeDeleted: Boolean(data?.tobeDeleted),
    deletionDate: data?.deletionDate || null,
    expiresAt: data?.expiresAt || null,
    // Defaults true, matching the schema default — Boolean(undefined) would
    // silently read as false for any profile predating this field, which
    // would show the toggle as "off" for someone who never touched it.
    showCircleActivity: data?.showCircleActivity !== false,
    // Prefer the backend's derived boolean, but fall back to deriving it from
    // the raw ageVerification status (own-profile responses include the object)
    // so the badge works even if the deployed API predates the derived field.
    ageVerified:
      Boolean(data?.ageVerified) || data?.ageVerification?.status === "passed",
    // "Verified" badge: live selfie matched the profile photo on a passed check.
    // Prefer the backend boolean; fall back to the raw object for own-profile
    // responses so it works before the derived field is deployed.
    photoVerified:
      Boolean(data?.photoVerified) ||
      (data?.ageVerification?.status === "passed" &&
        data?.ageVerification?.photoVerified === true),
    raw: data
  }
}



export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    select: mapProfile,
    staleTime: 1000 * 60 * 5
  })
}
