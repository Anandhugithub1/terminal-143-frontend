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

export const listMyPosts =
({ limit, lastKey } = {}) =>
  api.get(
    `${BASE}/me/posts`,
    { params: { limit, lastKey } }
  );

// Posts by ANOTHER user, across every circle they belong to — for viewing
// their profile. authorId is their username (matches the rest of the app's
// convention — see UserProfileById's profile.username).
export const listUserPosts =
(authorId, { limit, lastKey } = {}) =>
  api.get(
    `${BASE}/users/${authorId}/posts`,
    { params: { limit, lastKey } }
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

export const updatePost = (circleId, postId, createdAtEpoch, payload) =>
  api.patch(`${BASE}/${circleId}/posts/${postId}`, payload, {
    params: { postedAt: createdAtEpoch },
  });

export const deletePost = (circleId, postId, createdAtEpoch) =>
  api.delete(`${BASE}/${circleId}/posts/${postId}`, {
    params: { postedAt: createdAtEpoch },
  });