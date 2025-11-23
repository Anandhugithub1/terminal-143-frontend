import { userProfilesApi } from "../../api/clients";

// Generic request wrapper
async function request(method, url, { params, data } = {}) {
  const res = await userProfilesApi.request({
    method,
    url,
    params,
    data,
    withCredentials: true
  });

  return res?.data ?? res;
}

export async function getPresignedUrl(payload) {
  return request("post", "/circles/predesignedurl", { data: payload });
}

export async function getCirclesByUser(params = {}) {
  return request("get", "/circles/user/circles", { params });
}

/**
 * Create a post in a specific circle
 */
export async function createPost(circleName, payload) {
  if (!circleName) throw new Error("circleName is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts`;
  return request("post", url, { data: payload });
}

/**
 * Get a single post
 */
export async function getPost(circleName, postId, postedAt) {
  if (!circleName) throw new Error("circleName is required");
  if (!postId) throw new Error("postId is required");
  if (!postedAt) throw new Error("postedAt (epoch ms) is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts/${encodeURIComponent(postId)}`;

  return request("get", url, { params: { postedAt } });
}

/**
 * List posts for a circle
 */
export async function listPosts(circleName, params = {}) {
  if (!circleName) throw new Error("circleName is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts`;
  return request("get", url, { params });
}


export async function listComments(postId,params ={}){
if(!postId) throw new Error("post id is required");

const url =`/circles/posts/${encodeURIComponent(postId)}/comments`
return request("get",url,{params});

}

export async function updatePost(circleName, postId, postedAtEpoch, payload = {}) {
  if (!circleName) throw new Error("circleName is required");
  if (!postId) throw new Error("postId is required");
  if (!postedAtEpoch) throw new Error("postedAtEpoch is required");

  const url = `/circles/${encodeURIComponent(circleName)}/posts/${encodeURIComponent(postId)}`;

  return request("patch", url, {
    params: { postedAt: postedAtEpoch },
    data: payload
  });
}

export async function createComment(postId, payload) {
  if (!postId) throw new Error("postId is required");

  const url = `/circles/posts/${encodeURIComponent(postId)}/comments`;
  const res = await request("post", url, { data: payload });

  // keep original behavior
  return res?.circle ?? res;
}



export async function createCircle(payload) {
  const res = await request("post", "/circles/create", { data: payload });

  return res?.circle ?? res;
}

export default {
  createCircle,
  getPresignedUrl,
  getCirclesByUser,
  createPost,
  getPost,
  listPosts,
  updatePost,
  createComment
};
