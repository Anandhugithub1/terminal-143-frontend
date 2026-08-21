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

// Another user's circle memberships, for viewing their profile — distinct
// from listUserCircles() above (which is always "my own"). Returns an empty
// list (not an error) when the target has circle activity hidden, has
// blocked/been blocked by the viewer, or has no circles — the backend
// deliberately never reveals which, so the frontend can't either.
//
// Unlike posts pagination (a plain numeric offset string), lastKey here is a
// raw DynamoDB ExclusiveStartKey object ({PK, SK}) — circlesHandler.js reads
// it with JSON.parse(decodeURIComponent(qs.lastKey)), i.e. it expects a single
// JSON-string query param. Axios's default params serializer would otherwise
// explode an object value into bracket-notation keys (lastKey[PK]=...&
// lastKey[SK]=...), which the backend never sees as `qs.lastKey` at all —
// every "next page" request would silently fall back to lastKey=null and
// re-fetch page one forever. Stringify only — axios URL-encodes string
// params itself, so encoding it again here would double-encode and break
// the backend's single decodeURIComponent().
export const listUserCirclesByAuthor =
(authorId, { limit = 20, lastKey = null } = {}) =>
  api.get(
    `${BASE}users/${authorId}/circles`,
    { params: { limit, lastKey: lastKey ? JSON.stringify(lastKey) : null } }
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