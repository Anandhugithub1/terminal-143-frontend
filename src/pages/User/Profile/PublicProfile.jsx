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

  // Calculate age
  const age = profile?.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  // Protected overlay component
  const ProtectedSection = ({ children }) => (
    <div className="relative bg-white rounded-xl shadow p-6 mb-6 overflow-hidden">
      {!isLoggedIn && (
        <div className="absolute inset-0 bg-blue-50/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <p className="text-blue-700 font-semibold mb-4">Protected Content</p>
          <button
            onClick={() => navigate('/login')}
            className="mb-2 w-32 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-100 transition"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-32 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Register
          </button>
        </div>
      )}
      <div className={`${!isLoggedIn ? 'opacity-50' : 'opacity-100'}`}>{children}</div>
    </div>
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center mt-10 text-red-500">{error.message}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#ffffff] font-inter pb-40 relative">
      {/* Header + Cover */}
      <div className="relative w-full h-56 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white rounded-t-3xl" />
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <img
              src={profile.photos?.[0] || profile.photo || '/default-avatar.jpg'}
              alt="Profile"
              className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg"
            />
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1">
              <Heart size={18} className="fill-pink-500 text-pink-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-32 px-6 max-w-xl mx-auto">
        {/* Name & Details */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
            {profile.isVerified && (
              <div className="bg-blue-100 p-1 rounded-full">
                <Star size={18} className="fill-blue-500" />
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-6 mt-2 text-gray-600">
            <div className="flex items-center">
              <Cake size={18} className="text-pink-500 mr-1" />
              <span>{age} yrs</span>
            </div>
            {profile.location && (
              <div className="flex items-center">
                <MapPin size={18} className="text-blue-500 mr-1" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* About Me */}
        {profile.bio && (
          <ProtectedSection>
            <div className="flex items-center gap-2 mb-3">
              <Smile size={22} className="text-pink-500" />
              <h3 className="text-xl font-semibold text-gray-800">About Me</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </ProtectedSection>
        )}

        {/* Gallery */}
        {profile.photos?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Image size={22} className="text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-800">Gallery</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden shadow-inner hover:shadow-lg transition"
                >
                  <img
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover"
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
              <Heart size={22} className="text-red-500" />
              <h3 className="text-xl font-semibold text-gray-800">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile.interest.map((item, i) => (
                <span
                  key={i}
                  className="inline-block bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </ProtectedSection>
        )}
      </div>
    </div>
  );
}
