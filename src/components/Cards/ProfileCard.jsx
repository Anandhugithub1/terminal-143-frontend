  import React, { useCallback, useState, memo } from 'react';
  import PropTypes from 'prop-types';
  import { FiMessageCircle, FiUserPlus } from 'react-icons/fi';
  import { FaStar, FaVenus } from 'react-icons/fa';
  import { HiOutlineLocationMarker } from 'react-icons/hi';
  import { RxHeart } from 'react-icons/rx';
  import { PhotoCarousel } from '../User_Home/Carousel';
  import { ProfileInfo} from '../User_Home/ProfileInfo';

  // Main ProfileCard component
  const ProfileCard = ({ profile,onMessageClick,onConnectClick,placeholderImage }) => {
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
          placeholderImage={placeholderImage}
                  onError={e => { e.currentTarget.src = placeholderImage; }}

        />
        <ProfileInfo 
          onMessageClick={onMessageClick}
          onConnectClick={onConnectClick}
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
    placeholderImage: PropTypes.string,
    onMessageClick:   PropTypes.func.isRequired,
    onConnectClick:   PropTypes.func.isRequired
  };

  export default memo(ProfileCard);
