import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import {
  listUserCircles,
  createCircle,
  getCircle,
  searchCircles
} from '../api/circlesApi';

import {
  queryKeys
} from '../queries/queryKeys';

// Server-side prefix search over ALL circles (Redis-backed), as opposed to
// filtering a hardcoded local list. Debounced so typing doesn't fire a request
// per keystroke; the backend requires a non-empty q, so short input is skipped.
const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useCircleSearch(query, { limit = 20 } = {}) {
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const trimmed = (query || '').trim();
    const timer = setTimeout(() => setDebounced(trimmed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const enabled = debounced.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: queryKeys.circleSearch(debounced),
    queryFn: async () => {
      const res = await searchCircles(debounced, { limit });
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