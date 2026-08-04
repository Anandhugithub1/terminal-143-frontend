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

// Both `.items` and `.comments` show up across the codebase's defensive
// reads of this payload — normalize once here so optimistic updates hit
// whichever key the cached data actually has.
function commentsListKey(data) {
  return data?.items ? 'items' : 'comments';
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

    // Optimistically insert the comment as its own card immediately on
    // submit — like Instagram/Facebook — instead of waiting for the
    // create + refetch round-trip before anything appears. Tagged
    // isPending so the card can show a "Posting..." state; reconciled
    // with the real comment (or rolled back) once the request settles.
    onMutate:
      async (payload) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) });
        const previous = queryClient.getQueryData(queryKeys.comments(postId));

        const optimisticComment = {
          commentId: payload.clientCommentId,
          content: payload.content,
          authorImage: payload.authorImage,
          authorName: payload.authorName,
          authorId: payload.authorId,
          createdAtEpoch: Date.now(),
          replies: [],
          isPending: true,
        };

        queryClient.setQueryData(queryKeys.comments(postId), (old) => {
          const key = commentsListKey(old);
          const list = old?.[key] || [];
          return { ...old, [key]: [optimisticComment, ...list] };
        });

        return { previous, clientCommentId: payload.clientCommentId };
      },

    onError:
      (err, payload, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKeys.comments(postId), context.previous);
        }
      },

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

    // Same optimistic-insert idea as useCreateComment, but the reply has
    // to be spliced into its parent's `replies` array rather than
    // prepended to the top-level list.
    onMutate:
      async (payload) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) });
        const previous = queryClient.getQueryData(queryKeys.comments(postId));

        const optimisticReply = {
          commentId: payload.clientCommentId,
          content: payload.content,
          authorImage: payload.authorImage,
          authorName: payload.authorName,
          authorId: payload.authorId,
          createdAtEpoch: Date.now(),
          isPending: true,
        };

        queryClient.setQueryData(queryKeys.comments(postId), (old) => {
          const key = commentsListKey(old);
          const list = old?.[key] || [];
          const updated = list.map((c) => {
            const id = c.commentId || c.id;
            if (id !== payload.parentCommentId) return c;
            return { ...c, replies: [...(c.replies || []), optimisticReply] };
          });
          return { ...old, [key]: updated };
        });

        return { previous };
      },

    onError:
      (err, payload, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKeys.comments(postId), context.previous);
        }
      },

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

    // Remove the comment (or reply) from the cache immediately rather than
    // waiting for the delete + refetch round-trip, so it disappears the
    // moment the user confirms instead of lingering on screen.
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) });
      const previous = queryClient.getQueryData(queryKeys.comments(postId));

      queryClient.setQueryData(queryKeys.comments(postId), (old) => {
        const key = commentsListKey(old);
        const list = old?.[key] || [];
        const updated = list
          .filter((c) => (c.commentId || c.id) !== commentId)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => (r.commentId || r.id) !== commentId),
          }));
        return { ...old, [key]: updated };
      });

      return { previous };
    },

    onError: (err, commentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.comments(postId), context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
    },
  });
}
