import React from 'react';
import { useParams } from 'react-router-dom';
import { Cake, MapPin, QrCode } from 'lucide-react';
import '@fontsource-variable/inter';
import { useProfileByLink } from '../../../Hooks/getProfileByLink';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

export default function PublicProfilePage() {
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;
  const { data: profile, isLoading, error } = useProfileByLink(profileLink);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center mt-10 text-red-500">{error.message}</div>;

  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f7f9fc] font-inter">
      {/* Cover Photo */}
      <div className="relative w-full h-80 bg-gray-100 overflow-hidden">
        <img
          src={profile.photo || profile.profilePhoto || '/default-avatar.jpg'}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Profile Card */}
      <div className="-mt-20 mx-4 bg-white rounded-3xl shadow-lg p-6 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 mt-1">
            {age} years {profile.location && `• ${profile.location}`}
          </p>

          {profile.qrCodeUrl && (
            <a
              href={`https://${profile.qrCodeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <QrCode size={16} /> View QR Code
            </a>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">About Me</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Gallery */}
        {profile.photos?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Gallery</h3>
            <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
              {profile.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Gallery ${i}`}
                  className="w-full h-28 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interest?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interest.map((item, i) => (
                <span
                  key={i}
                  className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full"
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
