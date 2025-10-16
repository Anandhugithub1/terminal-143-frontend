import React from 'react';
import PhotoSlot from './PhotoSlot';

const PhotoGrid = ({ photos, maxSlots, onSlotClick, onRemove, uploading }) => {
  // Tailwind does not support dynamic class names like sm:grid-cols-${...}
  const gridCols = maxSlots === 1 ? 'grid-cols-1' : maxSlots === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`grid gap-4 ${gridCols} sm:${gridCols}`}>
      {Array.from({ length: maxSlots }, (_, index) => (
        <PhotoSlot
          key={index}
          file={photos[index]}
          index={index}
          onClick={() => onSlotClick(index)}
          onRemove={onRemove}
          uploading={uploading}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
