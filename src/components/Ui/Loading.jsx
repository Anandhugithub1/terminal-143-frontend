import React from 'react';

const Loading = ({ size = 16, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>      
      <div
        className="animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-gray-500"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Loading;
