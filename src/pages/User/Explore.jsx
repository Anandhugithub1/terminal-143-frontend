// src/pages/ExplorePage.jsx
import React, { useEffect,  useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfiles,
} from '../../features/Profiles';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';

export default function ExplorePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const preferences = useMemo(() => ['F'], []);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences }));
    }
  }, [status, dispatch, preferences]);

  const handleRefresh = () => window.location.reload();

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (status === 'loading') return <LoadingSpinner />;

  const isEmpty = profiles.length === 0;

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-xl font-semibold mb-4">Explore</h1>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <p className="text-lg mb-4">No profiles available</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-full shadow"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {profiles.map((profile) => {
              const firstImage =
                profile.images?.length > 0 ? profile.images[0] : placeholderImage;
              return (
                <div
                  key={profile.userId}
                  className="break-inside-avoid overflow-hidden rounded-lg border border-gray-200 shadow hover:shadow-md transition"
                >
                  <img
                    src={firstImage}
                    alt={profile.name}
                    className="w-full object-cover aspect-[3/4]"
                  />
                  <div className="p-2 text-center text-gray-800 font-medium">
                    {profile.name || 'Unnamed'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
