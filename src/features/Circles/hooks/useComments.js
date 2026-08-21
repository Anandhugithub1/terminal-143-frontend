import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import { useMemo } from 'react';

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

// Paginated, 20 per page (matches the backend's default DynamoDB query
// limit) — fetchNextPage() loads the next page via the backend's opaque
// lastKey cursor, same encode-on-the-way-out shape as chat/matches/
// notifications (see commentsHandler.js's _list). Comments carry replies
// nested inside their parent (see listComments.js), so a page's `items`
// count can legitimately be less than the page size even when more exist —
// pagination is driven by whether the backend returned a lastKey, not by
// how many top-level comments survived the deleted/hidden filter.
export function
useComments(
  postId
) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.comments(postId),

    queryFn: async ({ pageParam }) => {
      const res = await listComments(postId, { lastKey: pageParam });
      return res.data;
    },

    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastKey,
    enabled: !!postId,
    staleTime: 1000 * 15,
  });

  const comments = useMemo(
    () => query.data?.pages?.flatMap((page) => commentsListOf(page)) ?? [],
    [query.data]
  );

  return { ...query, comments };
}

// Both `.items` and `.comments` show up across the codebase's defensive
// reads of this payload — normalize once here so optimistic updates hit
// whichever key the cached data actually has.
function commentsListKey(data) {
  return data?.items ? 'items' : 'comments';
}

function commentsListOf(page) {
  return page?.[commentsListKey(page)] || [];
}

// Applies `updater` to every page's comment list, stopping at the first
// page updater returns a *different array reference* for (identity check,
// not deep-equal — updater is expected to return the same array unchanged
// when nothing on that page matched). Used so a reply/delete only touches
// the one page actually containing the target comment, without needing the
// caller to know which page that is ahead of time.
function updateFirstMatchingPage(oldData, updater) {
  if (!oldData?.pages) return oldData;

  let matched = false;
  const pages = oldData.pages.map((page) => {
    if (matched) return page;

    const key = commentsListKey(page);
    const list = page[key] || [];
    const updatedList = updater(list);

    if (updatedList !== list) {
      matched = true;
      return { ...page, [key]: updatedList };
    }
    return page;
  });

  return matched ? { ...oldData, pages } : oldData;
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

        // Always prepend to the first page — a freshly created comment is
        // the newest, so it belongs at the very top of the list regardless
        // of how many older pages have been loaded.
        queryClient.setQueryData(queryKeys.comments(postId), (old) => {
          if (!old?.pages?.length) return old;
          const [firstPage, ...restPages] = old.pages;
          const key = commentsListKey(firstPage);
          const list = firstPage[key] || [];
          return {
            ...old,
            pages: [{ ...firstPage, [key]: [optimisticComment, ...list] }, ...restPages],
          };
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

        // The parent comment can be on any already-loaded page — walk pages
        // until we find the one containing it, and patch only that page.
        queryClient.setQueryData(queryKeys.comments(postId), (old) =>
          updateFirstMatchingPage(old, (list) => {
            let found = false;
            const updated = list.map((c) => {
              const id = c.commentId || c.id;
              if (id !== payload.parentCommentId) return c;
              found = true;
              return { ...c, replies: [...(c.replies || []), optimisticReply] };
            });
            return found ? updated : list;
          })
        );

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

      // The deleted comment (or its parent, for a reply) can be on any
      // page — filter every page independently rather than stopping at
      // the first match, since a top-level delete only removes from one
      // page but a reply's parent could differ from where the reply itself
      // renders if pages were ever split mid-thread.
      queryClient.setQueryData(queryKeys.comments(postId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((page) => {
          const key = commentsListKey(page);
          const list = page[key] || [];
          const updated = list
            .filter((c) => (c.commentId || c.id) !== commentId)
            .map((c) => ({
              ...c,
              replies: (c.replies || []).filter((r) => (r.commentId || r.id) !== commentId),
            }));
          return { ...page, [key]: updated };
        });
        return { ...old, pages };
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
