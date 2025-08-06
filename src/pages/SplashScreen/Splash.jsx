import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff8fb] to-[#f9f3ff] flex flex-col justify-center items-center p-6">
      {/* Progress bar at top */}
      <div className="w-full max-w-sm absolute top-6">
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col items-center justify-center max-w-sm w-full text-center">
        {/* Animated logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            className="w-20 h-20 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow mb-6 mx-auto"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.8,
              ease: "easeInOut"
            }}
          >
            <Heart className="text-white w-10 h-10" fill="white" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold text-gray-800"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Terminal143
          </motion.h1>
          
          <motion.p
            className="text-gray-600 mt-2"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Finding your perfect match
          </motion.p>
        </motion.div>
        
        {/* Loading indicator */}
        <div className="w-full max-w-xs">
          <motion.p
            className="text-gray-600 mb-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparing your experience
          </motion.p>
          
          <div className="flex justify-center space-x-1 mb-12">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="absolute bottom-6">
        <p className="text-xs text-gray-400">
          Securing your connection • v2.5.1
        </p>
      </div>
    </div>
  );
}