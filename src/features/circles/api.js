import { userProfilesApi } from "../../api/clients";

function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getPresignedUrl(payload) {
  const res = await userProfilesApi.post("/circles/predesignedurl", payload, {
    withCredentials: true,
  });
  return res?.data ?? res;
}

export async function getCirclesByUser(params = {}) {
  const res = await userProfilesApi.get("/circles/user/circles", {
    params,
    withCredentials: true,
  });
  return res?.data ?? res;
}

/**
 * Create a post in a specific circle (circleName is the normalized name, e.g. "book-club")
 * payload = { authorId, authorImage?, body?, media?, visibility? }
 * options = { token?: string }
 */
export async function createPost(circleName, payload, { token } = {}) {
  if (!circleName) throw new Error("circleName is required");
  const url = `/circles/${encodeURIComponent(circleName)}/posts`;
  const res = await userProfilesApi.post(url, payload, {
    withCredentials: true
  });
  return res?.data ?? res;
}



/**
 * Get a single post
 * postedAt should be the epoch ms (query param required by your handler)
 * options = { token?: string }
 */
export async function getPost(circleName, postId, postedAt, { token } = {}) {
  if (!circleName) throw new Error("circleName is required");
  if (!postId) throw new Error("postId is required");
  if (!postedAt) throw new Error("postedAt (epoch ms) is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts/${encodeURIComponent(postId)}`;
  const res = await userProfilesApi.get(url, {
    params: { postedAt },
    withCredentials: true,
  });
  return res?.data ?? res;
}

/**
 * List posts for a circle
 * params can include pagination, limit, lastKey, etc.
 * options = { token?: string }
 */
export async function listPosts(circleName, params = {}) {
  if (!circleName) throw new Error("circleName is required");
  const url = `/circles/${encodeURIComponent(circleName)}/posts`;
  const res = await userProfilesApi.get(url, {
    params,
    withCredentials: true,
  });
  return res?.data ?? res;
}

export async function updatePost(circleName, postId, postedAtEpoch, payload = {}) {
  if (!circleName) throw new Error("circleName is required");
  if (!postId) throw new Error("postId is required");
  if (!postedAtEpoch) throw new Error("postedAtEpoch is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts/${encodeURIComponent(postId)}?postedAt=${postedAtEpoch}`;

  const res = await userProfilesApi.patch(
    url,
    payload,
    { withCredentials: true }
  );

  return res?.data ?? res;
}



export async function createCircle(payload, { } = {}) {
  const res = await userProfilesApi.post("/circles/create", payload, {
    headers: buildHeaders(),
    withCredentials: true,
  });

  // backend returns: { circleId, message, circle }
  return res?.data?.circle ?? res.data;
}

export default {
  createCircle,
  getPresignedUrl,
  getCirclesByUser,
  createPost,
  getPost,
  listPosts
};
