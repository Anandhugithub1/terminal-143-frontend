// src/pages/components/QRShareCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

export default function QRShareCard({ profile, onShare }) {
  const qrCodeSrc = profile?.qrCodeUrl?.startsWith('http')
    ? profile.qrCodeUrl
    : `https://${profile.qrCodeUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-600 text-sm max-w-xs">
          Share this to let others view your dating profile and connect with you!
        </p>
      </div>

      <div className="relative p-6 bg-white rounded-2xl shadow-inner border-4 border-dotted border-pink-100">
        <img
          src={qrCodeSrc}
          alt="Dating profile QR code"
          className="w-64 h-64 object-contain bg-gray-100"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full animate-pulse" />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onShare}
        disabled={!profile.profileLink}
        className="w-full py-4 px-6 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        <Share2 className="mr-3" size={20} />
        Share Profile
      </motion.button>
    </motion.div>
  );
}
