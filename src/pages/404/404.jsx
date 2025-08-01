import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {Button} from '../../shared/Button';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 }
  }
};

const floatingAstronautVariants = {
  animate: {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  }
};

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);
  const handleHome = useCallback(() => navigate('/home'), [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <motion.div
        className="relative overflow-hidden bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-8 sm:p-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="404 Not Found"
      >
        {/* Background Decor */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-100 rounded-full opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-100 rounded-full opacity-50" />

        <motion.div className="flex justify-center mb-8" variants={itemVariants}>
          <motion.div
            className="p-4 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary"
            variants={floatingAstronautVariants}
            animate="animate"
            aria-hidden="true"
          >
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2.252A8.014 8.014 0 0117 8a8.5 8.5 0 01-2 5.5M12 21.684c3.56-3.413 6-6.5 6-10a8 8 0 10-16 0c0 3.5 2.44 6.587 6 10zm-3-9h.01M15 12h.01"
              />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent"
          variants={itemVariants}
        >
          404
        </motion.h1>

        <motion.p className="text-xl text-gray-600 text-center mb-6" variants={itemVariants}>
          Oops! Lost in space?
        </motion.p>

        <motion.p className="text-gray-500 text-center mb-8" variants={itemVariants}>
          The page you're looking for seems to have drifted off into the cosmic void.
        </motion.p>

        <motion.div className="flex justify-center" variants={itemVariants}>
  <Button
    onClick={handleGoBack}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label="Go Back"
  >
    Go Back
  </Button>
</motion.div>


      </motion.div>
    </div>
  );
};

export default React.memo(NotFoundPage);
