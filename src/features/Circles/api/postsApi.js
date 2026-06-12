import api from './axios'

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
  createdAtEpoch,
  postId,
  projection = null
) => {
  if (!circleId) {
    throw new Error('circleId required');
  }

  if (!createdAtEpoch) {
    throw new Error('createdAtEpoch required');
  }

  if (!postId) {
    throw new Error('postId required');
  }

  const params = { postedAt: createdAtEpoch };

  if (projection) {
    params.projection = projection;
  }

  return api.get(
    `${BASE}/${circleId}/posts/${postId}`,
    { params }
  );
};

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