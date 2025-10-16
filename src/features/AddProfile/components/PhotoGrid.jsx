import React from 'react';
import PhotoSlot from './PhotoSlot';

const PhotoGrid = ({ photos, maxSlots, onSlotClick, onRemove, uploading }) => {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-${maxSlots > 2 ? maxSlots : 2}`}>
      {Array.from({ length: maxSlots }, (_, index) => (
        <PhotoSlot
          key={index}
          file={photos[index]}
          onClick={() => onSlotClick(index)}
          onRemove={() => onRemove(index)}
          uploading={uploading}
          index={index}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
