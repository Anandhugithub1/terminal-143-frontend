// src/components/forms/CreateCircleForm.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCircle as createCircleApi, getPresignedUrl as getPresignedUrlApi } from "../../api";
import { useCoverUpload } from "../../Hooks/useCoverUpload";

export default function CreateCircleForm({ onCreate, onCancel, ownerId, getToken }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // use hook for cover logic
  const {
    previewUrl,
    file: coverFile,
    uploading,
    error: coverError,
    handleSelect,
    remove,
    upload,
    reset: resetCover
  } = useCoverUpload({ getPresignedUrl: getPresignedUrlApi, getToken });

  const queryClient = useQueryClient();

  const createCircleMutation = useMutation({
    mutationFn: async (payload) => {
      const token = typeof getToken === "function" ? getToken() : null;
      const normalized = {
        ...payload,
        name: payload.name?.trim(),
        tags: (payload.tags || []).map((t) => (typeof t === "string" ? t.trim().toLowerCase() : t))
      };
      return await createCircleApi(normalized, { token });
    },
    onSuccess: (circle) => {
      queryClient.invalidateQueries(["circles"]);
      if (onCreate) onCreate(circle);
    }
  });

  useEffect(() => {
    if (createCircleMutation.isSuccess) {
      // reset form on success
      setName("");
      setDesc("");
      setVisibility("public");
      setTags([]);
      setTagInput("");
      resetCover();
    }
  }, [createCircleMutation.isSuccess, resetCover]); // eslint-disable-line

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => setTags((p) => p.filter((t) => t !== tagToRemove));

  // wire native file input to hook
  const onFileChange = (f) => handleSelect(f);

  // Submit handler: upload if file selected, then create circle with coverPhoto
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      // 1) upload file first (if any)
      let coverPublicUrl = null;
      if (coverFile) {
        coverPublicUrl = await upload(name.trim());
      }

      // 2) create circle including coverPhoto if uploaded
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        visibility,
        tags,
        ...(ownerId ? { ownerId } : {}),
        ...(coverPublicUrl ? { coverPhoto: coverPublicUrl } : {})
      };

      // we pass token inside createCircleApi via createCircleMutation's mutationFn
      await createCircleMutation.mutateAsync(payload);
    } catch (err) {
      // upload or create error — coverError (from hook) or mutation error will display
      console.error("Create + upload error:", err);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Circle Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus bg-white"
          placeholder="e.g., Book Club, Hiking Buddies..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus resize-none bg-white"
          placeholder="What is this circle about?"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Cover Photo (optional)</label>

        <div className="flex items-center gap-3">
          <input
            id="coverFile"
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0])}
            className="hidden"
          />
          <label htmlFor="coverFile" className="px-4 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white cursor-pointer">
            {uploading ? "Preparing..." : "Choose Cover Photo"}
          </label>

          {previewUrl ? (
            <div className="flex items-center gap-2">
              <img src={previewUrl} alt="preview" className="w-20 h-12 object-cover rounded-md border" />
              <button type="button" onClick={remove} className="text-sm text-red-600 underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No preview</div>
          )}
        </div>

        {(coverError || createCircleMutation.isError) && (
          <div className="text-sm text-red-600 mt-2">{coverError || createCircleMutation.error?.message || "Failed to create circle"}</div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Visibility</label>
        <div className="grid grid-cols-2 gap-3">
          {["public", "invite"].map((vis) => (
            <button
              key={vis}
              type="button"
              onClick={() => setVisibility(vis)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                visibility === vis ? "border-primary ring-2 ring-primary ring-opacity-20 bg-blue-50" : "border-border-clr hover:border-primary"
              }`}
            >
              <div className="text-sm font-medium text-gray-900 capitalize">{vis}</div>
              <div className="text-xs text-gray-500 mt-1">{vis === "public" ? "Anyone can join" : "Invite only"}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Tags</label>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="flex-1 p-3 rounded-xl border border-border-clr bg-white"
            placeholder="Add a tag..."
          />
          <button type="button" onClick={addTag} className="px-4 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white">
            Add
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-sm">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200" aria-label={`Remove tag ${tag}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white">
          Cancel
        </button>

        <button
          type="submit"
          disabled={!name.trim() || createCircleMutation.isLoading || uploading}
          className="flex-1 py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl disabled:hover:shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
        >
          {createCircleMutation.isLoading || uploading ? "Uploading..." : "Create Circle"}
        </button>
      </div>
    </form>
  );
}
