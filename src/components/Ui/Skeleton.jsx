// src/components/Ui/SkeletonLoader.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonLoader({ count = 1, height = 20, width = '100%', circle = false, className = '' }) {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      circle={circle}
      className={className}
    />
  );
}
