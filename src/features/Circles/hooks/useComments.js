import {
  useQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import {
  listComments,
  createComment,
  replytoComment,
  deleteComment
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
      !!postId,

    staleTime:
      1000 * 15
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

export function
useReplyToComment(
  postId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      payload =>
        replytoComment(
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
export function useDeleteComment(postId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
    },
  });
}
