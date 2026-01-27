import React from 'react';
import { FiMenu, FiFilter, FiSettings, FiBell } from 'react-icons/fi';
import Logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useNotifications } from "../../features/Notifications/Hooks/useNotifications"
import { useMemo } from "react"

const TopNav = () => {
  const { data } = useNotifications()

const hasNotifications = useMemo(() => {
  const items = data?.pages?.flatMap(p => p.items) || []
  return items.length > 0
}, [data])

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <div className="flex items-center space-x-2">
      <Link to='/'> 
        <img
          src={Logo}
          alt="Logo"
          className="h-13 object-contain"
        />
      </Link>
      </div>

      {/* Right actions */}

      <div className="flex items-center space-x-3">
        {/* <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <FiFilter size={20} className="text-gray-600 hover:text-gray-900" />
        </button> */}
        <Link to="/settings" className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <FiSettings size={20} className="text-gray-600 hover:text-gray-900" />
        </Link> 
<Link
  to="/notifications"
  className="relative p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200"
>
  <FiBell size={20} className="text-gray-600 hover:text-gray-900" />

  {hasNotifications && (
    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
  )}
</Link>




        {/* <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative">
          <FiBell size={20} className="text-gray-600 hover:text-gray-900" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button> */}
      </div>
    </div>
  );
};

export default TopNav;
