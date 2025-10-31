import React, { useEffect, useState } from "react";

const PhotoSlot = ({ file, onChange, onRemove, uploading, index }) => {
  const [preview, setPreview] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleSlotClick = () => !uploading && onChange(index);
  const handleRemove = (e) => {
    e.stopPropagation();
    if (!uploading) onRemove(index);
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden transition-all duration-300
        w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full
        ${preview ? "bg-gray-100" : "bg-gray-50 border-2 border-dashed border-gray-200"}
        ${uploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-gray-300"}
        ${isHovered && preview && !uploading ? "ring-2 ring-pink-500 ring-opacity-50" : ""}
      `}
      onClick={handleSlotClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {preview ? (
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className={`object-cover w-full h-full rounded-full transition-transform duration-300
            ${isHovered && !uploading ? "scale-105" : "scale-100"}
          `}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mb-1 sm:mb-2 md:mb-3 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-gray-500 text-xs sm:text-sm font-medium">Click to Upload</span>
        </div>
      )}

      {file && !uploading && (
        <button
          onClick={handleRemove}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-200"
          title="Remove photo"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
          <div className="text-white text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1 sm:mb-2" />
            <span className="text-xs font-medium">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoSlot;