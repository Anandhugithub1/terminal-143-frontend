import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { fetchProfiles } from '../../features/Profiles';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import placeholderImage from '../../assets/woman.png';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';

const SWIPE_THRESHOLD = 100;

// Wrap with React.memo, not framer-motion
const AnimatedCard = memo(({ idx, direction, children }) => (
  <motion.div
    key={idx}
    initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
    transition={{ duration: 0.35 }}
    style={{ willChange: 'transform, opacity' }}
    className="relative"
  >
    {children}
  </motion.div>
));

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector(
    (state) => state.profiles,
    shallowEqual
  );
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [requestError, setRequestError] = useState('');
  const preferences = useMemo(() => ['F'], []);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences }));
    }
  }, [status, dispatch, preferences]);

  const isEnd = profiles.length > 0 && idx >= profiles.length;

  const handleRefresh = useCallback(() => {
    setIdx(0);
    dispatch(fetchProfiles({ preferences }));
  }, [dispatch, preferences]);

  const onSwiped = useCallback(
    ({ deltaX }) => {
      if (deltaX > SWIPE_THRESHOLD) {
        setDirection(1);
        setIdx((i) => Math.min(i + 1, profiles.length));
      } else if (deltaX < -SWIPE_THRESHOLD) {
        setDirection(-1);
        setIdx((i) => Math.min(i + 1, profiles.length));
      }
    },
    [profiles.length]
  );

  const swipeHandlers = useSwipeable({
    onSwiped,
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  if (status === 'loading') {
    return (
      <div className="bg-white min-h-screen p-4">
        <TopNav />
        <div className="mt-8 mx-auto max-w-md">
          <Skeleton height={400} borderRadius={16} />
          <div className="mt-4 space-y-2">
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="60%" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

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
  const images = rawProfile.images?.length ? rawProfile.images : [placeholderImage];
  const profile = { ...rawProfile, images };

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

      <div className="relative" {...swipeHandlers}>
        <AnimatePresence initial={false} mode="wait">
          <AnimatedCard idx={idx} direction={direction}>
            <ProfileCard
              profile={profile}
              placeholderImage={placeholderImage}
              onConnectClick={() => {/* TODO */}}
              onMessageClick={() => console.log('Message clicked')}
            />

            <ActionControls
              className="fixed bottom-32 inset-x-0"
              onReject={() => {
                setDirection(-1);
                setIdx((i) => Math.min(i + 1, profiles.length));
              }}
              onRefresh={handleRefresh}
              onLike={() => {
                setDirection(1);
                setIdx((i) => Math.min(i + 1, profiles.length));
              }}
            />

            <DetailSection profile={profile} />
          </AnimatedCard>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
