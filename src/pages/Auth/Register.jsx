// src/pages/Register.jsx
import React from 'react';
import { RegisterForm } from '../../features/Auth/components/RegisterForm';

export const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        {/* You can put a logo or illustration here */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            {/* e.g. an icon or logo circle */}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Find Your Match
        </h1>

        <RegisterForm />

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div>

      </div>
    </div>
  );
};
