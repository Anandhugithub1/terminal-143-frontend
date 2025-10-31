import React, { useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence } from 'framer-motion';
import AnimatedCard from '../Cards/AnimateCard';

const SWIPE_THRESHOLD = 100;
const TAP_THRESHOLD = 10;

export default function SwipeDeck({
  idx,
  direction,
  onAdvance,
  onRightSwipe,
  children,
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const endX = useRef(0);
  const endY = useRef(0);
  const isTap = useRef(false);
  const isVerticalScroll = useRef(false);

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isTap.current = true;
    isVerticalScroll.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      isVerticalScroll.current = true; // allow scroll
    }

    if (Math.abs(dx) > TAP_THRESHOLD) {
      isTap.current = false; // not a tap
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (isVerticalScroll.current) return;

      endX.current = e.changedTouches[0].clientX;
      const deltaX = endX.current - startX.current;

      if (isTap.current) {
        // Tell PhotoCarousel where user tapped
        const tapEvent = new CustomEvent('photoTap', {
          detail: { x: e.changedTouches[0].clientX },
        });
        e.currentTarget.dispatchEvent(tapEvent);
        return;
      }

      if (deltaX > SWIPE_THRESHOLD) {
        onAdvance(1);
        onRightSwipe?.();
      } else if (deltaX < -SWIPE_THRESHOLD) {
        onAdvance(-1);
      }
    },
    [onAdvance, onRightSwipe]
  );

  const handlers = useSwipeable({
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  return (
    <div
      {...handlers}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-auto"
    >
      <AnimatePresence initial={false} mode="wait">
        <AnimatedCard idx={idx} direction={direction}>
          {children}
        </AnimatedCard>
      </AnimatePresence>
    </div>
  );
}
