import React, { useState } from 'react';
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineHeart,
  AiFillHeart,
} from 'react-icons/ai';
import { FiSearch, FiMessageSquare } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { RiUserLine, RiUserFill } from 'react-icons/ri';

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const tabs = [
    { 
      name: 'Home', 
      icon: activeTab === 'Home' ? <AiFillHome size="1.4em" /> : <AiOutlineHome size="1.4em" /> 
    },
    { 
      name: 'Search', 
      icon: <FiSearch size="1.4em" />
    },
    { 
      name: 'Messages', 
      icon: <FiMessageSquare size="1.4em" />
    },
    { 
      name: 'Favorites', 
      icon: activeTab === 'Favorites' ? <AiFillHeart size="1.4em" /> : <AiOutlineHeart size="1.4em" /> 
    },
    { 
      name: 'Profile', 
      icon: activeTab === 'Profile' ? <RiUserFill size="1.4em" /> : <RiUserLine size="1.4em" /> 
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 shadow-lg">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              activeTab === tab.name ? 'text-text-pr' : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={tab.name}
          >
            <div className="transition-transform duration-200 ease-in-out">
              {tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.name}</span>
            {activeTab === tab.name && (
              <div className="w-4 h-1 bg-primary rounded-full mt-1 animate-bounce-indicator" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;