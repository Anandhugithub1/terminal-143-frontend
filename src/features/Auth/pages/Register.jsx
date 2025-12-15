import React, { useEffect, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const RegisterForm = lazy(() => import('../components/RegisterForm'));

const RegisterSkeleton = () => (
  <div className="space-y-4">
    <Skeleton height={40} />
    <Skeleton height={45} />
    <Skeleton height={45} />
    <Skeleton height={20} width={120} />
    <Skeleton height={45} />
    <Skeleton height={45} />
    <Skeleton height={20} width={200} />
    <Skeleton height={45} />
  </div>
);

 const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.state?.userType;



  if (!userType) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            {/* Logo or Icon */}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Find Your Match
        </h1>

        <Suspense fallback={<RegisterSkeleton />}>
          <RegisterForm />
        </Suspense>

        {/* <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div> */}
      </div>
    </div>
  );
};


export default Register