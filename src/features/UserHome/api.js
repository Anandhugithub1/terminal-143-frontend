import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { matchesApi, userProfilesApi,reportApi } from '../../api/clients';
import { toast } from 'sonner';
/* existing hooks (unchanged) */
async function fetchMatches() {
  const res = await matchesApi.get('/list', { withCredentials: true });
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

// Paginated matches (10 per page, matching match-service's default) for
// infinite-scroll UIs like the chat list. Prefer this over useMatches()
// wherever the full list would otherwise be fetched at once.
async function fetchMatchesPage({ pageParam }) {
  const res = await matchesApi.get('/list', {
    params: pageParam ? { lastKey: pageParam } : undefined,
    withCredentials: true,
  });
  return { matches: res.data.matches || [], lastKey: res.data.lastKey || null };
}

export function useInfiniteMatches() {
  const query = useInfiniteQuery({
    queryKey: ['matches', 'infinite'],
    queryFn: fetchMatchesPage,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const matches = useMemo(
    () => query.data?.pages.flatMap((page) => page.matches) ?? [],
    [query.data]
  );

  return { ...query, matches };
}

export function useMatchRequests() {
  return useQuery({
    queryKey: ['matchRequests'],
    queryFn: async () => {
      const res = await matchesApi.get('/requests', {
        withCredentials: true,
      });
      return res.data.requests || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


export function SendProfileFeeback() {
  return useMutation({
    mutationFn: async ({ targetUsername, liked }) => {
      const res = await matchesApi.post(
        '/feedback',
        { targetUsername, liked },
        { withCredentials: true }
      )
      return res.data
    }
  })
}

export function useMatchRequestResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderUsername, action }) => {
      const res = await matchesApi.post(
        '/request/respond',
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

export function useReportUser() {
  return useMutation({
    mutationFn: async ({ reportedUsername, reason }) => {
      const res = await reportApi.post(
        "/reportUser",
        { reportedUsername, reason },
        { withCredentials: true }
      )
      return res.data
    },

    onSuccess: () => {
      toast.success("Report submitted successfully")
    },

    onError: () => {
      toast.error("Failed to submit report")
    }
  })
}
