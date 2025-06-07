// src/pages/ExplorePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfiles } from '../../features/Profiles';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';
import { HeartIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/outline';

export default function ExplorePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const preferences = useMemo(() => ['F'], []);
  const [activeFilters, setActiveFilters] = useState(['All']);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences }));
    }
  }, [status, dispatch, preferences]);

  const handleRefresh = () => window.location.reload();

  const toggleFilter = (filter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (status === 'loading') return <LoadingSpinner />;

  const isEmpty = profiles.length === 0;

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      {/* Filter bar only (more modern look, no heading/subheading) */}
      <div className="sticky top-16 z-10 bg-white px-4 py-3 border-b">
        <div className="flex overflow-x-auto space-x-3 scrollbar-hide">
          {['All', 'Nearby', 'Popular', 'New', 'Verified'].map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition ${
                activeFilters.includes(filter)
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles grid */}
      <div className="px-2 pt-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <p className="text-lg mb-4">No profiles available</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-pink-500 text-white rounded-full shadow hover:bg-pink-600 transition"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {profiles.map((profile) => {
              const firstImage =
                profile.images?.length > 0 ? profile.images[0] : placeholderImage;
              return (
                <Link
                  to={`/profile/${profile.userId}`}
                  key={profile.userId}
                  className="break-inside-avoid relative group"
                >
                  <div className="overflow-hidden rounded-xl aspect-[3/4] relative">
                    <img
                      src={firstImage}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Profile overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {profile.name || 'Unnamed'}
                            {profile.age && `, ${profile.age}`}
                          </h3>
                          {profile.location && (
                            <div className="flex items-center text-white/90 text-sm">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                        </div>
                        <button
                          className="text-white bg-pink-500 rounded-full p-2 hover:bg-pink-600 transition"
                          onClick={(e) => {
                            e.preventDefault();
                            // Handle like functionality
                          }}
                        >
                          <HeartIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Online status indicator */}
                    {profile.online && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
