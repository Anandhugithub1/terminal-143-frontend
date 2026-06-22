import React, { memo, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoCarousel = memo(({
  images,
  activeIdx,
  onNext,
  onPrev,
  alt,
  placeholderImage,
  onError,
  className = '',
}) => {
  const loadedSetRef = useRef(new Set());
  const prefetchDistance = 1;

  const norm = (idx) => {
    if (!images || images.length === 0) return 0;
    return ((idx % images.length) + images.length) % images.length;
  };

  useEffect(() => {
    if (!images || images.length === 0) return;

    const toPreload = new Set();
    for (let d = -prefetchDistance; d <= prefetchDistance; d++) {
      const idx = norm(activeIdx + d);
      const url = images[idx];
      if (url) toPreload.add(url);
    }

    toPreload.forEach((url) => {
      if (loadedSetRef.current.has(url)) return;
      const img = new window.Image();
      img.src = url;
      img.onload = () => loadedSetRef.current.add(url);
      img.onerror = () => loadedSetRef.current.add(url);
    });
  }, [images, activeIdx]);

  const handleError = (e) => {
    if (placeholderImage) e.currentTarget.src = placeholderImage;
    onError?.(e);
  };

  const segments = useMemo(
    () => (
      <div className="absolute top-1 left-0 right-0 flex justify-center px-2 pt-1 space-x-1 z-10 pointer-events-none">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={classnames(
              'h-1 rounded-full',
              {
                'bg-white shadow-sm shadow-black/50': idx === activeIdx,
                'bg-gray-200/80 shadow-sm shadow-black/30': idx !== activeIdx,
              }
            )}
            style={{ width: `max(4vw, 24px)` }}
          />
        ))}
      </div>
    ),
    [images, activeIdx]
  );

  if (!images || images.length === 0) return null;

  return (
    <div
      className={classnames(
        'relative w-full h-full overflow-hidden rounded-3xl',
        className
      )}
    >
      <img
        key={images[norm(activeIdx)]}
        src={images[norm(activeIdx)]}
        alt={`${alt} photo ${norm(activeIdx) + 1}`}
        className="w-full h-full object-cover select-none"
        draggable="false"
        loading="eager"
        decoding="sync"
        onError={handleError}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      {segments}

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center border-0 text-gray-700 shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={onNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center border-0 text-gray-700 shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
});

PhotoCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeIdx: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  alt: PropTypes.string.isRequired,
  placeholderImage: PropTypes.string,
  onError: PropTypes.func,
  className: PropTypes.string,
};

export default PhotoCarousel;
