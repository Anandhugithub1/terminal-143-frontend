/* ConfirmationModal.jsx */
import React, { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, name }) => {
  const [burst, setBurst] = useState(false);

  const handleConfirm = () => {
    if (action === 'accept') {
      setBurst(true);
      setTimeout(() => setBurst(false), 1000);
    }
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  // generate 8 random bursts
  const particles = burst
    ? Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: -Math.random() * 200 - 50,
        rotate: Math.random() * 360,
      }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-6 right-6"
          >
            <PartyPopper size={24} className="text-gradient-secondary" />
          </motion.div>
        ))}

        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          Confirm {action}
          {action === 'accept' && <PartyPopper size={20} className="text-gradient-secondary" />}
        </h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to <strong>{action}</strong> match request from <strong>{name}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-white ${
              action === 'accept'
                ? 'bg-gradient-to-r from-gradient-primary to-gradient-secondary'
                : 'bg-gradient-to-r from-pink-400 to-pink-500'
            } hover:opacity-90 transition flex items-center gap-1`}
          >
            {action === 'accept' && <PartyPopper size={16} />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
