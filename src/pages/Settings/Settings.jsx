import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sliders,
  Lock,
  Trash2,
  LogOut,
  HelpCircle,
  Info,
  Globe,
  Stars,
  Users
} from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import '@fontsource-variable/inter';
import { PrimaryButton, SecondaryButton } from '../../shared/Button';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CapacitorCookies } from '@capacitor/core';
import { signOut } from '../../features/Auth/authApi';
import { socketManager } from '../../shared/socket/socketManager';

const SettingsPage = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  //  SAME logout behavior, TanStack only
  const logoutMutation = useMutation({
    mutationFn: () => signOut('signout'),
    onSuccess: async () => {
      socketManager.closeSession();
      localStorage.clear();
      sessionStorage.clear();
      // The auth cookie is HttpOnly, so JS can't touch it via document.cookie —
      // this clears it at the native WebView cookie-jar level as a safety net
      // in case the server's Set-Cookie expiry doesn't land (e.g. flaky
      // cross-subdomain cookie handling between app.* and api.* in the WebView).
      try {
        await CapacitorCookies.clearAllCookies();
      } catch (err) {
        console.warn('Failed to clear cookies on logout', err);
      }
      // Without this, the next account to log in on this device inherits
      // this session's cached queries (e.g. useMyProfile's ["my-profile"]
      // key carries no user id) until they individually go stale.
      queryClient.clear();
      navigate('/login');
    },
    onError: (err) => {
      alert(err.message || t('logoutError'));
    },
  });

  const menuItems = [
    { label: t('language'), icon: <Globe size={20} />, to: '/language' },
    { label: t('changePassword'), icon: <Lock size={20} />, to: '/reset-password' },
    // { label: t('preferences'), icon: <Sliders size={20} />, to: '/preferences' },
    { label: t('privacy'), icon: <Users size={20} />, to: '/privacy-settings' },
    { label: t('deleteAccount'), icon: <Trash2 size={20} />, to: '/delete-account' },
    { label: t('helpCentre'), icon: <HelpCircle size={20} />, to: '/help-center' },
    { label: t('aboutApp'), icon: <Info size={20} />, to: '/info' },
    { label: t('rating'), icon: <Stars size={20} />, to: '/rating' },
  ];

  return (
    <div className="min-h-[100dvh] bg-white font-inter relative">
      <PageHeader title={t('settings')} />

      <div className="p-4">
        <nav className="mt-6 space-y-4">
          {menuItems.map(({ label, icon, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="text-gray-600">{icon}</div>
              <span className="text-gray-800 font-medium">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
          >
            <div className="text-gray-600">
              <LogOut size={20} />
            </div>
            <span className="text-gray-800 font-medium">{t('logout')}</span>
          </button>
        </nav>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-2xl font-inter">
            <h2 className="text-xl font-semibold mb-6 text-center">
              {t('logoutOptions')}
            </h2>

            <div className="flex flex-col gap-3">
              <PrimaryButton
                onClick={() => logoutMutation.mutate()}
                className="!py-3"
                to="#"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending
                  ? t('loggingOut')
                  : t('logoutThisDevice')}
              </PrimaryButton>

              <SecondaryButton
                onClick={() => setShowLogoutModal(false)}
                className="!py-3"
                to="#"
              >
                {t('cancel')}
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
