import { useSwipeable } from 'react-swipeable';
import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { motion } from 'framer-motion';

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
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Telegram-style horizontal progress bars with better visibility
  const segments = useMemo(
    () => (
      <div className="absolute top-1 left-0 right-0 flex justify-center px-4 pt-1 space-x-1 z-10">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={classnames(
              'h-1 w-[80vh]  transition-all duration-300 rounded-full',
              {
                'w-6 bg-white shadow-sm shadow-black/50': idx === activeIdx,
                'w-6 bg-gray-200/80 shadow-sm shadow-black/30': idx !== activeIdx,
              }
            )}
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

  return (
    <motion.div
      {...handlers}
      className={classnames('relative overflow-hidden', className)}
      initial={{ scale: 1 }}
      whileTap={{ scale: 0.97 }}
    >
      <img
        src={images[activeIdx]}
        alt={`${alt} photo ${activeIdx + 1}`}
        className="w-full h-full object-cover"
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      {segments}
    </motion.div>
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
