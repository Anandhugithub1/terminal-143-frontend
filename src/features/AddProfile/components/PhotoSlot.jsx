import React, { useEffect, useState } from "react";

const PhotoSlot = ({ file, onChange, onRemove, uploading, index }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (typeof file === "string") {
      setPreview(file);
    }
  }, [file]);

  return (
    <div
      className={`relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200 
        ${preview ? "bg-gray-200" : "bg-gray-50 border-2 border-dashed border-gray-300"}
        hover:shadow-lg`}
      onClick={() => onChange(index)}
    >
      {preview ? (
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tap to Upload</span>
      )}

      {/* Remove Button */}
      {file && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white"
          title="Remove"
        >
          ✕
        </button>
      )}

      {/* Add / Replace Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange(index);
        }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1 rounded-full flex items-center gap-1 shadow-md"
      >
        {uploading ? (
          <div className="w-5 h-5 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg
              className="w-5 h-5 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {file ? "Replace" : "Add"}
          </>
        )}
      </button>
    </div>
  );
};

export default PhotoSlot;
