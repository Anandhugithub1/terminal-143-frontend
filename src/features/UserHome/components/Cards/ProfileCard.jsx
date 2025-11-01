import React, { useCallback, useState, memo } from 'react';
import PropTypes from 'prop-types';
import PhotoCarousel from '../Actions/Carousel';
import ProfileInfo from '../Details/ProfileInfo';

const ProfileCard = ({ profile, onMessageClick, onConnectClick, placeholderImage }) => {
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

  const onNext = useCallback(() => {
    setPhotoIdx((idx) => (idx + 1) % images.length);
  }, [images.length]);

  const onPrev = useCallback(() => {
    setPhotoIdx((idx) => (idx - 1 + images.length) % images.length);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="mx-5 mt-3 rounded-3xl shadow-lg overflow-hidden relative h-[55vh] sm:h-[60vh] md:h-[65vh]">
      {/* Photo Section */}
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
        className="w-full h-full object-cover"
      />

      {/* Gradient Overlays for Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Profile Info */}
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
    </div>
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
};

export default memo(ProfileCard);
