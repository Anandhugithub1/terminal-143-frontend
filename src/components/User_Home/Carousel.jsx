/* eslint-disable no-unused-vars */
import { useSwipeable } from 'react-swipeable';
import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { motion } from 'framer-motion';

// Photo carousel with swipe and dots indicator
export const PhotoCarousel = memo(({
  images,
  activeIdx,
  onNext,
  onPrev,
  alt,
  placeholderImage,
  onError,
}) => {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const dots = useMemo(
    () =>
      images.map((_, idx) => (
        <span
          key={idx}
          className={classnames('w-2 h-2 rounded-full transition-opacity', {
            'bg-white': idx === activeIdx,
            'bg-white bg-opacity-50': idx !== activeIdx,
          })}
        />
      )),
    [images, activeIdx]
  );

  const handleError = useCallback(
    (e) => {
      if (placeholderImage) {
        e.currentTarget.src = placeholderImage;
      }
      if (onError) {
        onError(e);
      }
    },
    [placeholderImage, onError]
  );

  return (
    <motion.div
      {...handlers}
      className="relative overflow-hidden"
      initial={{ scale: 1 }}
      whileTap={{ scale: 0.97 }}
    >
      <img
        src={images[activeIdx]}
        alt={`${alt} photo ${activeIdx + 1}`}
        className="w-full h-96 object-cover"
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {dots}
      </div>
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
};

PhotoCarousel.defaultProps = {
  placeholderImage: '',
  onError: null,
};