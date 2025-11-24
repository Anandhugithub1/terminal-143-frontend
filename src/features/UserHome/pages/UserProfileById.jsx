import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfileById } from '../api';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';
import ProfileSkeleton from '../components/ProfileSkeleton';
import DetailSection from '../components/Details/Details';
import placeholderImage from '../../../assets/woman.png';
import ProfileCard from '../components/Cards/ProfileCard';
import { computeAge } from '../../../Utlis/utlis';
export default function UserProfilePage() {
  const { pk, sk } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useUserProfileById(pk, sk);



  // ---- loading & error handling ----
  if (isLoading) return <ProfileSkeleton />;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-red-500 mb-4">Could not load user profile.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          Go Back
        </button>
      </div>
    );

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );

  // ---- select images correctly ----
  const images =
    (profile.photos && profile.photos.length > 0)
      ? profile.photos
      : profile.profilePhoto
      ? [profile.profilePhoto]
      : profile.photo
      ? [profile.photo]
      : [placeholderImage];

  // ---- final normalized profile object ----
  const normalized = {
    name: profile.name || 'Unknown',
    age: computeAge(profile.dob),
    about: profile.bio || '',
    gender: profile.gender || '',
    images,
    location: profile.location || '',
    userId: profile.username,
    interests: profile.interest || [],
    healthStatus: profile.healthStatus || {},
    popularity: profile.popularity || 0,
    languagesKnown: profile.languagesKnown || [],
  };

  return (
    <div className="relative bg-white min-h-screen pb-20">
      <TopNav />

      <div className="relative">
        <div className="relative">
          <ProfileCard
            profile={normalized}
            placeholderImage={placeholderImage}
            onConnectClick={() => {}}
            onMessageClick={() => {}}
          />

          {/* <div className="flex justify-center mt-2 mb-2">
            <ActionControls
              onReject={() => {}}
              onRefresh={() => {}}
              onLike={() => {}}
            />
          </div> */}
        </div>

        <div className="mt-16 sm:mt-14 px-4 relative z-10">
          <DetailSection profile={normalized} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
