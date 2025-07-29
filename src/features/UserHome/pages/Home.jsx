/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { fetchProfiles, postSeen } from '../../../features/Profiles';
import ProfileCard from '../components/Cards/ProfileCard';
import BottomNav from '../../../components/Layout/BottomNavigation';
import TopNav from '../../../components/Layout/TopNavigation';
import DetailSection from '../components/Details/Details';
import ActionControls from '../components/Actions/ActionControls';
import AlertMessage from '../../../components/Ui/Alerts';
import { useSendMatchRequest } from '../../../Hooks/sendMatchRequest';
import placeholderImage from '../../../assets/woman.png';
import ProfileSkeleton from '../components/ProfileSkeleton';
import SwipeDeck from '../components/Actions/SwipeDeck';


export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector(
    (state) => state.profiles,
    shallowEqual
  );

  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [requestError, setRequestError] = useState('');

  const { send: sendMatchRequest, isSending, error: sendError, profileLoading } =
    useSendMatchRequest();

  const seenMutation = useMutation({
    mutationFn: postSeen,
    onError: (err) => {
      setRequestError(err.response?.data?.error || err.message);
    },
  });

  // Initial load
  useEffect(() => {
    if (status === 'idle') dispatch(fetchProfiles({ limit: 10 }));
  }, [status, dispatch]);

  const isEnd = profiles.length > 0 && idx >= profiles.length;

  const handleRefresh = useCallback(() => {
    setIdx(0);
    dispatch(fetchProfiles({ limit: 10 }));
  }, [dispatch]);

  // Advance (swipe or manual), record seen & optionally match
  const advance = useCallback(
    (dir) => {
      console.log('🛠 advance() called dir:', dir, 'idx:', idx);
      setDirection(dir);
      setIdx((prev) => {
        const current = profiles[prev];
        console.log('  ↪️ current profile:', current);
  
        if (current) {
          seenMutation.mutate({
            suggestionIndex: current.suggestionIndex,
            direction: dir,
          });
  
          // ALWAYS send match if we have an ID
          const recipientId = current.username || current.pk || current.id;
          if (dir === 1 && recipientId) {
            console.log('➡️ Sending match request for:', recipientId);
            sendMatchRequest(recipientId);
          } else {
            console.log('  ↪️ No recipientId found, skipping match');
          }
        }
  
        const next = prev + 1;
        if (next >= profiles.length) {
          dispatch(fetchProfiles({ limit: 10 }));
        }
        return next;
      });
    },
    [idx, profiles, dispatch, seenMutation, sendMatchRequest]
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
  
      <div className="relative">
      <SwipeDeck idx={idx} direction={direction} profilesLength={profiles.length} onAdvance={advance}>
  <div className="relative">
    <ProfileCard
      profile={profile}
      placeholderImage={placeholderImage}
      onConnectClick={() => {}}
      onMessageClick={() => console.log('Message clicked')}
    />

    {/* Floating buttons, not too low */}
    <ActionControls
      className="absolute top-[85%] inset-x-0 z-30 flex justify-center"

      onReject={() => advance(-1)}
      onRefresh={handleRefresh}
      onLike={() => advance(1)}
    />
  </div>

  {/* Profile info */}
  <div className="mt-6 px-4">
    <DetailSection profile={profile} />
  </div>
</SwipeDeck>

      </div>
  
      <BottomNav />
    </div>
  );
  
  
}
