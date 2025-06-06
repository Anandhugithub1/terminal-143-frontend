import { useSwipeable } from 'react-swipeable';
import React, { memo, useMemo, useCallback, useEffect, useRef } from 'react';
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
  const containerRef = useRef();
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    preventDefaultTouchmoveEvent: true,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 10,  // Increased for better reliability
    flickThreshold: 0.15,  // Slightly increased
    rotationAngle: 30,  // Increased angle tolerance
    nodeRef: containerRef,  // Ensures stable reference
  });

  // Preload next/prev
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

  // Progress bar
  const segments = useMemo(
    () => (
      <div className="absolute top-1 left-0 right-0 flex justify-center px-2 pt-1 space-x-1 z-10 pointer-events-none">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={classnames(
              'h-1 transition-all duration-300 rounded-full',
              {
                'w-6 bg-white shadow-sm shadow-black/50': idx === activeIdx,
                'w-6 bg-gray-200/80 shadow-sm shadow-black/30': idx !== activeIdx,
              }
            )}
            style={{
              width: `max(4vw, 24px)`,
            }}
          />
        ))}
      </div>
    ),
    [images, activeIdx]
  );

  const handleError = useCallback(
    e => {
      if (placeholderImage) e.currentTarget.src = placeholderImage;
      onError?.(e);
    },
    [placeholderImage, onError]
  );

  // Add a flag to skip animation on first load
  const hasLoadedOnce = useRef(false);
  useEffect(() => {
    hasLoadedOnce.current = true;
  }, [activeIdx]);

  return (
    <div className={classnames('relative', className)}>
      {/* Swipe overlay - invisible layer for better touch detection */}
      <div 
        {...handlers}
        className="absolute inset-0 z-20"
        style={{ touchAction: 'none' }}
      />
      
      <motion.div
        ref={containerRef}
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
            onError={handleError}
            loading="lazy"
            decoding="async"
            style={{
              maxHeight: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            initial={
              hasLoadedOnce.current
                ? { opacity: 0, scale: 0.98 }
                : false // skip animation on first load
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
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
