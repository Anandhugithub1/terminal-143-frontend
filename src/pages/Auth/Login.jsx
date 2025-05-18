import React from 'react';
import { LoginForm } from '../../features/Auth/components/LoginForm';

export const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative">
        <LoginForm />
      </div>
    </div>
  );
};