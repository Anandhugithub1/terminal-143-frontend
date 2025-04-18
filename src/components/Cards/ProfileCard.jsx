import React, { useCallback, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

export const ProfileCard = React.memo(function ProfileCard({ profile }) {
    const images = profile.images || [];
    const [photoIdx, setPhotoIdx] = useState(0);
    const lastIdx = images.length - 1;
  
    const onSwipeLeft = useCallback(() => {
      setPhotoIdx(idx => Math.min(idx + 1, lastIdx));
    }, [lastIdx]);
  
    const onSwipeRight = useCallback(() => {
      setPhotoIdx(idx => Math.max(idx - 1, 0));
    }, []);
  
    const handlers = useSwipeable({
      onSwipedLeft: onSwipeLeft,
      onSwipedRight: onSwipeRight,
      preventDefaultTouchmoveEvent: true,
      trackMouse: true,
    });
  
    if (images.length === 0) return null;
  
    return (
      <motion.div
        {...handlers}
        className="relative mx-4 mt-4 rounded-xl overflow-hidden shadow-lg"
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.97 }}
      >
        <img
          src={images[photoIdx]}
          alt={`${profile.name} photo ${photoIdx + 1}`}
          className="w-full h-96 object-cover"
        />
  
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${idx === photoIdx ? 'bg-white' : 'bg-white bg-opacity-50'}`}
            />
          ))}
        </div>
  
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {profile.name}, {profile.age}
              </h2>
              <p className="text-sm text-white opacity-75">Active 1hr ago</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-primary rounded-full">
                <FiMessageCircle size={16} color="#fff" />
              </button>
              <button className="p-2 bg-primary rounded-full">
                <FiUserPlus size={16} color="#fff" />
              </button>
            </div>
          </div>
  
          <p className="mt-2 text-white italic text-sm">“{profile.about}”</p>
  
          <div className="flex items-center space-x-2 mt-2">
            <span className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
              <FaVenus size={12} className="text-gray-800" />
              <span className="text-gray-800">{profile.gender}</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
              <FaStar size={12} className="text-yellow-400" />
              <span className="text-gray-800">{profile.top}</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
              <RxHeart size={12} className="text-red-500" />
              <span className="text-gray-800">{profile.compatibility}%</span>
            </span>
          </div>
  
          <div className="flex items-center text-white text-sm mt-2">
            <HiOutlineLocationMarker className="mr-1" />
            <span>{profile.distance}</span>
          </div>
        </div>
      </motion.div>
    );
  });