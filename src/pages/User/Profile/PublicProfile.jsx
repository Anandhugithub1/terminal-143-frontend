import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cake, MapPin, Heart, Star, Image, Smile } from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  const [isLoggedIn] = useState(false);

  const age = profile?.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  const ProtectedSection = ({ children }) => (
    <div className="relative bg-white rounded-xl shadow-sm p-5 mb-6 overflow-hidden">
      {!isLoggedIn ? (
        <div className="pointer-events-none blur-sm select-none opacity-60">{children}</div>
      ) : (
        children
      )}
    </div>
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center mt-10 text-red-500">{error.message}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] font-inter pb-40 relative">
      {/* Cover + Profile Container */}
      <div className="relative w-full h-52 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
        <div className="absolute bottom-0 left-0 w-full h-12 bg-white rounded-t-3xl z-0" />
        <div className="absolute left-1/2 bottom-[-3rem] transform -translate-x-1/2 z-10">
          <div className="relative">
            <img
              src={
                (profile.userType === 'mp' && profile.photos?.[0]) ||
                profile.photo ||
                profile.profilePhoto ||
                '/default-avatar.jpg'
              }
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <Heart size={16} className="fill-pink-500 text-pink-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Blurred Content */}
      <div className={`mt-16 px-4 max-w-2xl mx-auto ${!isLoggedIn ? 'blur-sm pointer-events-none select-none opacity-60' : ''}`}>
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            {profile.isVerified && (
              <div className="bg-blue-100 p-1 rounded-full">
                <Star size={16} className="fill-blue-500 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-gray-600">
            <div className="flex items-center">
              <Cake size={16} className="mr-1 text-pink-500" />
              <span>{age} years</span>
            </div>
            {profile.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-blue-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <ProtectedSection>
            <div className="flex items-center gap-2 mb-3">
              <Smile size={20} className="text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-800">About Me</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </ProtectedSection>
        )}

        {/* Gallery */}
        {profile.photos?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Image size={20} className="text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md">
                  <img
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interest?.length > 0 && (
          <ProtectedSection>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interest.map((item, i) => (
                <span
                  key={i}
                  className="bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </ProtectedSection>
        )}
      </div>

      {/* 🔐 Floating Auth Prompt */}
      {!isLoggedIn && (
        <>
       {!isLoggedIn && (
  <>
    {/* Login Button (Top) */}
<div className="fixed bottom-24 w-full flex justify-center">
  <button
    onClick={() => navigate('/login')}
    className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-gradient-primary to-gradient-secondary text-sm font-medium px-6 py-3 rounded-full w-full max-w-xs shadow hover:bg-gray-100 transition"
  >
    Log in
  </button>
</div>

{/* Register Button (Bottom) */}
<div className="fixed bottom-4 w-full flex justify-center">
  <button
    onClick={() => navigate('/register')}
    className="text-white text-sm font-medium px-6 py-3 rounded-full w-full max-w-xs shadow bg-gradient-to-r from-gradient-primary to-gradient-secondary transition"
  >
    Register to See Full Profile
  </button>
</div>

  </>
)}

        </>
      )}
    </div>
  );
}
