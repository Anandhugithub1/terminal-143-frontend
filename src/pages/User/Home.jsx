/* ========== UserHomePage.jsx ========== */
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
      dispatch(fetchProfiles({ preferences,  }));
    }
  }, [status, dispatch, preferences,]);

  // Grab the raw profile (which already has an `images` array from the slice)
  const rawProfile = profiles[idx] || {};

  // Build a guaranteed "images" array (fallback to one placeholder if empty)
  const images =
    rawProfile.images && rawProfile.images.length > 0
      ? rawProfile.images
      : [placeholderImage];

  // Merge it back onto rawProfile so ProfileCard always sees `profile.images`
  const profile = { ...rawProfile, images };

  const handleConnect = async () => {
    // TODO: implement connect logic
  };

  // Refresh handler resets status to 'idle' before dispatching
  const handleRefresh = () => {
    if (status !== 'loading') {
      dispatch(resetProfilesStatus());
      dispatch(fetchProfiles({ preferences, userType }));
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

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
        onReject={() => setIdx((i) => Math.min(i + 1, profiles.length - 1))}
        onRefresh={handleRefresh}
        onLike={() => setIdx((i) => Math.min(i + 1, profiles.length - 1))}
      />

      <DetailSection profile={profile} />
      <BottomNav />
    </div>
  );
}
