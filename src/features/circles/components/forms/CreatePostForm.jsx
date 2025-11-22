import React, { useState, useEffect } from "react";
import {
  createPost as createPostApi,
  getPresignedUrl as getPresignedUrlApi,
  updatePost as updatePostApi, // <-- import updatePost
} from "../../api";

export default function CreatePostForm({ onCreate, onCancel, circleName }) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // cleanup preview URL
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (f) => {
    setError(null);
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("Invalid file type. Allowed: jpeg, png, webp");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  // small helper to normalize circle name just like backend
  const normalize = (name = "") =>
    String(name).trim().toLowerCase().replace(/\s+/g, "-");

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!body.trim() && !file) {
      setError("Please provide text or attach an image.");
      return;
    }
    if (!circleName) {
      setError("Circle name is required to create a post.");
      return;
    }

    setUploading(true);

    try {
      // 1) CREATE POST FIRST (no media)
      const createPayload = {
        body: body.trim(),
        media: [],
        visibility: "members",
      };

      const createRes = await createPostApi(circleName, createPayload);
      const createdPost = createRes?.post ?? createRes?.item ?? createRes;

      if (!createdPost) {
        throw new Error("Post creation failed: no post returned");
      }

      const postId = createRes?.postId ?? createdPost?.postId;
      if (!postId) {
        throw new Error("Post creation failed: missing postId");
      }

      // derive postedAtEpoch from SK: "POST#<epoch>#<postId>"
      let postedAtEpoch = null;
      const sk = createdPost.SK || createdPost.sk;
      if (sk && sk.startsWith("POST#")) {
        const parts = sk.split("#"); // ["POST", "<epoch>", "<postId>"]
        if (parts.length >= 3) {
          postedAtEpoch = parts[1];
        }
      }

      if (!postedAtEpoch) {
        console.warn("Could not derive postedAtEpoch from SK:", sk);
      }

      let finalPost = createdPost;

      // 2) IF THERE IS A FILE, UPLOAD IT AFTER POST IS CREATED
      if (file && postId && postedAtEpoch) {
        const normalizedCircleName = normalize(circleName);

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

        finalPost =
          updateRes?.post ?? updateRes?.item ?? updateRes ?? createdPost;
      } else if (file && (!postId || !postedAtEpoch)) {
        console.warn(
          "File attached but missing postId or postedAtEpoch; cannot attach media"
        );
      }

      // 4) Notify parent with the final post (with media if any)
      if (onCreate) onCreate(finalPost);

      // reset form
      setBody("");
      removeFile();
    } catch (err) {
      console.error("Create post failed", err);
      setError(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          What's on your mind?
        </label>
        <textarea
          aria-label="Post body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus resize-none bg-white"
          placeholder="Share your thoughts with the circle..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Attach image (optional)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="postMedia"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />
          <label
            htmlFor="postMedia"
            className="px-4 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white cursor-pointer"
          >
            {uploading ? "Preparing..." : "Choose image"}
          </label>

          {preview ? (
            <div className="flex items-center gap-2">
              <img
                src={preview}
                alt="preview"
                className="w-24 h-16 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={removeFile}
                className="text-sm text-red-600 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No image selected</div>
          )}
        </div>

        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || (!body.trim() && !file)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            {uploading ? "Posting..." : "Post to Circle"}
          </button>
        </div>
      </div>
    </form>
  );
}
