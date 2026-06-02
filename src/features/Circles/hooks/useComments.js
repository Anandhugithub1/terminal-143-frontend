import {
  useQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import {
  listComments,
  createComment
}
from
'../api/commentsApi';

import {
  queryKeys
}
from
'../queries/queryKeys';

export function
useComments(
  postId
) {
  return useQuery({
    queryKey:
      queryKeys.comments(
        postId
      ),

    queryFn:
      async () => {
        const res =
          await listComments(
            postId
          );

        return res.data;
      },

    enabled:
      !!postId
  });
}

export function
useCreateComment(
  postId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      payload =>
        createComment(
          postId,
          payload
        ),

    onSuccess:
      () => {
        queryClient.invalidateQueries(
          {
            queryKey:
              queryKeys.comments(
                postId
              )
          }
        );
      }
  });
}