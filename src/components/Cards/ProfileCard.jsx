import React, { useCallback, useState, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSwipeable } from 'react-swipeable';
import { motion, useAnimation } from 'framer-motion';
import { PhotoCarousel } from '../User_Home/Carousel';
import { ProfileInfo } from '../User_Home/ProfileInfo';

const SWIPE_THRESHOLD = 120;

const ProfileCard = ({
  profile,
  onMessageClick,
  onConnectClick,
  placeholderImage,
  onSwipe = () => {},
}) => {
  const {
    images = [],
    name,
    age,
    lastSeen = 'just now',
    about,
    gender,
    top,
    compatibility,
    distance,
  } = profile;

  const [photoIdx, setPhotoIdx] = useState(0);
  const lastIdx = images.length - 1;
  const controls = useAnimation();
  const cardRef = useRef();

  const onNext = useCallback(() => {
    setPhotoIdx((idx) => Math.min(idx + 1, lastIdx));
  }, [lastIdx]);

  const onPrev = useCallback(() => {
    setPhotoIdx((idx) => Math.max(idx - 1, 0));
  }, []);

  const handleSwipe = async (deltaX) => {
    if (deltaX > SWIPE_THRESHOLD) {
      // Swiped right
      await controls.start({ x: 500, opacity: 0, rotate: 20 });
      onSwipe('right', profile);
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // Swiped left
      await controls.start({ x: -500, opacity: 0, rotate: -20 });
      onSwipe('left', profile);
    } else {
      // Snap back
      controls.start({ x: 0, opacity: 1, rotate: 0 });
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiped: ({ deltaX }) => handleSwipe(deltaX),
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  if (!images.length) return null;

  return (
    <motion.div
      {...swipeHandlers}
      animate={controls}
      initial={{ x: 0, opacity: 1, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      className="mx-5 mt-4 rounded-3xl shadow-lg overflow-hidden h-[65vh] relative cursor-grab select-none bg-white"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => handleSwipe(info.offset.x)}
      ref={cardRef}
    >
      <PhotoCarousel
        images={images}
        activeIdx={photoIdx}
        onNext={onNext}
        onPrev={onPrev}
        alt={name}
        placeholderImage={placeholderImage}
        onError={(e) => {
          e.currentTarget.src = placeholderImage;
        }}
        className="w-full h-full"
      />

      <ProfileInfo
        onMessageClick={onMessageClick}
        onConnectClick={onConnectClick}
        name={name}
        age={age}
        lastSeen={lastSeen}
        about={about}
        gender={gender}
        top={top}
        compatibility={compatibility}
        distance={distance}
      />
    </motion.div>
  );
};

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    age: PropTypes.number,
    lastSeen: PropTypes.string,
    about: PropTypes.string,
    gender: PropTypes.string,
    top: PropTypes.string,
    compatibility: PropTypes.number,
    distance: PropTypes.string,
  }).isRequired,
  placeholderImage: PropTypes.string,
  onMessageClick: PropTypes.func.isRequired,
  onConnectClick: PropTypes.func.isRequired,
  onSwipe: PropTypes.func, // added to allow swipe callback
};

export default memo(ProfileCard);
