import {
  useQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import {
  listUserCircles,
  createCircle
}
from
'../api/circlesApi';

import {
  queryKeys
}
from
'../queries/queryKeys';

export function
useCircles() {
  return useQuery({
    queryKey:
      queryKeys.circles,

    queryFn:
      async () => {
        const res =
          await listUserCircles();

        return res.data;
      }
  });
}

export function
useCreateCircle() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createCircle,

    onSuccess:
      () => {
        queryClient.invalidateQueries(
          {
            queryKey:
              queryKeys.circles
          }
        );
      }
  });
}