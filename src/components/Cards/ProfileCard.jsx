import React, { useCallback, useState, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiUserPlus } from 'react-icons/fi';
import { FaStar, FaVenus } from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { RxHeart } from 'react-icons/rx';
import classnames from 'classnames';

// A simple badge component for profile attributes
const Badge = memo(({ icon, label, iconClass = 'text-gray-800' }) => (
  <span className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
    {React.cloneElement(icon, { className: iconClass })}
    <span className="text-gray-800">{label}</span>
  </span>
));

Badge.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconClass: PropTypes.string,
};

// Photo carousel with swipe and dots indicator
const PhotoCarousel = memo(({ images, activeIdx, onNext, onPrev, alt }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const dots = useMemo(() =>
    images.map((_, idx) => (
      <span
        key={idx}
        className={classnames('w-2 h-2 rounded-full transition-opacity', {
          'bg-white': idx === activeIdx,
          'bg-white bg-opacity-50': idx !== activeIdx,
        })}
      />
    )), [images, activeIdx]
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
};

// Overlay with profile details and action buttons
const ProfileInfo = memo(({ name, age, lastActive, about, gender, top, compatibility, distance }) => (
  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-transparent text-white">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">{name}, {age}</h2>
        <p className="text-sm opacity-75">Active {lastActive}</p>
      </div>
      <div className="flex space-x-2">
        <button aria-label="Message" className="p-2 bg-primary rounded-full">
          <FiMessageCircle size={16} />
        </button>
        <button aria-label="Connect" className="p-2 bg-primary rounded-full">
          <FiUserPlus size={16} />
        </button>
      </div>
    </div>

    {about && <p className="mt-2 italic text-sm">“{about}”</p>}

    <div className="flex items-center space-x-2 mt-2">
      <Badge icon={<FaVenus size={12} />} label={gender} />
      <Badge icon={<FaStar size={12} />} label={top} iconClass="text-yellow-400" />
      <Badge icon={<RxHeart size={12} />} label={`${compatibility}%`} iconClass="text-red-500" />
    </div>

    <div className="flex items-center text-sm mt-2">
      <HiOutlineLocationMarker className="mr-1" />
      <span>{distance}</span>
    </div>
  </div>
));

ProfileInfo.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  lastActive: PropTypes.string,
  about: PropTypes.string,
  gender: PropTypes.string,
  top: PropTypes.string,
  compatibility: PropTypes.number,
  distance: PropTypes.string,
};

// Main ProfileCard component
const ProfileCard = ({ profile }) => {
  const { images = [], name, age, lastActive = 'just now', about, gender, top, compatibility, distance } = profile;
  const [photoIdx, setPhotoIdx] = useState(0);
  const lastIdx = images.length - 1;

  const onNext = useCallback(() => {
    setPhotoIdx(idx => Math.min(idx + 1, lastIdx));
  }, [lastIdx]);

  const onPrev = useCallback(() => {
    setPhotoIdx(idx => Math.max(idx - 1, 0));
  }, []);

  if (!images.length) return null;

  return (
    <div className="mx-4 mt-4 rounded-xl shadow-lg overflow-hidden relative">
      <PhotoCarousel
        images={images}
        activeIdx={photoIdx}
        onNext={onNext}
        onPrev={onPrev}
        alt={name}
      />
      <ProfileInfo
        name={name}
        age={age}
        lastActive={lastActive}
        about={about}
        gender={gender}
        top={top}
        compatibility={compatibility}
        distance={distance}
      />
    </div>
  );
};

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    age: PropTypes.number,
    lastActive: PropTypes.string,
    about: PropTypes.string,
    gender: PropTypes.string,
    top: PropTypes.string,
    compatibility: PropTypes.number,
    distance: PropTypes.string,
  }).isRequired,
};

export default memo(ProfileCard);
