import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedCard from '../Cards/AnimateCard';

export default function SwipeDeck({ idx, direction, children }) {
  return (
    <div className="relative w-full h-auto">
      <AnimatePresence initial={false} mode="wait">
        <AnimatedCard idx={idx} direction={direction}>
          {children}
        </AnimatedCard>
      </AnimatePresence>
    </div>
  );
}
