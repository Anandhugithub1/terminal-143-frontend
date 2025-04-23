// src/pages/ProfileSettingsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe2,
  Film,
  
  PartyPopper,
  Compass,
  Umbrella
} from 'lucide-react';
import '@fontsource-variable/inter';

const fields = [
  { label: 'Gender',    value: 'Men',      icon: User },
  { label: 'Age',       value: '24',       icon: Calendar },
  { label: 'City',      value: 'Germany',  icon: MapPin },
  { label: 'Work',      value: 'Designer', icon: Briefcase },
  { label: 'Education', value: 'Under Graduate', icon: GraduationCap },
  { label: 'Languages', value: 'German',   icon: Globe2 },
];

const interests = [
  { label: 'Travel',     icon: Globe2 },
  { label: 'Movies',     icon: Film },
  { label: 'Parties',    icon: PartyPopper },
  { label: 'Adventures', icon: Compass },
  { label: 'Beach',      icon: Umbrella },
];

function ProfileSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="flex items-center px-5 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-900">
          Personal Information
        </h1>
      </header>

      <div className="p-5 space-y-6">
        {/* My Bio */}
        <section className="bg-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>
              <p className="mt-2 text-sm text-gray-600">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </div>
            <button className="text-pink-600 text-sm font-medium hover:underline">
              Edit
            </button>
          </div>
        </section>

        {/* About Me */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">About Me</h2>
          </div>
          {fields.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className=" rounded-2xl  " />  
                <span className="text-gray-700 font-medium">{label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{value}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </section>

        {/* Interests */}
        <section className="bg-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Interests</h2>
            <button className="text-pink-600 text-sm font-medium hover:underline">
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition"
              >
                <Icon size={16} className="text-pink-600" />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
