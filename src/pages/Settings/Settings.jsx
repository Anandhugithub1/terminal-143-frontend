import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sliders,
  Lock,
  Trash2,
  LogOut,
  HelpCircle,
  Info,
  Globe,
} from 'lucide-react';
import '@fontsource-variable/inter';
import { PrimaryButton, SecondaryButton } from '../../shared/Button';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { signOut } from '../../features/Auth/authApi';

const SettingsPage = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ SAME logout behavior, TanStack only
  const logoutMutation = useMutation({
    mutationFn: () => signOut('signout'),
    onSuccess: () => {
      localStorage.clear();
      sessionStorage.clear();
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
    { label: t('deleteAccount'), icon: <Trash2 size={20} />, to: '/delete-account' },
    { label: t('helpCentre'), icon: <HelpCircle size={20} />, to: '/help-center' },
    { label: t('aboutApp'), icon: <Info size={20} />, to: '/info' },
  ];

  return (
    <div className="min-h-screen bg-white font-inter relative">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">{t('settings')}</h1>
      </header>

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
