import React, { lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfileById } from '../api';
import PageLayout from '../../../shared/components/PageLayout';
import ProfileSkeleton from '../components/ProfileSkeleton';

import placeholderImage from '../../../assets/woman.png';
// import ProfileCard from '../components/Cards/ProfileCard';
const ProfileCard =lazy(()=> import('../components/Cards/ProfileCard'))
const DetailSection =lazy(()=>import('../components/Details/Details'))
import { computeAge } from '../../../Utlis/utlis';
import { useTranslation } from 'react-i18next';
export default function UserProfilePage() {
  const { t } = useTranslation('swipe');
  const { pk, sk } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useUserProfileById(pk, sk);



  // ---- loading & error handling ----
  if (isLoading) return <ProfileSkeleton />;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-red-500 mb-4">{t('userProfileById.couldNotLoad')}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          {t('userProfileById.goBack')}
        </button>
      </div>
    );

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-gray-600">{t('userProfileById.profileNotFound')}</p>
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
    name: profile.name || t('userProfileById.unknown'),
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
    <PageLayout className="relative bg-white">
      <div className="relative">
        <Suspense fallback={null}>
          <ProfileCard
            profile={normalized}
            placeholderImage={placeholderImage}
            onConnectClick={() => {}}
            onMessageClick={() => {}}
          />
        </Suspense>

        <div className="mt-16 sm:mt-14 px-4 relative z-10">
          <Suspense fallback={null}>
            <DetailSection profile={normalized} />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}
