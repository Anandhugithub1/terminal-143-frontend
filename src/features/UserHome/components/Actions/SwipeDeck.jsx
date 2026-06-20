import React, { useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedCard from '../Cards/AnimateCard';

// A swipe registers only when ALL three conditions pass:
//   1. gesture lasted at least MIN_DURATION ms  → rules out accidental brush contacts
//   2. horizontal travel >= SWIPE_THRESHOLD px  → rules out small nudges
//   3. either fast enough (velocity >= MIN_VELOCITY) OR far enough (>= FAR_FRACTION of screen)
//      → rules out slow accidental pushes while still accepting deliberate slow-drags
const SWIPE_THRESHOLD = 120;      // px — raised from 100 to require more deliberate movement
const MIN_VELOCITY   = 0.3;       // px/ms — minimum speed for an intentional flick
const MIN_DURATION   = 80;        // ms — filters out brush/accidental touch contacts
const FAR_FRACTION   = 0.35;      // fraction of screen width that bypasses velocity check
const TAP_THRESHOLD  = 10;        // px — max movement to still register as a tap

export default function SwipeDeck({ idx, direction, onAdvance, onRightSwipe, children }) {
  const startX    = useRef(0);
  const startY    = useRef(0);
  const startTime = useRef(0);
  const isTap     = useRef(false);
  const isVerticalScroll = useRef(false);

  const handleTouchStart = useCallback((e) => {
    startX.current    = e.touches[0].clientX;
    startY.current    = e.touches[0].clientY;
    startTime.current = Date.now();
    isTap.current     = true;
    isVerticalScroll.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      isVerticalScroll.current = true;
    }

    if (Math.abs(dx) > TAP_THRESHOLD) {
      isTap.current = false;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (isVerticalScroll.current) return;

      const endX    = e.changedTouches[0].clientX;
      const deltaX  = endX - startX.current;
      const duration = Date.now() - startTime.current;

      if (isTap.current) {
        const tapEvent = new CustomEvent('photoTap', {
          detail: { x: e.changedTouches[0].clientX },
        });
        e.currentTarget.dispatchEvent(tapEvent);
        return;
      }

      // Guard 1: ignore brush/accidental contacts
      if (duration < MIN_DURATION) return;

      const absDeltaX     = Math.abs(deltaX);
      const velocity      = absDeltaX / duration;
      const screenFraction = absDeltaX / window.innerWidth;

      // Guard 2: must travel far enough horizontally
      if (absDeltaX < SWIPE_THRESHOLD) return;

      // Guard 3: must be fast OR cover a large portion of the screen
      if (velocity < MIN_VELOCITY && screenFraction < FAR_FRACTION) return;

      if (deltaX > 0) {
        onAdvance(1);
        onRightSwipe?.();
      } else {
        onAdvance(-1);
      }
    },
    [onAdvance, onRightSwipe]
  );

  return (
    <div
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
