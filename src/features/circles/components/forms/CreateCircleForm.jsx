import { useState } from "react";

export default function CreateCircleForm({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description: desc, visibility, tags });
    setName("");
    setDesc("");
    setVisibility("public");
    setTags([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Circle Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus bg-white"
          placeholder="e.g., Book Club, Hiking Buddies..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus resize-none bg-white"
          placeholder="What is this circle about?"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Visibility
        </label>
        <div className="grid grid-cols-2 gap-3">
          {["public", "invite"].map((vis) => (
            <button
              key={vis}
              type="button"
              onClick={() => setVisibility(vis)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                visibility === vis
                  ? "border-primary ring-2 ring-primary ring-opacity-20 bg-blue-50"
                  : "border-border-clr hover:border-primary"
              }`}
            >
              <div className="text-sm font-medium text-gray-900 capitalize">
                {vis}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {vis === "public" ? "Anyone can join" : "Invite only"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Tags
        </label>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="flex-1 p-3 rounded-xl border border-border-clr bg-white"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl disabled:hover:shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
        >
          Create Circle
        </button>
      </div>
    </form>
  );
}
