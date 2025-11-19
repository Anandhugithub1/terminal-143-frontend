import { useState } from "react";

export default function CreatePostForm({ onCreate, onCancel }) {
  const [body, setBody] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    onCreate({ body, author: { name: "You", role: "Member" } });
    setBody("");
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

      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            className="w-10 h-10 rounded-xl border border-border-clr flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200 bg-white"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-xl border border-border-clr flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200 bg-white"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

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
            disabled={!body.trim()}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl disabled:hover:shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Post to Circle
          </button>
        </div>
      </div>
    </form>
  );
}