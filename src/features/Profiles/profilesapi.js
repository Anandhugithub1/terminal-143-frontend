/* ================= features/profiles/api.js ================= */
import axios from 'axios';
const BASE_URL = 'https://userapi.terminal143.com';

/**
 * Fetches the next batch of suggested profiles.
 * Now only takes a `limit` — the handler uses Redis to page under the hood.
 */
export const getMatchProviders = async ({ limit = 10 }) => {
  const response = await axios.get(
    `${BASE_URL}/user/recommendations`,
    {
      params: { limit },
      withCredentials: true,
    }
  );
  // handler now returns { profiles: [ { …, suggestionIndex }, … ] }
  return response.data.profiles || [];
};





export async function postSeen({ profilePk, profileSk, direction }) {
  const response = await axios.post('/api/record-seen', {
    profilePk,
    profileSk,
    direction,
  });
  return response.data;
}