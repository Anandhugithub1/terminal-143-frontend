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

  return {
    profiles: response.data?.profiles || [],
    source: response.data?.source || null,
    computing: response.data?.computing ?? false,
    hadPool: response.data?.hadPool ?? true,
  };
};



/**
 * Sends a swipe (seen) action for a profile.
 */
export async function postSeen({
  username,   // seen username
  source,
}) {
  const response = await suggestionApi.post(
    '/user/swipe',
    {
      username,
      source,
    },
    { withCredentials: true }
  )

  return response.data
}


