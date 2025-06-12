import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cake, MapPin, ChevronLeft } from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function PublicProfilePage() {
  const { profileLink } = useParams(); // URL param
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center mt-10 text-red-500">{error.message}</div>;

  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  return (
    <div className="flex flex-col min-h-screen bg-white font-inter">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-600">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-gray-800">Public Profile</h2>
        <div className="w-6" /> {/* placeholder for alignment */}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex flex-col items-center mt-6 text-center">
          <img
            src={profile.photo || profile.profilePhoto || '/default-avatar.jpg'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />

          <h1 className="mt-4 text-xl font-semibold text-gray-800">{profile.name}</h1>

          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 items-center mt-2 text-sm text-gray-500">
            {profile.location && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1 text-gradient-primary" />
                {profile.location}
              </div>
            )}
            <div className="flex items-center">
              <Cake size={14} className="mr-1 text-gradient-primary" />
              {age} years
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 px-6">
          <p className="text-sm text-gray-700 leading-6">
            {profile.bio || 'This user hasn’t added a bio yet.'}
          </p>
        </div>

        {/* Tags/Interests (optional) */}
        {profile.interests?.length > 0 && (
          <div className="mt-6 px-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
