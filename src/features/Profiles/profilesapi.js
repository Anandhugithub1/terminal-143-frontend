/* ================= features/profiles/api.js ================= */
import { matchesApi,suggestionApi } from '../../api/clients';

/**
 * Fetches the next batch of suggested profiles.
 * Now only takes a `limit` — the handler uses Redis to page under the hood.
 */
export const getSuggestions = async ({
  limit = 10,
  refreshRequested = false
}) => {
  const response = await suggestionApi.get('/user/recommend', {
    params: {
      limit,
      refreshRequested
    },
    withCredentials: true
  })

  const data = response.data || {}

  return {
    profiles: data.profiles || [],
    source: data.source || null,
    computing: data.computing ?? false,
    hadPool: data.hadPool ?? true,
    exhausted: data.exhausted ?? false,
    canRefresh: data.canRefresh ?? false,
    nextRefreshInSeconds: data.nextRefreshInSeconds ?? 0
  }
}



/**
 * Sends a swipe (seen) action for a profile.
 */
export async function postSeen({
  username,
  source,
  direction
}) {
  const response = await suggestionApi.post(
    "/user/swipe",
    {
      username,
      source,
      direction
    },
    { withCredentials: true }
  )

  return response.data
}

