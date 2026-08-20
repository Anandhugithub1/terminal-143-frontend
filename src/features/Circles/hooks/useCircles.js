import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import {
  listUserCircles,
  listUserCirclesByAuthor,
  createCircle,
  getCircle,
  getCircleStats,
  updateCircle,
  searchCircles,
  searchCirclesByTag,
  searchPostsByTag
} from '../api/circlesApi';

import {
  queryKeys
} from '../queries/queryKeys';

// Server-side prefix search over ALL circles (Redis-backed), as opposed to
// filtering a hardcoded local list. Debounced so typing doesn't fire a request
// per keystroke; the backend requires a non-empty q, so short input is skipped.
const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// One shared timer so the circle and post searches fire off the same keystroke
// rather than each running its own debounce and landing at different times.
export function useDebouncedSearchTerm(query, delay = SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const trimmed = (query || '').trim();
    const timer = setTimeout(() => setDebounced(trimmed), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  return debounced;
}

export function useCircleSearch(query, { limit = 20 } = {}) {
  const debounced = useDebouncedSearchTerm(query);
  const enabled = debounced.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: queryKeys.circleSearch(debounced),
    // Forward React Query's AbortSignal so a superseded search (user kept
    // typing) is cancelled in-flight instead of racing to land out of order.
    queryFn: async ({ signal }) => {
      const res = await searchCircles(debounced, { limit, signal });
      return res.data;
    },
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev, // keep last results visible while typing
  });

  return {
    ...result,
    // True only while a search is actually in flight for a usable query —
    // lets the UI distinguish "searching" from "nothing typed yet".
    isSearching: enabled && result.isFetching,
    isActive: enabled,
    circles: result.data?.circles || [],
  };
}

// Circles carrying the typed tag. NOTE this is an EXACT match, unlike
// useCircleSearch's prefix: "hik" finds nothing, "hiking" finds #hiking.
export function useCircleTagSearch(query, { limit = 20 } = {}) {
  const debounced = useDebouncedSearchTerm(query);
  const tag = debounced.toLowerCase();
  const enabled = tag.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: queryKeys.circleTagSearch(tag),
    queryFn: async ({ signal }) => {
      const res = await searchCirclesByTag(tag, { limit, signal });
      return res.data;
    },
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });

  return {
    ...result,
    isSearching: enabled && result.isFetching,
    isActive: enabled,
    circles: result.data?.circles || [],
  };
}

// Posts carrying the typed tag. NOTE this is an EXACT match, unlike circle
// search's prefix: "hik" finds nothing, "hiking" finds #hiking. The UI says so
// in its empty state rather than leaving the user to guess.
export function usePostTagSearch(query, { limit = 20 } = {}) {
  const debounced = useDebouncedSearchTerm(query);
  const tag = debounced.toLowerCase();
  const enabled = tag.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: queryKeys.postTagSearch(tag),
    // Forward React Query's AbortSignal so a superseded search is cancelled.
    queryFn: async ({ signal }) => {
      const res = await searchPostsByTag(tag, { limit, signal });
      return res.data;
    },
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });

  return {
    ...result,
    isSearching: enabled && result.isFetching,
    isActive: enabled,
    posts: result.data?.posts || [],
  };
}

export function useCircles() {
  return useQuery({
    queryKey:
      queryKeys.circles,

    queryFn:
      async () => {
        const res =
          await listUserCircles();

        return res.data;
      },

    staleTime:
      1000 * 60 * 5,
  });
}

export function useCircle(circleId) {
  return useQuery({
    queryKey:
      queryKeys.circle(
        circleId
      ),

    queryFn:
      async () => {
        const res =
          await getCircle(
            circleId
          );

        return res.data;
      },

    enabled:
      !!circleId,

    staleTime:
      1000 * 60 * 5,
  });
}

// Owner/moderator only — backend 403s anyone else. Short-ish staleTime: a
// moderator opening the dashboard expects the numbers to be close to live,
// but this isn't a chat-style hot path either.
export function useCircleStats(circleId) {
  return useQuery({
    queryKey: queryKeys.circleStats(circleId),
    queryFn: async () => {
      const res = await getCircleStats(circleId);
      return res.data;
    },
    enabled: !!circleId,
    staleTime: 1000 * 30,
  });
}

// Another user's joined circles, for a profile visit — pass null for
// authorId to defer the fetch until the caller actually needs it (same
// lazy-tab pattern as useUserPosts). An empty result here can mean "no
// circles," "activity hidden," or "blocked" — the backend deliberately
// never distinguishes which, so this hook doesn't either.
export function useUserCircles(authorId, { limit = 20 } = {}) {
  return useQuery({
    queryKey: [...queryKeys.userCircles(authorId), limit],
    queryFn: async () => {
      const res = await listUserCirclesByAuthor(authorId, { limit });
      return res.data;
    },
    enabled: !!authorId,
    staleTime: 1000 * 60,
  });
}

// Owner/moderator/admin only — backend 403s anyone else (see the
// updateCircle auth fix in circlesHandler.js). Used for visibility toggling
// from the moderator dashboard as well as any future settings edit.
export function useUpdateCircle(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateCircle(circleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circle(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.circles });
    },
  });
}

export function useCreateCircle() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async payload => {
        const res =
          await createCircle(
            payload
          );

        return res.data;
      },

    onMutate:
      async newCircle => {
        await queryClient.cancelQueries(
          {
            queryKey:
              queryKeys.circles,
          }
        );

        const previousCircles =
          queryClient.getQueryData(
            queryKeys.circles
          );

        queryClient.setQueryData(
          queryKeys.circles,
          old => {
            if (!old) {
              return old;
            }

            return {
              ...old,

              circles: [
                {
                  ...newCircle,
                  circleId:
                    `temp-${Date.now()}`,
                  isPending:
                    true,
                },

                ...(old
                  ?.circles ||
                  []),
              ],
            };
          }
        );

        return {
          previousCircles,
        };
      },

    onError:
      (
        err,
        variables,
        context
      ) => {
        if (
          context
            ?.previousCircles
        ) {
          queryClient.setQueryData(
            queryKeys.circles,
            context.previousCircles
          );
        }

        console.error(
          'Create circle failed',
          err
        );
      },

    onSuccess:
      () => {
        queryClient.invalidateQueries(
          {
            queryKey:
              queryKeys.circles,
          }
        );
      },
  });
}