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
  { limit = 20, offset = 0, signal } = {}
) =>
  api.get(
    `${BASE}search`,
    { params: { q, limit, offset }, signal }
  );

// Posts carrying a tag, ranked by engagement + freshness. Unlike circle
// search this is an EXACT tag match, not a prefix — "hik" will not find
// "hiking". Returns { tag, count, posts, nextOffset }.
export const searchPostsByTag =
(
  tag,
  { limit = 20, offset = 0, signal } = {}
) =>
  api.get(
    `${BASE}search/posts`,
    { params: { tag, limit, offset }, signal }
  );