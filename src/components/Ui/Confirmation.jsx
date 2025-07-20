/* ConfirmationModal.jsx */
import React, { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import Confetti from 'react-confetti';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, name }) => {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    if (action === 'accept') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showCelebration && <Confetti recycle={false} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm relative">
          {action === 'accept' && (
            <PartyPopper className="absolute -top-4 right-4 text-gradient-secondary" size={32} />
          )}
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Confirm {action}
          </h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to <strong>{action}</strong> match request from <strong>{name}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCelebration(false);
                onClose();
              }}
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
              } hover:opacity-90 transition`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
