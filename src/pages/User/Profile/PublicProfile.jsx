import React, { Suspense, lazy, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { LoginRegisterModal } from '../../../components/PublicProfile/InterestsSection';

const GallerySection = lazy(() => import('../../../components/PublicProfile/Gallery'));
const InterestsSection = lazy(() => import('../../../components/PublicProfile/InterestsSection'));

export default function PublicProfilePage() {
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isLocked = true; // Adjust your auth logic

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
          <span role="img" aria-label="warning" className="text-red-500 text-6xl mb-4">
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#fdf2f8] to-[#f0f9ff] font-inter pb-28">
      <main className="mt-20 container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {profile.bio && (
              <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Smile size={22} className="text-pink-500" />
                  <h2 className="text-xl font-semibold text-gray-800">About Me</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {isLocked ? <span className="blur-sm select-none">Content locked. Please login.</span> : profile.bio}
                </p>
                {isLocked && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm text-purple-600 font-semibold underline"
                    >
                      Login to view
                    </button>
                  </div>
                )}
              </section>
            )}

            {Array.isArray(profile.photos) && profile.photos.length > 0 && (
              <section className="relative">
                {isLocked && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm text-purple-600 font-semibold underline"
                    >
                      Login to view gallery
                    </button>
                  </div>
                )}
                <div className={isLocked ? 'blur-sm select-none' : ''}>
                  <Suspense fallback={<LoadingSpinner size="md" />}>
                    <GallerySection urls={Array.isArray(profile.photos) ? profile.photos : []} />
                  </Suspense>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            {Array.isArray(profile.interest) && profile.interest.length > 0 && (
              <section className="relative">
                {isLocked && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm text-purple-600 font-semibold underline"
                    >
                      Login to view interests
                    </button>
                  </div>
                )}
                <div className={isLocked ? 'blur-sm select-none' : ''}>
                  <Suspense fallback={<LoadingSpinner size="sm" />}>
                    <InterestsSection items={Array.isArray(profile.interest) ? profile.interest : []} />
                  </Suspense>
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-3 rounded-full shadow-lg hover:opacity-90"
        >
          Register / Login
        </button>
      </div>

      {showAuthModal && <LoginRegisterModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
