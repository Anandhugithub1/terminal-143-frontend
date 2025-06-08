// src/features/Explore/components/ExploreFilterBar.jsx
import React, {    memo } from 'react';

import { FunnelIcon } from '@heroicons/react/24/outline';


  // Filter button component
   const FilterButton = memo(({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  ));

export default function ExploreFilterBar({ activeFilter, onFilterChange }) {
  const filters = ['All', 'Nearby', 'Popular', 'New'];

  return (
    <div className="sticky top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm px-4 py-3 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          {/* Icon should be passed optionally or moved inside parent if needed */}
          Explore
        </h1>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((filter) => (
          <FilterButton 
            key={filter}
            active={activeFilter === filter}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}
