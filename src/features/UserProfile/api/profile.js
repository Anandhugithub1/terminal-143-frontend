
  /* ========== features/UserProfile/api.js ========== */
import { userProfilesApi } from "../../../api/clients";
/** Fetch the current user's profile */
// export const fetchMyProfile = () =>
//   userProfilesApi.get('v0.2/user/profile', { withCredentials: true });
export const fetchMyProfile = async () => {
  const res = await userProfilesApi.get(
    "v0.2/user/profile",
    { withCredentials: true }
  )
  return res.data
}

/** Patch any profile fields */

/** Update profile fields */
export const updateMyProfile = async (payload) => {
  const res = await userProfilesApi.post(
    "v0.2/user/update",
    payload,
    { withCredentials: true }
  )
  return res.data
}

/** Patch any profile fields */
export const updateProfileData = (payload) =>
  userProfilesApi.post('/user/update', payload, { withCredentials: true });
/** Get profile by public link */
export const getProfileByLink = async (link) => {
  const fullUrl = `https://terminal143.com/profile/${link}`;
  const res = await userProfilesApi.get('/user/by-link', {
    params: { url: fullUrl },  withCredentials: true
  });

  return res.data.profile;
};

/** Get presigned URL for image upload */
export const getPresignedUrl = async ({ fileType, photoIndex }) => {
  const res = await userProfilesApi.post(
    "/user/presigned-url",
    { fileType, photoIndex },
    { withCredentials: true }
  )
  return res.data
}


/** Complete profile setup (finalize user profile) */
export const completeProfileApi = (payload) =>
  userProfilesApi.post('v0.2//user/complete-profile', payload, {
    withCredentials: true,
  });

/** Get profile by link (alternative endpoint) */
export const getProfileBYLink = (link) =>
  userProfilesApi.get(`/user/profile/${link}`, { withCredentials: true });
