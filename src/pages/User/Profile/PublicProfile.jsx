import React from 'react';
import { useParams } from 'react-router-dom';
import { Cake, MapPin, Star, Image, Smile, User, Heart } from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function PublicProfilePage() {
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff]">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-2 px-6 rounded-full hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] font-inter pb-10">
      {/* Cover Photo */}
      <div className="relative w-full h-64">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-b-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white rounded-t-3xl z-0" />
        <div className="absolute left-1/2 bottom-[-3rem] transform -translate-x-1/2 z-10">
          <div className="relative">
            <div className="bg-white p-1 rounded-full shadow-xl">
              <img
                src={
                  (profile.userType === 'mp' && profile.photos?.[0]) ||
                  profile.photo ||
                  profile.profilePhoto ||
                  '/default-avatar.jpg'
                }
                alt="Profile"
                className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>
            <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-md">
              <Heart size={18} className="text-white fill-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{profile.name}</h1>
            {profile.isVerified && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-full shadow">
                <Star size={18} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-gray-700">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <User size={16} className="mr-1.5 text-pink-500" />
              <span>Model</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Cake size={16} className="mr-1.5 text-pink-500" />
              <span>{age} years</span>
            </div>
            {profile.location && (
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <MapPin size={16} className="mr-1.5 text-blue-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Smile size={20} className="text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-800">About Me</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.photos?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Image size={20} className="text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
                  <span className="ml-auto bg-gray-100 text-gray-600 text-sm px-2.5 py-0.5 rounded-full">
                    {profile.photos.length} photos
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.photos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md group relative">
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {i === 0 && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Profile
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Interests */}
            {profile.interest?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={20} className="text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interest.map((item, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
