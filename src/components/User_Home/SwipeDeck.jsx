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
  children,
}) {
  const onSwiped = useCallback(
    ({ deltaX }) => {
      if (deltaX > SWIPE_THRESHOLD) {
        onAdvance(1);
      } else if (deltaX < -SWIPE_THRESHOLD) {
        onAdvance(-1);
      }
    },
    [onAdvance]
  );

  const handlers = useSwipeable({
    onSwiped,
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  return (
    <div className="relative" {...handlers}>
      <AnimatePresence initial={false} mode="wait">
        <AnimatedCard idx={idx} direction={direction}>
          {children}
        </AnimatedCard>
      </AnimatePresence>
    </div>
  );
}
