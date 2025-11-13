import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { matchesApi, userProfilesApi } from '../../api/clients';

/* existing hooks (unchanged) */
async function fetchMatches() {
  const res = await matchesApi.get('/match/list', { withCredentials: true });
  return res.data.matches || [];
}

/**
 * Custom hook for fetching matches
 */
export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMatchRequests() {
  return useQuery({
    queryKey: ['matchRequests'],
    queryFn: async () => {
      const res = await matchesApi.get('/match/requests', {
        withCredentials: true,
      });
      return res.data.requests || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMatchRequestResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderUsername, action }) => {
      const res = await matchesApi.post(
        '/match/request/respond',
        { senderUsername, action },
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['matchRequests'], (old = []) =>
        old.filter((r) => r.request.senderUsername !== variables.senderUsername)
      );
    },
    onError: (error) => {
      console.error('Action failed', error);
      alert(`Could not perform action. Please try again.`);
    },
  });
}



/**
 * Fetch a user profile by PK & SK using the userProfilesApi base URL.
 *

/**
 * Fetch a user profile by PK & SK using query params (GET).
 *
 * Expects backend route: GET /user/getUserProfileByPkSk?PK=...&SK=...
 */
async function fetchUserProfileById({ queryKey }) {
  // queryKey: ['userProfile', { PK, SK }]
  const [_key, { PK, SK }] = queryKey;

  const res = await userProfilesApi.get('/user/getUserProfileByPkSk', {
    params: { PK, SK },
    withCredentials: true,
  });

  return res.data;
}

export function useUserProfileById(PK, SK, enabled = true) {
  return useQuery({
    queryKey: ['userProfile', { PK, SK }],
    queryFn: fetchUserProfileById,
    enabled: !!PK && !!SK && enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}