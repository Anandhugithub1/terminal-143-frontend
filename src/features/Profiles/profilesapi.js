/* ================= features/profiles/api.js ================= */
import { matchesApi,suggestionApi } from '../../api/clients';

/**
 * Fetches the next batch of suggested profiles.
 * Now only takes a `limit` — the handler uses Redis to page under the hood.
 */
export const getSuggestions = async ({ limit = 10 }) => {
  const response = await suggestionApi.get('/user/recommend', {
    params: { limit },
    withCredentials: true, 
  });
  // handler now returns { profiles: [ { …, suggestionIndex }, … ] }
  return response.data.profiles || [];
};

/**
 * Sends a swipe (seen) action for a profile.
 */
export async function postSeen({ suggestionIndex, direction }) {
  const response = await matchesApi.post(
    '/user/swipe',
    { suggestionIndex, direction },
    { withCredentials: true } 
  );
  return response.data;
}
