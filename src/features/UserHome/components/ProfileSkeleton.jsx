import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';

// Mirrors PageLayout > ProfileCard (tall photo card) + ProfileTabs used by
// UserProfileById/PublicProfile so the skeleton doesn't jump when real
// content swaps in.
export default function ProfileSkeleton() {
  return (
    <div className="min-h-[100dvh] pb-20 flex flex-col bg-white">
      <TopNav />

      <div className="mx-5 mt-3 rounded-3xl overflow-hidden relative h-[55vh] sm:h-[60vh] md:h-[65vh]">
        <Skeleton height="100%" className="!block" />
      </div>

      <div className="mt-4 px-4 space-y-3">
        <Skeleton width="40%" height={18} />
        <Skeleton count={3} height={12} />
      </div>

      <BottomNav />
    </div>
  );
}
