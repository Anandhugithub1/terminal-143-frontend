import api from './axios'

const BASE =
'https://api.passormatch.com/circles';

export const joinCircle =
circleId =>
  api.post(
    `${BASE}/${circleId}/join`
  );

export const leaveCircle =
circleId =>
  api.post(
    `${BASE}/${circleId}/leave`
  );

// Private circles only — joinCircle 403s on these; the caller lands in a
// pending state instead, resolved by a moderator via acceptRequest/rejectRequest.
export const requestJoinCircle =
(circleId, message = '') =>
  api.post(
    `${BASE}/${circleId}/requests`,
    { message }
  );

// Owner/moderator only — backend 403s anyone else.
export const listCircleRequests =
circleId =>
  api.get(
    `${BASE}/${circleId}/requests`
  );

// Any authenticated caller may check their OWN request status (no
// moderator role needed) — returns { status: 'none' | 'pending' |
// 'accepted' | 'rejected', message?, createdAt? }. Lets the UI persist a
// pending indicator across a refresh/navigation instead of only tracking
// it in local React state.
export const getMyCircleRequestStatus =
circleId =>
  api.get(
    `${BASE}/${circleId}/requests/me`
  );

export const acceptCircleRequest =
(circleId, userId) =>
  api.post(
    `${BASE}/${circleId}/requests/${userId}/accept`
  );

export const rejectCircleRequest =
(circleId, userId) =>
  api.post(
    `${BASE}/${circleId}/requests/${userId}/reject`
  );

export const removeCircleMember =
(circleId, userId) =>
  api.delete(
    `${BASE}/${circleId}/members/${userId}`
  );

// role must be 'moderator' or 'member' — owner-only server-side.
export const setCircleMemberRole =
(circleId, userId, role) =>
  api.patch(
    `${BASE}/${circleId}/members/${userId}/role`,
    { role }
  );