import React, { memo, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

export const PhotoCarousel = memo(({
  images,
  activeIdx,
  onNext,
  onPrev,
  alt,
  placeholderImage,
  onError,
  className = '',
}) => {
  const startXRef = useRef(0);
  const containerRef = useRef();

  // Handle touch start
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  // Handle touch end and detect swipe
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = startXRef.current - endX;
    const threshold = 50; // swipe distance in px

    if (deltaX > threshold) {
      onNext();
    } else if (deltaX < -threshold) {
      onPrev();
    }
  };

  // Preload next/prev images
  useEffect(() => {
    const preloadImage = (src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    };

    const nextIdx = (activeIdx + 1) % images.length;
    const prevIdx = (activeIdx - 1 + images.length) % images.length;

    preloadImage(images[nextIdx]);
    preloadImage(images[prevIdx]);
  }, [activeIdx, images]);

  // Progress bar segments
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

  const handleError = (e) => {
    if (placeholderImage) e.currentTarget.src = placeholderImage;
    onError?.(e);
  };

  // Skip animation on first load
  const hasLoadedOnce = useRef(false);
  useEffect(() => {
    hasLoadedOnce.current = true;
  }, [activeIdx]);

  return (
    <div className={classnames('relative w-full h-full', className)}>
      {/* Touch overlay for detecting horizontal swipes, allow vertical scroll */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-20"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      <motion.div
        className="relative overflow-hidden select-none w-full h-full"
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.97 }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={images[activeIdx]}
            src={images[activeIdx]}
            srcSet={`${images[activeIdx]} 1x, ${images[activeIdx]} 2x`}
            alt={`${alt} photo ${activeIdx + 1}`}
            className="w-full h-full object-cover"
            draggable="false"
            onError={handleError}
            loading="lazy"
            decoding="async"
            style={{
              maxHeight: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            initial={hasLoadedOnce.current ? { opacity: 0, scale: 0.98 } : false}
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

PhotoCarousel.defaultProps = {
  placeholderImage: '',
  onError: null,
  className: '',
};
