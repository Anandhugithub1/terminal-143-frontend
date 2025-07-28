// src/pages/components/Toast.jsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Toast({ open, message }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
        >
          <Heart size={18} className="fill-current" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
