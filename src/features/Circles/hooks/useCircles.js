import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  listUserCircles,
  createCircle
} from '../api/circlesApi';

import {
  queryKeys
} from '../queries/queryKeys';

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