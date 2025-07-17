// src/pages/UserHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { fetchProfiles } from '../../features/Profiles';
import { postSeen } from '../../features/Profiles/profilesapi';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import placeholderImage from '../../assets/woman.png';
import ProfileSkeleton from '../../components/User_Home/ProfileSkeleton';
import SwipeDeck from '../../components/User_Home/SwipeDeck';

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector(
    (state) => state.profiles,
    shallowEqual
  );

  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [requestError, setRequestError] = useState('');

  // React Query mutation for recordSeen using axios helper
  const seenMutation = useMutation(postSeen, {
    onError: (err) => {
      setRequestError(err.response?.data?.error || err.message);
    },
  });

  // Initial fetch
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

  // advance by ±1 on swipe or button, record 'seen'
  const advance = useCallback(
    (dir) => {
      const current = profiles[idx];
      if (current) {
        seenMutation.mutate({ profilePk: current.pk, profileSk: current.sk, direction: dir });
      }
      setDirection(dir);
      setIdx((i) => {
        const next = i + 1;
        if (next >= profiles.length) {
          dispatch(fetchProfiles({ limit: 10 }));
        }
        return next;
      });
    },
    [dispatch, idx, profiles, seenMutation]
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
    gender: rawProfile.gender === 'F' ? 'Female' : rawProfile.gender === 'M' ? 'Male' : rawProfile.gender,
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
