import React, { memo, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePhotoTap = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const tapX = e.detail?.x ?? rect.width / 2;

      if (tapX > rect.width / 2) {
        onNext(); // right side → next
      } else {
        onPrev(); // left side → previous
      }
    };

    const current = containerRef.current;
    current?.addEventListener('photoTap', handlePhotoTap);
    return () => {
      current?.removeEventListener('photoTap', handlePhotoTap);
    };
  }, [onNext, onPrev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Ignore vertical swipes (scroll)
    if (Math.abs(deltaY) > 40) return;

    // Treat small horizontal movement as tap
    if (Math.abs(deltaX) < 30) {
      const rect = containerRef.current.getBoundingClientRect();
      const tapX = e.changedTouches[0].clientX;
      if (tapX > rect.width / 2) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  const handleError = (e) => {
    if (placeholderImage) e.currentTarget.src = placeholderImage;
    onError?.(e);
  };

  // Top segment progress bars
  const segments = useMemo(
    () => (
      <div className="absolute top-1 left-0 right-0 flex justify-center px-2 pt-1 space-x-1 z-10 pointer-events-none">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={classnames(
              'h-1 transition-all duration-300 rounded-full',
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

  return (
    <div
      ref={containerRef}
      className={classnames(
        'relative w-full h-full carousel-touch-zone overflow-hidden rounded-3xl',
        className
      )}
    >
      <motion.div
        className="relative select-none w-full h-full"
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.97 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={images[activeIdx]}
            src={images[activeIdx]}
            alt={`${alt} photo ${activeIdx + 1}`}
            className="w-full h-full object-cover"
            draggable="false"
            loading="lazy"
            decoding="async"
            onError={handleError}
            style={{
              maxHeight: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
              touchAction: 'manipulation',
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        {segments}
      </motion.div>
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
