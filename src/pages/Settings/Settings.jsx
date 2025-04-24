// src/pages/SettingsPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sliders, User, HelpCircle, Info } from 'lucide-react';
import '@fontsource-variable/inter';

const menuItems = [
  { label: 'Preferences', icon: <Sliders size={20} />, to: '/preferences' },
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