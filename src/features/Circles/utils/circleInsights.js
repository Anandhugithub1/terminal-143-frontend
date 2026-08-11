// Computed entirely from a bounded page of already-fetched posts (see
// useCirclePostsForStats) — no additional network calls, no backend
// aggregation. Every function here is a pure reduction over that array, so
// results are only ever as complete as the page fetched; callers should
// label them as "recent activity," not lifetime totals.

const DAY_MS = 24 * 60 * 60 * 1000;

function engagementScore(post) {
  const matches = post?.interactions?.match || 0;
  const passes = post?.interactions?.pass || 0;
  const comments = post?.commentCount || 0;
  return matches + passes + comments;
}

// Ranked by engagementScore, ties broken by newest first. Caps at `limit` —
// this is a leaderboard, not a full sort the UI needs to page through.
export function getTopPosts(posts, { limit = 5 } = {}) {
  return [...(posts || [])]
    .map((post) => ({ post, score: engagementScore(post) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.createdAtEpoch - a.post.createdAtEpoch)
    .slice(0, limit);
}

// Members ranked by how much engagement their posts drew, not by post count
// alone — a partnership program cares who's actually landing content, not
// just who posts most often. Falls back to post count only when nobody in
// the sample has any engagement yet (a fresh circle).
export function getMostActiveMembers(posts, { limit = 5 } = {}) {
  const byAuthor = new Map();

  for (const post of posts || []) {
    const authorId = post.authorId;
    if (!authorId) continue;
    const entry = byAuthor.get(authorId) || {
      authorId,
      displayName: post.authorDisplayName || post.authorName || authorId,
      avatarUrl: post.authorImage || null,
      postCount: 0,
      engagement: 0,
    };
    entry.postCount += 1;
    entry.engagement += engagementScore(post);
    byAuthor.set(authorId, entry);
  }

  return [...byAuthor.values()]
    .sort((a, b) => b.engagement - a.engagement || b.postCount - a.postCount)
    .slice(0, limit);
}

// One bucket per day for the last `days` days (oldest first), counting
// posts created that day within the fetched sample. A day with zero posts
// still gets a bucket — a real gap should read as a real gap, not vanish.
export function getActivityTrend(posts, { days = 7 } = {}) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, i) => {
    const dayStart = startOfToday - (days - 1 - i) * DAY_MS;
    return { dayStart, count: 0 };
  });

  for (const post of posts || []) {
    const epoch = post.createdAtEpoch;
    if (!epoch) continue;
    const dayStart = new Date(epoch).setHours(0, 0, 0, 0);
    const bucket = buckets.find((b) => b.dayStart === dayStart);
    if (bucket) bucket.count += 1;
  }

  return buckets;
}

// Total engagement across the sample divided by member count — a single
// ratio that normalizes for circle size, so a 12-member circle and a
// 400-member circle can be compared meaningfully rather than just by raw
// totals. Returns null (not 0) when there's no member count to divide by,
// so the caller can render "—" instead of a misleading 0.00.
export function getEngagementRate(posts, memberCount) {
  if (!memberCount) return null;
  const total = (posts || []).reduce((sum, post) => sum + engagementScore(post), 0);
  return total / memberCount;
}

export function getTotalEngagement(posts) {
  return (posts || []).reduce((sum, post) => sum + engagementScore(post), 0);
}
