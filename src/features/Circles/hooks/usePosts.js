import {
  useQuery,
  useMutation,
  useQueryClient
}
from
'@tanstack/react-query';

import {
  listPosts,
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