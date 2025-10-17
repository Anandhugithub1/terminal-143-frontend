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

  const handleSlotClick = () => {
    if (!uploading) {
      onChange(index);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (!uploading) {
      onRemove(index);
    }
  };

  const handleAddReplace = (e) => {
    e.stopPropagation();
    if (!uploading) {
      onChange(index);
    }
  };

  return (
    <div
      className={`relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 
        ${preview ? "bg-gray-100" : "bg-gray-50 border-2 border-dashed border-gray-200"}
        ${uploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-gray-300"}
        ${isHovered && preview && !uploading ? "ring-2 ring-pink-500 ring-opacity-50" : ""}`}
      onClick={handleSlotClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Image */}
      {preview ? (
        <div className="relative w-full h-full">
          <img
            src={preview}
            alt={`Preview ${index + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered && !uploading ? "scale-105" : "scale-100"
            }`}
          />
          
          {/* Overlay on hover */}
          {isHovered && !uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
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
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 mb-3 text-gray-300">
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
          <span className="text-gray-400 text-sm font-medium">Tap to Upload</span>
        </div>
      )}

      {/* Remove Button - Only show when file exists and not uploading */}
      {file && !uploading && (
        <button
          onClick={handleRemove}
          className={`absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg transition-all duration-200 
            hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95
            ${isHovered ? "opacity-100" : "opacity-90"}`}
          title="Remove photo"
          aria-label="Remove photo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-medium">Uploading...</span>
          </div>
        </div>
      )}

      {/* Add/Replace Button - Always visible but disabled during upload */}
      {!uploading && (
        <button
          onClick={handleAddReplace}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all duration-200 
            hover:shadow-xl hover:bg-gray-50 active:scale-95
            ${file ? "text-gray-700" : "text-pink-500"}`}
          aria-label={file ? "Replace photo" : "Add photo"}
        >
          <svg
            className={`w-5 h-5 ${file ? "text-gray-500" : "text-pink-500"}`}
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
          <span className="text-sm font-medium whitespace-nowrap">
            {file ? "Replace" : "Add Photo"}
          </span>
        </button>
      )}
    </div>
  );
};

export default PhotoSlot;