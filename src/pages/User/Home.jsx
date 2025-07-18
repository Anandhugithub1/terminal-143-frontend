/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { fetchProfiles, postSeen } from '../../features/Profiles';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import { useSendMatchRequest } from '../../Hooks/sendMatchRequest';
import placeholderImage from '../../assets/woman.png';
import ProfileSkeleton from '../../components/User_Home/ProfileSkeleton';
import SwipeDeck from '../../components/User_Home/SwipeDeck';

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles, shallowEqual);

  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [requestError, setRequestError] = useState('');

  const {
    send: sendMatchRequest,
    isSending,
    error: sendError,
    profileLoading,
  } = useSendMatchRequest();

  const seenMutation = useMutation({
    mutationFn: postSeen,
    onError: (err) => {
      setRequestError(err.response?.data?.error || err.message);
    },
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ limit: 10 }));
    }
  }, [status, dispatch]);

  const isEnd = profiles.length > 0 && idx >= profiles.length;

  const handleRefresh = useCallback(() => {
    setIdx(0);
    dispatch(fetchProfiles({ limit: 10 }));
  }, [dispatch]);

  const advance = useCallback(
    (dir) => {
      const current = profiles[idx];
      if (!current) return;

      seenMutation.mutate({ suggestionIndex: current.suggestionIndex, direction: dir });

    

      setDirection(dir);
      setIdx((prev) => {
        const next = prev + 1;
        if (next >= profiles.length) {
          dispatch(fetchProfiles({ limit: 10 }));
        }
        return next;
      });
    },
    [idx, profiles, dispatch, seenMutation, profileLoading, sendMatchRequest]
  );

  if (status === 'loading') return <ProfileSkeleton />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

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

  const rawProfile = profiles[idx] || {};
  const images = rawProfile.photos?.length ? rawProfile.photos : [placeholderImage];

  const profile = {
    name: rawProfile.name || 'Unknown',
    age: rawProfile.age || 'N/A',
    about: rawProfile.bio || '',
    gender:
      rawProfile.gender === 'F'
        ? 'Female'
        : rawProfile.gender === 'M'
        ? 'Male'
        : rawProfile.gender,
    images,
    location: rawProfile.location || 'Unknown',
    popularity: rawProfile.popularity || 0,
    healthStatus: rawProfile.healthStatus || { status: 'Unknown', lastTestedDate: 'Unknown' },
    lastSeen: rawProfile.lastSeen || 'Unknown',
    job: rawProfile.jobTitle || '',
    languages: rawProfile.languagesKnown?.length
      ? rawProfile.languagesKnown
      : rawProfile.language
      ? [rawProfile.language]
      : [],
    interests: rawProfile.interest || [],
    userId: rawProfile.username,
    suggestionIndex: rawProfile.suggestionIndex,
  };

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      {requestError && (
        <div className="px-4 mt-4">
          <AlertMessage
            message={requestError}
            type="error"
            isVisible
            onClose={() => setRequestError('')}
          />
        </div>
      )}

      

<SwipeDeck
  idx={idx}
  direction={direction}
  profilesLength={profiles.length}
  onAdvance={advance}
  onRightSwipe={() => {
    console.log('Swiped right!'); // 🧪 Test log
console.log('Sending match request for:', profile.userId);
    if (!profileLoading && profile.userId) {
      sendMatchRequest(profile.userId);
    }
  }}
>

        <ProfileCard
          profile={profile}
          placeholderImage={placeholderImage}
          onConnectClick={() => {}}
          onMessageClick={() => console.log('Message clicked')}
        />

        <ActionControls
          className="fixed bottom-32 inset-x-0"
          onReject={() => advance(-1)}
          onRefresh={handleRefresh}
          onLike={() => advance(1)}
        />

        <DetailSection profile={profile} />
      </SwipeDeck>

      

      <BottomNav />
    </div>
  );
}
