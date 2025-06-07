import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfiles,
  resetStatus as resetProfilesStatus,
} from '../../features/Profiles';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const [idx, setIdx] = useState(0);
  const [requestError, setRequestError] = useState('');
  const preferences = useMemo(() => ['F'], []);

  // Only fetch once when status is 'idle'
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences }));
    }
  }, [status, dispatch, preferences]);

  // Check if we've reached the end of the profiles
  const isEnd = profiles.length > 0 && idx >= profiles.length;

  // Refresh handler resets status then fetches new profiles
  const handleRefresh = () => {
    // full page reload to get fresh data
    window.location.reload();
  };

  // If error fetching profiles
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Loading state
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // End-of-profiles state
  if (isEnd) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">Reached the end of profiles</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full shadow"
        >
          Refresh Profiles
        </button>
      </div>
    );
  }

  // Build current profile
  const rawProfile = profiles[idx] || {};
  const images = rawProfile.images && rawProfile.images.length > 0
    ? rawProfile.images
    : [placeholderImage];
  const profile = { ...rawProfile, images };

  // Connect handler (to be implemented)
  const handleConnect = async (userId) => {
    // TODO: implement connect logic
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />

      {requestError && (
        <div className="px-4 mt-4">
          <AlertMessage
            message={requestError}
            type="error"
            isVisible={!!requestError}
            onClose={() => setRequestError('')}
          />
        </div>
      )}

      <ProfileCard
        profile={profile}
        placeholderImage={placeholderImage}
        onConnectClick={() => handleConnect(profile.userId)}
        onMessageClick={() => console.log('Message clicked for', profile.name)}
      />

      <ActionControls
        onReject={() => setIdx((i) => Math.min(i + 1, profiles.length))}
        onRefresh={handleRefresh}
        onLike={() => setIdx((i) => Math.min(i + 1, profiles.length))}
      />

      <DetailSection profile={profile} />
      <BottomNav />
    </div>
  );
}
