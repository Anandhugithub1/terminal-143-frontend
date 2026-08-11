import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import { useMemo } from 'react';

import {
  listPosts,
  listMyPosts,
  listUserPosts,
  createPost,
  getPost,
  updatePost,
  deletePost
}
from
'../api/postsApi';

import {
  getFeed,
  updateSeenFeed
}
from
'../api/feedApi';

import {
  queryKeys
}
from
'../queries/queryKeys';

export function
useFeed() {
  return useQuery({
    queryKey:
      queryKeys.feed,

    queryFn:
      async () => {
        const res =
          await getFeed();

        return res.data;
      },

    staleTime:
      1000 * 30
  });
}

export function
useMarkFeedSeen() {
  return useMutation({
    mutationFn:
      postIds =>
        updateSeenFeed(
          postIds
        )
  });
}

export function
usePosts(
  circleId
) {
  return useQuery({
    queryKey:
      queryKeys.posts(
        circleId
      ),

    queryFn:
      async () => {
        const res =
          await listPosts(
            circleId
          );

        return res.data;
      },

    enabled:
      !!circleId,

    staleTime:
      1000 * 30
  });
}

// A single bounded page (default 50, never paginated further) of a circle's
// most recent posts — purpose-built for the moderator dashboard's
// client-computed metrics (top posts, most active members, activity trend).
// Deliberately its own query key/hook rather than reusing usePosts(circleId):
// that hook's cache entry backs the live feed and gets invalidated on every
// create/edit/delete, and mixing a capped dashboard fetch into the same slot
// would either truncate the feed or refetch a full page every post action.
// The DynamoDB read underneath is a Query on the circle's own partition key
// (see listPosts.js) — not a Scan — so this is one bounded, indexed read,
// not a table-wide cost regardless of circle size.
export function
useCirclePostsForStats(
  circleId,
  { limit = 50 } = {}
) {
  return useQuery({
    queryKey:
      [...queryKeys.posts(circleId), 'stats', limit],

    queryFn:
      async () => {
        const res =
          await listPosts(
            circleId,
            { limit }
          );

        return res.data;
      },

    enabled:
      !!circleId,

    staleTime:
      1000 * 60
  });
}

export function
usePost(
  circleId,
  postId,
  createdAtEpoch
) {
  return useQuery({
    queryKey:
      queryKeys.post(
        circleId,
        postId,
        createdAtEpoch
      ),

    queryFn:
      async () => {
        const res =
          await getPost(
            circleId,
            createdAtEpoch,
            postId
          );

        return res.data;
      },

    enabled:
      !!circleId && !!postId && !!createdAtEpoch,

    staleTime:
      1000 * 30
  });
}

export function
useMyPosts() {
  return useQuery({
    queryKey:
      queryKeys.myPosts,

    queryFn:
      async () => {
        const res =
          await listMyPosts();

        return res.data;
      },

    staleTime:
      1000 * 30
  });
}

// Posts by ANOTHER user across every circle they belong to (profile view).
// Paginated, `limit` per page (5 for the profile-tab preview, more on the
// dedicated "see all posts" page) — fetchNextPage() loads the next older
// page via the backend's lastKey cursor, same shape as chat's message
// history pagination.
export function
useUserPosts(authorId, { limit = 5 } = {}) {
  const query = useInfiniteQuery({
    queryKey: [...queryKeys.userPosts(authorId), limit],

    queryFn:
      async ({ pageParam }) => {
        const res = await listUserPosts(authorId, { limit, lastKey: pageParam });
        return res.data;
      },

    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.lastKey,
    enabled: !!authorId,
    staleTime: 1000 * 30,
  });

  const posts = useMemo(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data]
  );

  return { ...query, posts };
}

export function
useUpdateMyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, postId, createdAtEpoch, payload }) =>
      updatePost(circleId, postId, createdAtEpoch, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
    },
  });
}

export function
useDeleteMyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, postId, createdAtEpoch }) =>
      deletePost(circleId, postId, createdAtEpoch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
    },
  });
}

export function
useDeletePost(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, createdAtEpoch }) => deletePost(circleId, postId, createdAtEpoch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts(circleId) });
    },
  });
}

export function
useUpdatePost(circleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, createdAtEpoch, payload }) =>
      updatePost(circleId, postId, createdAtEpoch, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts(circleId) });
    },
  });
}

// Edit/delete from a view that mixes posts across circles (Circles home's
// selected-circle tab, "For You" feed, and cross-circle fallback feed) —
// circleId comes per-call rather than being fixed to one hook instance, and
// success invalidates every place the edited/deleted post could be showing:
// its circle's own post list, the feed, and My Posts.
export function
useUpdateFeedPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, postId, createdAtEpoch, payload }) =>
      updatePost(circleId, postId, createdAtEpoch, payload),
    onSuccess: (_data, { circleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
    },
  });
}

export function
useDeleteFeedPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, postId, createdAtEpoch }) =>
      deletePost(circleId, postId, createdAtEpoch),
    onSuccess: (_data, { circleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts(circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
    },
  });
}

export function
useCreatePost(
  circleId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      payload =>
        createPost(
          circleId,
          payload
        ),

    onSuccess:
      () => {
        queryClient.invalidateQueries(
          {
            queryKey:
              queryKeys.posts(
                circleId
              )
          }
        );
      }
  });
}