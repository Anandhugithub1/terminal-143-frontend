// src/pages/ExplorePage.jsx
import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfiles } from '../../features/Profiles';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';
import { 
  HeartIcon, 
  MapPinIcon, 
  FunnelIcon, 
  ArrowsPointingOutIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Memoized ProfileCard
const ProfileCard = memo(({ profile }) => {
  const firstImage = profile.images?.[0] || placeholderImage;
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <Link
      to={`/profile/${profile.userId}`}
      className="group block mb-4 break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4]">
        {!imageLoaded && (
          <Skeleton 
            className="absolute inset-0 !rounded-xl" 
            containerClassName="absolute inset-0"
          />
        )}
        <img
          src={firstImage}
          alt={profile.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <h3 className="text-white font-bold text-lg truncate">
            {profile.name || 'Unnamed'}{profile.age && `, ${profile.age}`}
          </h3>
          {profile.location && (
            <div className="flex items-center text-gray-200 text-sm mt-1">
              <MapPinIcon className="h-4 w-4 mr-1 text-gray-300" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Like button */}
        <button
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          onClick={(e) => e.preventDefault()}
        >
          <HeartIcon className="h-5 w-5 text-rose-500" />
        </button>
        
        {/* Online status */}
        {profile.online && (
          <span className="absolute top-3 left-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
        )}
        
        {/* Popular badge */}
        {profile.popular && (
          <span className="absolute bottom-3 left-3 flex items-center bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Popular
          </span>
        )}
      </div>
    </Link>
  );
});

// Skeleton loader using react-loading-skeleton
const ProfileCardSkeleton = memo(() => (
  <div className="mb-4 break-inside-avoid rounded-xl overflow-hidden">
    <div className="relative aspect-[3/4]">
      <Skeleton 
        className="!rounded-xl h-full" 
        containerClassName="absolute inset-0"
      />
    </div>
    <div className="pt-3">
      <Skeleton width="70%" height={20} />
      <Skeleton width="40%" height={16} className="mt-2" />
    </div>
  </div>
));

// Filter button component
const FilterButton = memo(({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 ${
      active
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
));

export default function ExplorePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const preferences = useMemo(() => ['F'], []);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  // Memoized filtered profiles
  const filteredProfiles = useMemo(() => {
    if (activeFilter === 'All') return profiles;
    
    return profiles.filter(profile => {
      if (activeFilter === 'Nearby') return profile.distance < 50;
      if (activeFilter === 'Popular') return profile.popular;
      if (activeFilter === 'New') return profile.isNew;
      return true;
    });
  }, [profiles, activeFilter]);

  const fetchData = useCallback(async () => {
    await dispatch(fetchProfiles({ preferences }));
    setRefreshing(false);
  }, [dispatch, preferences]);

  useEffect(() => {
    if (status === 'idle') fetchData();
  }, [status, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 font-medium mb-4">Error: {error}</div>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center mx-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = filteredProfiles.length === 0;

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Top navigation */}
      <TopNav />
      
      {/* Sticky header */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm px-4 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ArrowsPointingOutIcon className="h-6 w-6 mr-2 text-indigo-500" />
            Explore
          </h1>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', 'Nearby', 'Popular', 'New'].map((filter) => (
            <FilterButton 
              key={filter}
              active={activeFilter === filter}
              onClick={() => handleFilterChange(filter)}
            >
              {filter}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="pt-4 px-4 pb-24">
        {status === 'loading' && !refreshing ? (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4 md:columns-none md:grid md:grid-cols-4 md:gap-4 md:space-y-0">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProfileCardSkeleton key={idx} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center mt-12 text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-6 mb-6">
              <Skeleton circle width={64} height={64} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No profiles found</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Try adjusting your filters or refreshing the list
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh Profiles
            </button>
          </div>
        ) : (
          <>
            {refreshing && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
                <LoadingSpinner size="md" />
              </div>
            )}
            <div 
              className={`columns-2 sm:columns-3 gap-4 space-y-4 md:columns-none md:grid md:grid-cols-4 md:gap-4 md:space-y-0 transition-opacity ${
                refreshing ? 'opacity-70' : 'opacity-100'
              }`}
            >
              {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.userId} profile={profile} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}