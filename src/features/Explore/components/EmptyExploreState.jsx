// src/features/Explore/components/EmptyExploreState.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton'; // assuming you're using this in your skeleton
import 'react-loading-skeleton/dist/skeleton.css';

export default function EmptyExploreState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center mt-12 text-center">
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-6 mb-6">
        <Skeleton circle width={64} height={64} />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">No profiles found</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Try adjusting your filters or refreshing the list
      </p>
      <button
        onClick={onRefresh}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Refresh Profiles
      </button>
    </div>
  );
}
