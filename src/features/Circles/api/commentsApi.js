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

export const listComments =
postId =>
  api.get(
    `${BASE}/posts/${postId}/comments`
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
