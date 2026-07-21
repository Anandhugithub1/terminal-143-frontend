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
