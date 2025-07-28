// src/pages/ShareQRCodePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchProfile } from '../index';
import { LoadingSpinner } from '../../../components/Ui/Spinner';
import QRShareCard from '../components/Qrcode/Card';
import Toast from '../components/Qrcode/Toast';
import Header from '../components/Qrcode/Header';

export default function ShareQRCodePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);
  const error = useSelector((state) => state.userProfile.error);

  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProfile());
  }, [dispatch, status]);

  const showToast = (message) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 3000);
  };

  const handleShare = async () => {
    if (!profile?.profileLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: 'View my MatchMaker profile!',
          url: profile.profileLink,
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
      <Header onBack={() => navigate(-1)} />

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'succeeded' && <QRShareCard profile={profile} onShare={handleShare} />} 
        {status === 'failed' && <div className="text-center text-red-500 mt-4">{error}</div>}
      </main>

      <Toast open={toast.open} message={toast.message} />
    </div>
  );
}
