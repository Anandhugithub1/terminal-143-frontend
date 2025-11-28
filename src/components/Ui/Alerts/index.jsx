/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';


/**
 * AlertMessage component
 *
 * Props:
 * - message: string
 * - type: 'error' | 'success' | 'info' | 'warning'
 * - isVisible: boolean
 * - onClose: () => void
 */
export default function AlertMessage({ message, type = 'error', isVisible, onClose }) {
  // Tailwind classes based on alert type
  const typeStyles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  };
  const styles = typeStyles[type] || typeStyles.error;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`${styles} border px-4 py-3 rounded-md relative shadow-md mb-4`}
          role="alert"
        >
          <span className="block sm:inline">{message}</span>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 focus:outline-none"
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
