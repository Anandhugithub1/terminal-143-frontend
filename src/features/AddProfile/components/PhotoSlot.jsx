import React, { useEffect, useState } from 'react';

const PhotoSlot = ({ file, onClick, onRemove, uploading, index }) => {
  const [preview, setPreview] = useState(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    let url;
    try {
      if (file instanceof File) {
        // Show thumbnail immediately
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else if (typeof file === 'string') {
        setPreview(file);
      } else {
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
      setPreview(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group">
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
      />

      {preview && (
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
      )}

      {file && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute top-1 right-1 w-10 h-10 flex items-center justify-center 
                     bg-white rounded-full shadow-md text-red-600 hover:bg-red-100 z-10 
                     transition-all"
          aria-label="Remove photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {!file && !uploading && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-pink-500 z-0
                      transition-transform duration-150 ${isPressed ? 'scale-90' : 'scale-100'}`}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )}

      {uploading && !file && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PhotoSlot;
