import api from './axios'
const BASE =
'https://api.passormatch.com/circles/';

export const createCircle =
payload =>
  api.post(
    BASE,
    payload
  );

export const listUserCircles =
() =>
  api.get(
    BASE
  );

export const getCircle =
circleId =>
  api.get(
    `${BASE}${circleId}`
  );

export const updateCircle =
(
  circleId,
  payload
) =>
  api.patch(
    `${BASE}${circleId}`,
    payload
  );

// Prefix search over circle names, served from the Redis index (never scans
// DynamoDB). Returns { query, count, circles, nextOffset } — page by echoing
// nextOffset back as `offset`.
export const searchCircles =
(
  q,
  { limit = 20, offset = 0 } = {}
) =>
  api.get(
    `${BASE}search`,
    { params: { q, limit, offset } }
  );