/* ================= features/profiles/api.js ================= */
import axios from 'axios';

const BASE_URL = 'https://userapi.terminal143.com';


export const getMatchProviders = async ({ preferences, limit = 10, }) => {
  const response = await axios.get(
    `${BASE_URL}/match-providers/all`,
    
    {
      params: { limit, preferences: JSON.stringify(preferences) },
      withCredentials: true,
    }
  );
  return response.data.items || [];
};