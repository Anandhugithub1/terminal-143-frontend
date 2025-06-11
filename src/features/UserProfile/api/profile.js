/* ========== features/UserProfile/api.js ========== */
import axios from 'axios';

const PROFILE_BASE = 'https://userapi.terminal143.com';

/** Fetch the current user's profile */
export const fetchMyProfile = () => 
  axios.get(`${PROFILE_BASE}/user/profile`, { withCredentials: true });

/** Post any profile fields */
/** Post any profile fields */
export const updateProfileData = async (payload) => {
  try {
    const response = await fetch('https://userapi.terminal143.com/user/update', {
      method: 'POST',
      credentials: 'include', // same as axios's withCredentials: true
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
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
