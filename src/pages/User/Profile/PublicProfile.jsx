import React, { Suspense, lazy, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Cake,
  MapPin,
  Star,
  Image as ImgIcon,
  Smile,
  User,
  Heart,
} from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import { LoadingSpinner } from '../../../components/Ui/Spinner';
import { Button } from '../../../shared/Button';

// Lazy load heavy sections for performance
const GallerySection = lazy(() =>
  import('../../../components/PublicProfile/Gallery')
);
const InterestsSection = lazy(() =>
  import('../../../components/PublicProfile/InterestsSection')
);

export default function PublicProfilePage() {
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  const age = useMemo(() => {
    if (!profile?.dob) return '—';
    const years =
      (Date.now() - new Date(profile.dob).getTime()) /
      (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <span
            role="img"
            aria-label="warning"
            className="text-red-500 text-6xl mb-4"
          >
            ⚠️
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-2 px-6 rounded-full hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] font-inter pb-28">
      {/* Cover & Avatar */}
      <header className="relative w-full h-64 md:h-72 lg:h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-b-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-white rounded-t-3xl" />
        <div className="absolute left-1/2 bottom-[-3rem] transform -translate-x-1/2 z-10">
          <div className="relative">
            <div className="bg-white p-1 rounded-full shadow-lg">
              <img
                src={
                  profile.userType === 'mp'
                    ? profile.photos?.[0]
                    : profile.photo || profile.profilePhoto || '/default-avatar.jpg'
                }
                alt={`${profile.name} avatar`}
                className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-xl"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-md">
              <Heart size={20} className="text-white fill-current" aria-hidden />
            </div>
          </div>
        </div>
      </header>

      <main className="mt-20 container mx-auto px-4 lg:px-8">
        {/* Profile Header */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              {profile.name}
            </h1>
            {profile.isVerified && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-full shadow">
                <Star size={20} className="text-white fill-current" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-gray-700">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <User size={18} className="mr-1.5 text-pink-500" />
              <span>{profile.userType.toUpperCase()}</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Cake size={18} className="mr-1.5 text-pink-500" />
              <span>{age} years</span>
            </div>
            {profile.location && (
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <MapPin size={18} className="mr-1.5 text-blue-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {profile.bio && (
              <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Smile size={22} className="text-pink-500" />
                  <h2 className="text-xl font-semibold text-gray-800">About Me</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </section>
            )}

            {profile.photos?.length > 0 && (
              <section>
                <Suspense fallback={<LoadingSpinner size="md" />}>
                  <GallerySection urls={profile.photos} />
                </Suspense>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            {profile.interest?.length > 0 && (
              <section>
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <InterestsSection items={profile.interest} />
                </Suspense>
              </section>
            )}
          </aside>
        </div>
      </main>

      {/* Register/Login Footer */}
      <div className="fixed bottom-4 inset-x-0 px-4 z-50">
        <div className="max-w-md mx-auto flex gap-4 justify-center">
          <Link to="/register" className="flex-1">
            <Button>Register</Button>
          </Link>
          <Link to="/login" className="flex-1">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
