import React from 'react';
import { useParams } from 'react-router-dom';
import { Cake, MapPin, Heart, Star, Image, Smile, MessageCircle } from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PublicProfilePage() {
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  // Calculate age safely
  const calculateAge = (dob) => {
    if (!dob) return '—';
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate)) return '—';
      const diff = Date.now() - birthDate.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    } catch {
      return '—';
    }
  };

  const age = calculateAge(profile?.dob);

  // Get gradient based on gender
  const getGradient = () => {
    switch (gender) {
      case 'male': 
        return 'from-blue-300 via-cyan-300 to-teal-300';
      case 'female':
        return 'from-pink-300 via-purple-300 to-indigo-300';
      case 'couple':
        return 'from-amber-300 via-orange-300 to-red-300';
      default:
        return 'from-gray-200 via-gray-300 to-gray-400';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart className="text-red-500" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error.message || "The profile you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-full transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] font-inter pb-10">
      {/* Cover Photo Section */}
      <div className={`relative w-full h-40 md:h-52 ${isLoading ? 'bg-gray-200' : getGradient()}`}>
        {/* White curve overlay */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-white rounded-t-3xl z-0" />
        
        {/* Profile Photo */}
        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 z-10">
          {isLoading ? (
            <Skeleton circle width={120} height={120} />
          ) : (
            <div className="relative">
              <img
                src={
                  (profile.userType === 'mp' && profile.photos?.[0]) ||
                  profile.photo ||
                  profile.profilePhoto ||
                  '/default-avatar.jpg'
                }
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.jpg';
                }}
              />
              {profile.isVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Star size={16} className="text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-16 px-4 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {isLoading ? (
            <>
              <Skeleton width={200} height={32} className="mx-auto mb-4" />
              <div className="flex items-center justify-center gap-4">
                <Skeleton width={80} height={20} />
                <Skeleton width={100} height={20} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-gray-600 text-sm md:text-base">
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <Cake size={16} className="mr-1 text-pink-500" />
                  <span>{age} years</span>
                </div>
                {profile.location && (
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <MapPin size={16} className="mr-1 text-blue-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {isLoading ? (
            <>
              <Skeleton width={120} height={40} borderRadius={50} />
              <Skeleton width={120} height={40} borderRadius={50} />
            </>
          ) : (
            <>
              <button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition">
                <Heart size={18} className="fill-white" />
                Connect
              </button>
              <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition">
                <MessageCircle size={18} />
                Message
              </button>
            </>
          )}
        </div>

        {/* Bio Section */}
        {(isLoading || profile?.bio) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
            {isLoading ? (
              <>
                <Skeleton width={120} height={24} className="mb-3" />
                <Skeleton count={3} />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Smile size={20} className="text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-800">About Me</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </>
            )}
          </div>
        )}

        {/* Gallery */}
        {(isLoading || profile?.photos?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Image size={20} className="text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {isLoading
                ? Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))
                : profile.photos.slice(0, 6).map((url, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-xl overflow-hidden shadow-md group relative"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {i === 5 && profile.photos.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                          +{profile.photos.length - 6}
                        </div>
                      )}
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {(isLoading || profile?.interest?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} width={80} height={32} borderRadius={50} />
                  ))
                : profile.interest.map((item, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}