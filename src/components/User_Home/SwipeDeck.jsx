import React, { useCallback,memo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence } from 'framer-motion';
// import AnimatedCard from './AnimateCard';
import { motion } from 'framer-motion';

const SWIPE_THRESHOLD = 100;


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
