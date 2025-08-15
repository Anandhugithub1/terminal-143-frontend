/* ================= features/profiles/api.js ================= */
import axios from 'axios';
const BASE_URL = 'https://userapi.terminal143.com/match';
const Test_URL ='https://userapi.terminal143.com';

/**
 * Fetches the next batch of suggested profiles.
 * Now only takes a `limit` — the handler uses Redis to page under the hood.
 */
export const getMatchProviders = async ({ limit = 10 }) => {
  const response = await axios.get(
    `${Test_URL}/user/recommendations`,
    {
      params: { limit },
      withCredentials: true,
    }
  );
  // handler now returns { profiles: [ { …, suggestionIndex }, … ] }
  return response.data.profiles || [];
};





export async function postSeen({ suggestionIndex, direction }) {
  const response = await axios.post(
    `${BASE_URL}/user/swipe`,
    {
      suggestionIndex,
      
      direction,
    },
    {
      withCredentials: true, 
    }
  );
  return response.data;
}
