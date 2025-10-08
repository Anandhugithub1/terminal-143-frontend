import React, { useEffect, useState } from 'react';

const PhotoSlot = ({ file, onClick, uploading, index }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    let url;
    try {
      if (file instanceof File) {
        url = URL.createObjectURL(file);
        setPreview(url);
      } else if (typeof file === 'string') {
        setPreview(file); // Already a URL (IndexedDB or backend)
      } else {
        setPreview(null);
      }
    } catch (err) {
      console.error('Failed to create preview URL:', err);
      setPreview(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div
      className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {preview && (
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all ${
          file ? 'bg-black/40 opacity-0 group-hover:opacity-100' : 'bg-transparent'
        }`}
      >
        <div className="p-3 bg-white/80 rounded-full">
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
        </div>
      </div>
    </div>
  );
};

export default PhotoSlot;
