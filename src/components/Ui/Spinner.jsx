import { motion } from 'framer-motion';

export function LoadingSpinner() {
  const circleVariants = {
    animate: (i) => ({
      y: [0, -15, 0],
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={circleVariants}
            animate="animate"
            className="h-4 w-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg"
          />
        ))}
      </div>
    </div>
  );
}
