import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles } from '../../features/Profiles';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import { LoadingSpinner } from '../../components/Ui/Spinner';
import placeholderImage from '../../assets/woman.png';
import { useSwipeable } from 'react-swipeable';
import { motion, useAnimation } from 'framer-motion';

const SWIPE_THRESHOLD = 100;

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const [idx, setIdx] = useState(0);
  const [requestError, setRequestError] = useState('');
  const preferences = useMemo(() => ['F'], []);
  const controls = useAnimation();
  const swipeRef = useRef();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences }));
    }
  }, [status, dispatch, preferences]);

  const isEnd = profiles.length > 0 && idx >= profiles.length;

  const handleRefresh = () => window.location.reload();
  const handleConnect = async (userId) => {/* TODO */};

  const handleSwipe = async (deltaX) => {
    if (deltaX > SWIPE_THRESHOLD) {
      await controls.start({ x: 500, opacity: 0 });
      setIdx((i) => Math.min(i + 1, profiles.length));
    } else if (deltaX < -SWIPE_THRESHOLD) {
      await controls.start({ x: -500, opacity: 0 });
      setIdx((i) => Math.min(i + 1, profiles.length));
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiped: ({ deltaX }) => handleSwipe(deltaX),
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (status === 'loading') return <LoadingSpinner />;

  if (isEnd) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">Reached the end of profiles</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full shadow"
        >Refresh Profiles</button>
      </div>
    );
  }

  const rawProfile = profiles[idx] || {};
  const images = rawProfile.images?.length > 0 ? rawProfile.images : [placeholderImage];
  const profile = { ...rawProfile, images };

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      {requestError && (
        <div className="px-4 mt-4">
          <AlertMessage message={requestError} type="error" isVisible onClose={() => setRequestError('')} />
        </div>
      )}

      {/* Full Profile Swipeable Section */}
      <motion.div
        {...swipeHandlers}
        animate={controls}
        initial={{ x: 0, opacity: 1 }}
        className="relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => handleSwipe(info.offset.x)}
        ref={swipeRef}
      >
        <ProfileCard
          profile={profile}
          placeholderImage={placeholderImage}
          onConnectClick={() => handleConnect(profile.userId)}
          onMessageClick={() => console.log('Message clicked')}
        />

        <ActionControls
          className="fixed bottom-32 inset-x-0"
          onReject={() => setIdx(i => Math.min(i + 1, profiles.length))}
          onRefresh={handleRefresh}
          onLike={() => setIdx(i => Math.min(i + 1, profiles.length))}
        />

        <DetailSection profile={profile} />
      </motion.div>

      <BottomNav />
    </div>
  );
}
