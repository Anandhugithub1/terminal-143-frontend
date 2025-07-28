// src/components/Ui/LazyFallback.jsx
import React from 'react';
import SkeletonLoader from './Skeleton';

export default function LazyFallback() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonLoader height={30} width="50%" />
      <SkeletonLoader height={20} count={5} />
    </div>
  );
}
