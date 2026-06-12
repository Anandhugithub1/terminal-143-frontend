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
  getPost
}
from
'../api/postsApi';

import {
  queryKeys
}
from
'../queries/queryKeys';

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
      !!circleId
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
      !!circleId && !!postId && !!createdAtEpoch
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