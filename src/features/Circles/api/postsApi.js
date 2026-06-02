import api
from '@/api/axios';

const BASE =
'https://api.passormatch.com/circles';

export const createPost =
(
  circleId,
  payload
) =>
  api.post(
    `${BASE}/${circleId}/posts`,
    payload
  );

export const listPosts =
circleId =>
  api.get(
    `${BASE}/${circleId}/posts`
  );

export const getPost =
(
  circleId,
  postId
) =>
  api.get(
    `${BASE}/${circleId}/posts/${postId}`
  );

export const updatePost =
(
  circleId,
  postId,
  payload
) =>
  api.patch(
    `${BASE}/${circleId}/posts/${postId}`,
    payload
  );