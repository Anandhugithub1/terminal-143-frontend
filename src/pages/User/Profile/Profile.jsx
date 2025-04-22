// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import '@fontsource-variable/inter';

const languages = ['Thai', 'English'];
const interestsList = ['Travel', 'Music'];
const locations = ['Silom', 'Sathorn'];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('About');

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="flex items-center justify-between px-4 py-3 bg-pink-500">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white font-semibold">Profile</h1>
        <div className="relative">
          <button aria-label="More options" className="text-white">
            <MoreHorizontal size={24} />
          </button>
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Edit Profile</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Your QR</button>
          </div>
        </div>
      </header>

      {/* Avatar + Info */}
      <div className="p-4 flex items-center space-x-4">
        <img
          src="/path/to/avatar.jpg"
          alt="User Avatar"
          className="h-16 w-16 rounded-full object-cover border-2 border-white shadow"
        />
        <div>
          <h2 className="text-lg font-semibold">Alex Ben, M, 40</h2>
          <p className="text-gray-600 text-sm">Let's keep it simple</p>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
            <span>★ Top 10%</span>
            <span>👍 95%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Posts', 'About'].map((label) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={
              `flex-1 text-center py-2 font-medium ${tab === label ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-600'}`
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {tab === 'About' && (
          <>
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-1 text-gray-600 text-sm">
                Outdoor enthusiast, live music fan, and always down for a good conversation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Language</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map(lang => (
                  <span key={lang} className="px-3 py-1 border border-gray-300 rounded-full text-sm">{lang}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">Interests</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {interestsList.map(item => (
                  <span key={item} className="px-3 py-1 border border-gray-300 rounded-full text-sm">{item}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">Location</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {locations.map(loc => (
                  <span key={loc} className="px-3 py-1 border border-gray-300 rounded-full text-sm">{loc}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">Health Status</h3>
              <p className="mt-1 text-gray-600 text-sm">STI / STD Status : Negative</p>
              <p className="text-gray-600 text-sm">Tested On : Aug 05, 2024</p>
            </div>
          </>
        )}
        {/* Posts content could go here when tab === 'Posts' */}
      </div>
    </div>
  );
};
