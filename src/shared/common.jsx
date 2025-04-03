import React from 'react';
import { memo } from 'react';
import { AiFillHome, AiOutlineSearch, AiOutlineMessage, AiOutlineHeart, AiOutlineUser } from 'react-icons/ai';

export const InputField = ({ type = 'text', value, onChange, placeholder, inputProps = {} }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...inputProps}
      className="w-full px-4 py-3 rounded-xl border border-border-clr focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
      required
    />
  );
};



export const BottomNav = memo(() => (
  <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-t border-gray-200">
    <div className="max-w-md mx-auto h-16 px-4 flex items-center">
      <div className="grid grid-cols-5 w-full text-center">
        {[
          { label: 'Home', icon: <AiFillHome className="w-5 h-5 mb-1" />, color: 'text-pink-600' },
          { label: 'Search', icon: <AiOutlineSearch className="w-5 h-5 mb-1" />, color: 'text-gray-500' },
          { label: 'Messages', icon: <AiOutlineMessage className="w-5 h-5 mb-1" />, color: 'text-gray-500' },
          { label: 'Favorites', icon: <AiOutlineHeart className="w-5 h-5 mb-1" />, color: 'text-gray-500' },
          { label: 'Profile', icon: <AiOutlineUser className="w-5 h-5 mb-1" />, color: 'text-gray-500' }
        ].map(({ label, icon, color }) => (
          <button key={label} className={`flex flex-col items-center ${color} font-semibold`}>
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  </nav>
));