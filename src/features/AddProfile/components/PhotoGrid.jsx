import React from "react";
import PhotoSlot from "./PhotoSlot";

const PhotoGrid = ({ photos, maxSlots, onSlotChange, onSlotRemove, uploading }) => {
  const userType = localStorage.getItem("userType");

  return (
    <div
      className={`${
        userType === "fm"
          ? "flex justify-center items-center" // FM — single centered slot
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 place-items-center" // MP — responsive grid
      }`}
    >
      {Array.from({ length: maxSlots }, (_, index) => (
        <PhotoSlot
          key={index}
          file={photos[index]}
          index={index}
          onChange={onSlotChange}
          onRemove={onSlotRemove}
          uploading={uploading}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;