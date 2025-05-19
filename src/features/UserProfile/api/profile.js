/* ========== features/UserProfile/api.js ========== */
import axios from 'axios';

const PROFILE_BASE = 'http://localhost:4000/api/users';

/** Fetch the current user's profile */
export const fetchMyProfile = () =>
  axios.get(`${PROFILE_BASE}/profile`, { withCredentials: true });

/** Patch any profile fields */
export const updateProfileData = (payload) => {
  const accessToken = localStorage.getItem('accessToken');
  const userType    = localStorage.getItem('userType');
  const idToken     = localStorage.getItem('idToken');

  return axios.patch(
    `${PROFILE_BASE}/update`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-user-type': userType,
        'x-id-token': idToken,
      },
    }
  );
};

/** Get presigned URL for image upload */
export const getPresignedUrl = ({ fileType, photoIndex }) => {
  const accessToken = localStorage.getItem('accessToken');
  const userType    = localStorage.getItem('userType');
  const idToken     = localStorage.getItem('idToken');

  return axios.post(
    `${PROFILE_BASE}/presigned-url`,
    { fileType, photoIndex },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-user-type': userType,
        'x-id-token': idToken,
      },
    }
  );
};



/** Complete profile setup (finalize user profile) */
export const completeProfileApi = (payload) => {
  const userType    = localStorage.getItem('userType');
  const username    = localStorage.getItem('username');
  const idToken     = localStorage.getItem('idToken');

  return axios.post(
    `${PROFILE_BASE}/complete-profile`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-user-type': userType,
        'x-user-name': username,
        'x-id-token': idToken,
      },
    }
  );
};
