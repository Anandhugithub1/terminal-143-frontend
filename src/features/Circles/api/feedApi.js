import api from './axios'
const BASE =
'https://api.passormatch.com/circles';

export const getFeed =
() =>
  api.get(
    `${BASE}/feed`
  );

export const updateSeenFeed =
postIds =>
  api.post(
    `${BASE}/feed/seen`,
    {
      postIds
    }
  );