import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/Button';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-3 rounded-full">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 7v.01"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Coming Soon
        </h1>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you this feature. Stay tuned!
        </p>
        <Link to="/home">
          <Button>
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
