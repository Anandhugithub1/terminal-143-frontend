// src/pages/ExplorePage.jsx
import React, { useEffect, useMemo, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfiles } from '../../features/Profiles';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';
import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Memoized ProfileCard for performance
const ProfileCard = memo(({ profile }) => {
  const firstImage = profile.images?.[0] || placeholderImage;
  return (
    <Link
      to={`/profile/${profile.userId}`}
      className="group block mb-4 break-inside-avoid rounded-lg overflow-hidden shadow hover:shadow-lg transition"
    >
      <div className="relative">
        <img
          src={firstImage}
          alt={profile.name}
          className="w-full h-auto object-cover"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <h3 className="text-white font-semibold text-base">
            {profile.name || 'Unnamed'}{profile.age && `, ${profile.age}`}
          </h3>
          {profile.location && (
            <div className="flex items-center text-white text-xs mt-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Like & online */}
        <button
          className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow hover:shadow-md transition opacity-0 group-hover:opacity-100"
          onClick={(e) => e.preventDefault()}
        >
          <HeartIcon className="h-5 w-5 text-gray-800" />
        </button>
        {profile.online && (
          <span className="absolute top-3 left-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>
    </Link>
  );
});

export default function ExplorePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const preferences = useMemo(() => ['F'], []);
  const [activeFilters, setActiveFilters] = useState(['All']);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProfiles({ preferences }));
  }, [status, dispatch, preferences]);

  const handleRefresh = () => dispatch(fetchProfiles({ preferences }));

  const toggleFilter = (filter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (status === 'loading') return <LoadingSpinner />;

  const isEmpty = profiles.length === 0;

  return (
    <div className="relative bg-gray-50 min-h-screen pb-20">
      <TopNav />

      {/* Filter bar */}
      <div className="sticky top-16 left-0 right-0 z-10 bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start overflow-x-auto scrollbar-hide">
          {['All', 'Nearby', 'Popular', 'New'].map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${
                activeFilters.includes(filter)
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles: columns on mobile, grid on desktop */}
      <div className="px-4 pt-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center mt-24 text-gray-500">
            <p className="text-lg mb-6">No profiles available</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-white text-gray-800 rounded-full shadow hover:shadow-md transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4 md:columns-none md:grid md:grid-cols-4 md:gap-4 md:space-y-0">
            {profiles.map((profile) => (
              <ProfileCard key={profile.userId} profile={profile} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
