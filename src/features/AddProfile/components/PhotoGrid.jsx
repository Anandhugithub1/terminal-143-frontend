import React from "react";
import PhotoSlot from "./PhotoSlot";

const SINGLE_PHOTO_GENDERS = ["M", "TM", "OT"];

const PhotoGrid = ({ photos, maxSlots, onSlotChange, onSlotRemove }) => {
  const gender = localStorage.getItem("gender");
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender);

  return (
    <div
      className={
        isSinglePhoto
          ? "flex justify-center items-center"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 place-items-center"
      }
    >
      {Array.from({ length: maxSlots }, (_, index) => (
        <PhotoSlot
          key={index}
          file={photos[index]}
          index={index}
          onChange={onSlotChange}
          onRemove={onSlotRemove}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
