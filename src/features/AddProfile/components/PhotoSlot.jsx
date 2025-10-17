import React, { useEffect, useState } from 'react';

const PhotoSlot = ({ file, onChange, onRemove, uploading, index }) => {
  const [preview, setPreview] = useState(null);

  // Lazy-load preview immediately
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (typeof file === 'string') {
      setPreview(file);
    }
  }, [file]);

  return (
    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group cursor-pointer">
      {preview && <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />}
      
      {/* Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all ${
          file ? 'bg-black/40 opacity-0 group-hover:opacity-100' : 'bg-transparent'
        }`}
      >
        <div className="flex gap-2">
          {file && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="p-2 bg-white/80 rounded-full touch-manipulation"
              title="Remove"
            >
              ❌
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(index);
            }}
            className="p-2 bg-white/80 rounded-full touch-manipulation"
            title={file ? "Replace" : "Add"}
          >
            {uploading ? (
              <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6 text-pink-500"
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
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoSlot;
