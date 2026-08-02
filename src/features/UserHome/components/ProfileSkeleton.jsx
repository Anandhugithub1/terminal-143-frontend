import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';

// Mirrors PageLayout > ProfileCard (tall photo card) + ProfileTabs used by
// UserProfileById/PublicProfile so the skeleton doesn't jump when real
// content swaps in.
export function ProfileSkeletonContent() {
  return (
    <>
      <div className="mx-5 mt-3 rounded-3xl overflow-hidden relative h-[55vh] sm:h-[60vh] md:h-[65vh]">
        <Skeleton height="100%" className="!block" />
      </div>

      <div className="mt-4 px-4 space-y-3">
        <Skeleton width="40%" height={18} />
        <Skeleton count={3} height={12} />
      </div>
    </>
  );
}

// Full-page variant — carries its own TopNav/BottomNav for call sites that
// render this BEFORE any PageLayout has mounted (e.g. UserProfileById's
// `if (isLoading) return <ProfileSkeleton />` swaps out the whole page).
// Do NOT nest this inside an already-mounted PageLayout — that renders two
// nav bars stacked on top of each other. Use ProfileSkeletonContent instead
// for a loading state that lives inside PageLayout's children (see Home.jsx).
export default function ProfileSkeleton() {
  return (
    <div className="min-h-[100dvh] pb-20 flex flex-col bg-white">
      <TopNav />
      <ProfileSkeletonContent />
      <BottomNav />
    </div>
  );
}
