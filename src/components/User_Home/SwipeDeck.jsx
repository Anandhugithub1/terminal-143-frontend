import React, { useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence } from 'framer-motion';
import AnimatedCard from './AnimateCard';

const SWIPE_THRESHOLD = 100;

export default function SwipeDeck({
  idx,
  direction,
  profilesLength,
  onAdvance,
  onRightSwipe,
  children,
}) {
  const onSwiped = useCallback(
    ({ deltaX }) => {
      if (deltaX > SWIPE_THRESHOLD) {
        console.log('Detected right swipe'); // ✅ log here
        onAdvance(1);
        onRightSwipe?.();
      } else if (deltaX < -SWIPE_THRESHOLD) {
        onAdvance(-1);
      }
    },
    [onAdvance, onRightSwipe]
  );

  const handlers = useSwipeable({
    onSwiped,
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true, // better UX on mobile
  });

  return (
    <div
      {...handlers}
      className="relative w-full h-full touch-pan-y" // ✅ Ensure full touch coverage
      style={{ minHeight: '100vh' }} // Important for touch to register!
    >
      <AnimatePresence initial={false} mode="wait">
        <AnimatedCard idx={idx} direction={direction}>
          {children}
        </AnimatedCard>
      </AnimatePresence>
    </div>
  );
}
