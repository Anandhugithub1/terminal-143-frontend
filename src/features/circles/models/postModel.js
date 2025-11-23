// src/models/postModel.js
import {
  createPost as createPostApi,
  getPresignedUrl as getPresignedUrlApi,
  updatePost as updatePostApi,
} from "../api";

// --- Types (JSDoc) ---

/**
 * @typedef {Object} Post
 * @property {string} postId
 * @property {string} [SK]
 * @property {string} [sk]
 * @property {string} body
 * @property {string[]} [media]
 * @property {string} [visibility]
 * // ...add other fields your backend returns
 */

// --- Helpers ---

/** Normalize circle name the same way as backend */
export const normalizeCircleName = (name = "") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

/**
 * Try to consistently extract a Post object from various API shapes.
 * @param {any} res
 * @returns {Post | null}
 */
export const extractPostFromResponse = (res) => {
  if (!res) return null;
  return res.post || res.item || res;
};

/**
 * Try to derive postedAtEpoch from SK: "POST#<epoch>#<postId>"
 * @param {Post} post
 * @returns {string | null}
 */
export const derivePostedAtEpoch = (post) => {
  const sk = post?.SK || post?.sk;
  if (!sk || !sk.startsWith("POST#")) return null;

  const parts = sk.split("#"); // ["POST", "<epoch>", "<postId>"]
  if (parts.length >= 3) return parts[1];
  return null;
};

// --- Main reusable function ---

/**
 * Create a post (optionally with media).
 * Handles:
 * 1) Create post without media
 * 2) If file provided -> get presigned URL, upload to S3
 * 3) Update post with media URL
 *
 * @param {Object} opts
 * @param {string} opts.circleName
 * @param {string} opts.body
 * @param {File | null} [opts.file]
 * @returns {Promise<Post>}
 */
export async function createPostWithMedia({ circleName, body, file }) {
  if (!circleName) {
    throw new Error("Circle name is required to create a post.");
  }

  if (!body.trim() && !file) {
    throw new Error("Please provide text or attach an image.");
  }

  // 1) CREATE POST FIRST (no media)
  const createPayload = {
    body: body.trim(),
    media: [],
    visibility: "members",
  };

  const createRes = await createPostApi(circleName, createPayload);
  let createdPost = extractPostFromResponse(createRes);

  if (!createdPost) {
    throw new Error("Post creation failed: no post returned");
  }

  const postId = createRes?.postId ?? createdPost?.postId;
  if (!postId) {
    throw new Error("Post creation failed: missing postId");
  }

  const postedAtEpoch = derivePostedAtEpoch(createdPost);
  if (!postedAtEpoch && file) {
    console.warn("Could not derive postedAtEpoch from SK:", createdPost.SK || createdPost.sk);
  }

  let finalPost = createdPost;

  // 2) IF THERE IS A FILE, UPLOAD IT AFTER POST IS CREATED
  if (file && postId && postedAtEpoch) {
    const normalizedCircleName = normalizeCircleName(circleName);

    const presPayload = {
      fileType: file.type,
      kind: "postMedia",
      circleName: normalizedCircleName,
      postId,
      mediaIndex: 0,
    };

    // request presigned URL from backend (cookies-based auth)
    const presResp = await getPresignedUrlApi(presPayload);
    const { presignedUrl, publicUrl } = presResp || {};
    if (!presignedUrl || !publicUrl) {
      throw new Error("Invalid presign response from server");
    }

    // upload file directly to S3
    const putRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error(`Upload failed with status ${putRes.status}`);
    }

    // 3) UPDATE POST WITH MEDIA URL (PATCH)
    const updatePayload = {
      media: [publicUrl],
    };

    const updateRes = await updatePostApi(
      circleName,
      postId,
      postedAtEpoch,
      updatePayload
    );

    finalPost = extractPostFromResponse(updateRes) || createdPost;
  }

  return finalPost;
}
