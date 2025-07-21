// src/pages/SettingsPage.jsx
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

const menuItems = [
  { label: 'Language', icon: <Globe size={20} />, to: '/language' },
  { label: 'Change Password', icon: <Lock size={20} />, to: '/change-password' },
  { label: 'Preferences', icon: <Sliders size={20} />, to: '/preferences' },
  { label: 'Delete Account', icon: <Trash2 size={20} />, to: '/delete-account' },
  { label: 'Help Centre', icon: <HelpCircle size={20} />, to: '/help' },
  { label: 'About App', icon: <Info size={20} />, to: '/about' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutCurrentDevice = () => {
    // Clear all cookies for current domain
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Clear local/session storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to logout or login page
    navigate('/login');
  };

  const handleLogoutAllDevices = () => {
    // Placeholder for future implementation
    alert('Logout from all devices is not yet available.');
    // You can fallback to current logout if desired:
    // handleLogoutCurrentDevice();
  };

  return (
    <div className="min-h-screen bg-white font-inter relative">
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Settings</h1>
      </header>

      {/* Menu Items */}
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

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
          >
            <div className="text-gray-600">
              <LogOut size={20} />
            </div>
            <span className="text-gray-800 font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-2xl font-inter">
            <h2 className="text-xl font-semibold mb-6 text-center">Log out options</h2>
            <div className="flex flex-col gap-3">
              <PrimaryButton
                onClick={handleLogoutCurrentDevice}
                className="!py-3"
                to="#"
              >
                Logout from This Device
              </PrimaryButton>
              <PrimaryButton
                onClick={handleLogoutAllDevices}
                className="!py-3 bg-red-600 hover:bg-red-700"
                to="#"
              >
                Logout from All Devices
              </PrimaryButton>
              <SecondaryButton
                onClick={() => setShowLogoutModal(false)}
                className="!py-3"
                to="#"
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
