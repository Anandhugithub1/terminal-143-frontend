import React, { Suspense, lazy } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoginForm = lazy(() => import('../components/LoginForm'));

export const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
};

// Optional: Skeleton fallback component
const LoginSkeleton = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton circle width={50} height={50} />
        </div>
        <Skeleton height={30} width={200} className="mx-auto" />
        <Skeleton height={45} />
        <Skeleton height={45} />
        <Skeleton width={120} height={20} className="ml-auto" />
        <Skeleton height={45} />
        <div className="flex items-center space-x-2 w-full">
          <div className="flex-1"><Skeleton height={1} /></div>
          <Skeleton height={10} width={80} />
          <div className="flex-1"><Skeleton height={1} /></div>
        </div>
        <Skeleton height={20} width={240} className="mx-auto" />
      </div>
    );
  };
  