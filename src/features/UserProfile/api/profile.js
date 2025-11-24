
  /* ========== features/UserProfile/api.js ========== */
import { userProfilesApi } from "../../../api/clients";
/** Fetch the current user's profile */
export const fetchMyProfile = () =>
  userProfilesApi.get('/user/profile', { withCredentials: true });

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
export const getPresignedUrl = ({ fileType, photoIndex }) =>
  userProfilesApi.post(
    '/user/presigned-url',
    { fileType, photoIndex },
    { withCredentials: true }
  );

/** Complete profile setup (finalize user profile) */
export const completeProfileApi = (payload) =>
  userProfilesApi.post('/user/complete-profile', payload, {
    withCredentials: true,
  });

/** Get profile by link (alternative endpoint) */
export const getProfileBYLink = (link) =>
  userProfilesApi.get(`/user/profile/${link}`, { withCredentials: true });
