import api from './axios'

const BASE =
'https://api.passormatch.com/circles';

export const createComment =
(
  postId,
  payload
) =>
  api.post(
    `${BASE}/posts/${postId}/comments`,
    payload
  );

// lastKey is the backend's opaque, pre-encoded cursor string (see
// commentsHandler.js's _list — it does encodeURIComponent(JSON.stringify(...))
// itself before returning it), so it's passed straight through unchanged,
// same as chat/matches/notifications pagination.
export const listComments =
(postId, { limit, lastKey } = {}) =>
  api.get(
    `${BASE}/posts/${postId}/comments`,
    { params: { limit, lastKey } }
  );

export const replytoComment =
(
  postId,
  payload
) =>
  api.post(
    `${BASE}/posts/${postId}/comments/reply`,
    payload
  );

export const deleteComment = (postId, commentId) =>
  api.delete(`${BASE}/posts/${postId}/comments/${commentId}`);
