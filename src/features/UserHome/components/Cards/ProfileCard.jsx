import React, { useCallback, useState, memo } from 'react';
import PropTypes from 'prop-types';
import PhotoCarousel from '../Actions/Carousel';
import ProfileInfo from '../Details/ProfileInfo';
import { ShieldAlert   } from "lucide-react";

const ProfileCard = ({ profile, onMessageClick, onConnectClick, placeholderImage,onReport }) => {
  const {
    images = [],
    name,
    age,
    lastSeen = '',
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
      
<div className="absolute top-3 right-3 z-20">
  <button
    onClick={() => onReport?.()}
    className="bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition flex items-center justify-center"
  >
    <ShieldAlert   size={18} strokeWidth={2} />
  </button>
</div>
      
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
        feedback={profile.feedback}
        ageVerified={profile.ageVerified}
        photoVerified={profile.photoVerified}
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
     feedback: PropTypes.shape({
    likePercentage: PropTypes.number
  })
  }).isRequired,
  placeholderImage: PropTypes.string,
  onMessageClick: PropTypes.func,
  onConnectClick: PropTypes.func,
  onReport: PropTypes.func,
};

export default memo(ProfileCard);
