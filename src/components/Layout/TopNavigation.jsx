import React, { useState } from 'react';
import { FiMenu, FiX, FiFilter, FiSettings, FiBell, } from 'react-icons/fi';
import Logo from '../../assets/images/logo.png';
import { CgProfile } from 'react-icons/cg';

const TopNav = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  return (
    <>
      {/* Top navigation with drawer icon and logo grouped */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        {/* Left group: drawer toggle + logo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDrawer}
            aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {isDrawerOpen ? (
              <FiX size={20} className="text-gray-600 hover:text-gray-900" />
            ) : (
              <FiMenu size={20} className="text-gray-600 hover:text-gray-900" />
            )}
          </button>
          <img
            src={Logo}
            alt="Logo"
            className="h-13 object-contain"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <FiFilter size={20} className="text-gray-600 hover:text-gray-900" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <FiSettings size={20} className="text-gray-600 hover:text-gray-900" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative">
            <FiBell size={20} className="text-gray-600 hover:text-gray-900" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Drawer panel without backdrop overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-y-0 left-0 z-50">
          <div className="w-64 h-full bg-white shadow-lg p-4">
            <div className="flex justify-end mb-4">
              <button onClick={toggleDrawer} aria-label="Close menu">
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>
            <nav className="flex flex-col space-y-3">
              {/* Mirror original actions in drawer */}
              {/* <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <FiFilter size={20} className="text-gray-600 hover:text-gray-900" />
                <span>Filter</span>
              </button> */}
              <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <CgProfile size={20} className="text-gray-600 hover:text-gray-900" />
                <span>Profile</span>
              </button>
              {/* <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative">
                <FiBell size={20} className="text-gray-600 hover:text-gray-900" />
                <span>Notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button> */}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNav;
