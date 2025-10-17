import React from 'react';
import PhotoSlot from './PhotoSlot';

const PhotoGrid = ({ photos, maxSlots, onSlotChange, onSlotRemove, uploading }) => {
  const cols = maxSlots > 2 ? maxSlots : 2; // max 3 columns for MP

  return (
    <div className={`grid gap-4 grid-cols-2 sm:grid-cols-${cols}`}>
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
