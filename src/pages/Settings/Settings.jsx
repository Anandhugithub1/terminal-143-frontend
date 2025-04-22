// src/pages/SettingsPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sliders, User, HelpCircle, Info } from 'lucide-react';
import '@fontsource-variable/inter';

const menuItems = [
  { label: 'Preferences', icon: <Sliders size={20} />, to: '/preferences' },
  { label: 'Profile Information', icon: <User size={20} />, to: '/settings/profile-settings' },
  { label: 'Help Centre', icon: <HelpCircle size={20} />, to: '/help' },
  { label: 'About App', icon: <Info size={20} />, to: '/about' },
];

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Settings</h1>
      </header>

      <div className="p-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src="https://fastly.picsum.photos/id/27/3264/1836.jpg?hmac=p3BVIgKKQpHhfGRRCbsi2MCAzw8mWBCayBsKxxtWO8g"
              alt="User Avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full border">
              {/* Replace with your edit icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6L5 17v4h4l10-10z" />
              </svg>
            </button>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Rodri Alexander</h2>
          {/* <p className="text-sm text-gray-500">rodri123@gmail.com</p> */}
          <div className="mt-2 text-sm text-gray-700">
            {/* <span className="font-medium">40% </span>Completed */}
          </div>
        </div>

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
        </nav>
      </div>
    </div>
  );
};

export default SettingsPage;