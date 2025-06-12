/* ========== features/UserProfile/api.js ========== */
import axios from 'axios';

const PROFILE_BASE = 'https://userapi.terminal143.com';

/** Fetch the current user's profile */
export const fetchMyProfile = () =>
  axios.get(`${PROFILE_BASE}/user/profile`, { withCredentials: true });

/** Patch any profile fields */
export const updateProfileData = (payload) => {


  return axios.post(
    'https://userapi.terminal143.com/user/update',
    payload,
    { withCredentials: true }


  );
};



export const getProfileByLink = async (link) => {
  const fullUrl = `https://terminal143.com/profile/${link}`;

  const res = await axios.get(`${PROFILE_BASE}/user/by-link`, {
    params: { url: fullUrl },
  });

  return res.data.profile;
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

export const getProfileBYLink= (link) => {
  return axios.get(
    `${PROFILE_BASE}/user/profile/${link}`,
  );
}
