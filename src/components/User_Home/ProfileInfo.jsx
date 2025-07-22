
import React, { memo, } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiUserPlus } from 'react-icons/fi';
import { FaStar, FaVenus } from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { RxHeart } from 'react-icons/rx';

// A simple badge component for profile attributes
export const Badge = memo(({ icon, label, iconClass = 'text-gray-800' }) => (
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



export const ProfileInfo = memo(({
  name,
  age,
  lastSeen,
  
  gender,
  distance,
  // onMessageClick,
  // onConnectClick,
}) => (
  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-transparent text-white">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">{name}, {age}</h2>
        <p className="text-sm opacity-75"> {lastSeen}</p>
      </div>
      <div className="flex space-x-2">
        {/* <button
          aria-label="Message"
          className="p-2 bg-primary rounded-full"
          onClick={onMessageClick}
        >
          <FiMessageCircle size={16} />
        </button>
        <button
          aria-label="Connect"
          className="p-2 bg-primary rounded-full"
          onClick={onConnectClick}
        >
          <FiUserPlus size={16} />
        </button> */}
      </div>
    </div>

    {/* {about && <p className="mt-2 italic text-sm">“{about}”</p>} */}

    <div className="flex items-center space-x-2 mt-2">
      <Badge icon={<FaVenus size={12} />} label={gender} />
    
    </div>

    <div className="flex items-center text-sm mt-2">
      <HiOutlineLocationMarker className="mr-1" />
      <span>{distance}</span>
    </div>
  </div>
));

ProfileInfo.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lastSeen: PropTypes.string.isRequired,
  about: PropTypes.string,
  gender: PropTypes.string.isRequired,
  top: PropTypes.string,
  compatibility: PropTypes.number.isRequired,
  distance: PropTypes.string.isRequired,
  onMessageClick: PropTypes.func.isRequired,
  onConnectClick: PropTypes.func.isRequired,
};