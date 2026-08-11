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

// Owner/moderator only — backend 403s anyone else, not just a hidden UI.
export const getCircleStats =
circleId =>
  api.get(
    `${BASE}${circleId}/stats`
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

// Circles carrying a tag — same /search endpoint as name search, but keyed
// by `tag` instead of `q`. Like post tag search, this is an EXACT match, not
// a prefix. Returns { tag, count, circles, nextOffset }.
export const searchCirclesByTag =
(
  tag,
  { limit = 20, offset = 0, signal } = {}
) =>
  api.get(
    `${BASE}search`,
    { params: { tag, limit, offset }, signal }
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