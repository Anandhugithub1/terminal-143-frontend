/* ========== features/UserProfile/api.js ========== */
import axios from 'axios';

const PROFILE_BASE = 'https://userapi.terminal143.com';

/** Fetch the current user's profile */
export const fetchMyProfile = () =>
  axios.get(`${PROFILE_BASE}/user/profile`, { withCredentials: true });

/** Patch any profile fields */
export const updateProfileData = (payload) => {


  return axios.patch(
    `${PROFILE_BASE}/user/update`,
    payload,
    { withCredentials: true }


  );
};

/** Get presigned URL for image upload */
export const getPresignedUrl = ({ fileType, photoIndex }) => {
  

  return axios.post(
    `${PROFILE_BASE}/user/presigned-url`,
    { fileType, photoIndex },
    { withCredentials: true }
  );
};



/** Complete profile setup (finalize user profile) */
export const completeProfileApi = (payload) => {
  

  return axios.post(
    `${PROFILE_BASE}/user/complete-profile`,
    payload,
    {
   withCredentials: true
    }
  );
};
