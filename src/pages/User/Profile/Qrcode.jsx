/* ========== ShareQRCodePage.jsx ========== */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Share2, Copy, ArrowLeft, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource-variable/inter';

import { fetchProfile } from '../../../features/UserProfile';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function ShareQRCodePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // pull from our userProfile slice
  const profile = useSelector((state) => state.userProfile.currentUser);
  const status  = useSelector((state) => state.userProfile.status);
  const error   = useSelector((state) => state.userProfile.error);

  const qrCodeUrl = profile?.qrCodeUrl;
  const profileLink = profile?.profileLink;

  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  const showToast = (message) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 3000);
  };

  const handleCopyLink = () => {
    if (!profileLink) return;
    navigator.clipboard
      .writeText(profileLink)
      .then(() => showToast('Copied to clipboard'))
      .catch(() => showToast('Copy failed'));
  };

  const handleShare = async () => {
    if (!profileLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: `View my MatchMaker profile!`,
          url: profileLink,
        });
        showToast('Shared successfully');
      } catch {
        showToast('Share cancelled');
      }
    } else {
      showToast('Sharing not supported');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 font-inter">
      <header className="flex items-center px-6 py-4 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-pink-600" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          Share Your Love Code
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        {status === 'loading' && <LoadingSpinner />}

        {status === 'succeeded' && (
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
                src={qrCodeUrl}
                alt="Dating profile QR code"
                className="w-64 h-64 object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-pink-500/10 rounded-full animate-pulse" />
              </div>
            </div>

            <div className="w-full space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                disabled={!profileLink}
                className="w-full py-4 px-6 flex items-center justify-center bg-white border-2 border-pink-200 rounded-xl text-pink-600 font-semibold hover:bg-pink-50 transition-colors disabled:opacity-50"
              >
                <Copy className="mr-3" size={20} />
                Copy Profile Link
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                disabled={!profileLink}
                className="w-full py-4 px-6 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Share2 className="mr-3" size={20} />
                Share Profile
              </motion.button>
            </div>
          </motion.div>
        )}

        {status === 'failed' && (
          <div className="text-center text-red-500 mt-4">{error}</div>
        )}
      </main>

      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
          >
            <Heart size={18} className="fill-current" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
