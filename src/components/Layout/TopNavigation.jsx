import { FiFilter, FiSettings, FiBell, FiMessageCircle, FiSearch } from 'react-icons/fi';
import React from 'react'

const TopNav = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-300 rounded-full transition-all duration-200 hover:bg-gray-400" />
        <span className="font-bold text-gray-800 tracking-tight">LOGO</span>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <FiFilter size={20} className="text-gray-600 hover:text-gray-900" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <FiSettings size={20} className="text-gray-600 hover:text-gray-900" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative">
          <FiBell size={20} className="text-gray-600 hover:text-gray-900" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </div>
  )
}

export default TopNav