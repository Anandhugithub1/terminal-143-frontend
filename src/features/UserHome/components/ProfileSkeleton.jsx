import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProfileSkeleton() {
  return (
    <div className="bg-white min-h-[100dvh] p-4">
      <Skeleton height={400} borderRadius={16} />
      <div className="mt-4 space-y-2">
        <Skeleton height={20} width="80%" />
        <Skeleton height={20} width="60%" />
      </div>
    </div>
  );
}
