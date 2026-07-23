
  /* ========== features/UserProfile/api.js ========== */
import { userProfilesApi } from "../../../api/clients";
/** Fetch the current user's profile */
// export const fetchMyProfile = () =>
//   userProfilesApi.get('v0.2/user/profile', { withCredentials: true });
export const fetchMyProfile = async () => {
  const res = await userProfilesApi.get(
    "/v0.2/user/profile",
    { withCredentials: true }
  )
  return res.data
}

/** Patch any profile fields */

/** Update profile fields */
export const updateMyProfile = async (payload) => {
  const res = await userProfilesApi.post(
    "/v0.2/user/update",
    payload,
    { withCredentials: true }
  )
  return res.data
}


export const getProfileByLink = async (username) => {
  try {
    const res = await userProfilesApi.get("/v0.2/user/by-link", {
      params: { username },
      withCredentials: true
    })

    return res.data.profile
  } catch (err) {
    // Surface the HTTP status so callers can distinguish "unavailable"
    // (404 — missing OR blocked; the backend deliberately doesn't reveal
    // which) from real errors, and render an appropriate empty state.
    const status = err?.response?.status
    const wrapped = new Error(
      status === 404 ? "Profile unavailable" : (err?.message || "Could not load profile")
    )
    wrapped.status = status
    throw wrapped
  }
}


/**
 * Schedule the current user's account for deletion (soft delete).
 * The account is hidden everywhere immediately and permanently removed after
 * a grace period; it can be restored until then via restoreMyAccount().
 * Returns { message, deletionDate, deleteAt }.
 */
export const deleteMyAccount = async () => {
  const res = await userProfilesApi.delete(
    "v0.2/user/delete",
    { withCredentials: true }
  )
  return res.data
}

/** Undo a scheduled deletion during the grace period. */
export const restoreMyAccount = async () => {
  const res = await userProfilesApi.post(
    "v0.2/user/restore",
    {},
    { withCredentials: true }
  )
  return res.data
}

/** Get presigned URL for image upload */
export const getPresignedUrl = async ({ fileType, photoIndex }) => {
  const res = await userProfilesApi.post(
    "v0.2/user/presigned-url",
    { fileType, photoIndex },
    { withCredentials: true }
  )
  return res.data
}


/** Complete profile setup (finalize user profile) */
export const completeProfileApi = (payload) =>
  userProfilesApi.post('/v0.2/user/complete-profile', payload, {
    withCredentials: true,
  });

/** Get profile by link (alternative endpoint) */
export const getProfileBYLink = (link) =>
  userProfilesApi.get(`/user/profile/${link}`, { withCredentials: true });
