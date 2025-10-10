/* ProfilePage.jsx */
import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate,useLocation } from 'react-router-dom';

import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';
import { Edit2, Share2, MapPin, Cake } from 'lucide-react';
import '@fontsource-variable/inter';
import { fetchProfile } from '../../../features/UserProfile';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaInstagram, FaFacebookF, FaTelegramPlane, FaLine, FaWeixin, FaGlobe } from 'react-icons/fa';

const socialIconMap = {
  IG: <FaInstagram className="text-pink-500" />,
  FB: <FaFacebookF className="text-blue-600" />,
  Telegram: <FaTelegramPlane className="text-blue-400" />,
  Line: <FaLine className="text-green-500" />,
  Wechat: <FaWeixin className="text-green-600" />,
  Other: <FaGlobe className="text-gray-600" />,
};


  const avatarimage ='https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg';


export default function ProfilePage() {
    const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // to read state passed from navigate()
  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const [retryCount, setRetryCount] = useState(0);

  const profileJustCompleted = location.state?.profileJustCompleted;

  useEffect(() => {
    if (status === 'idle' && !profile) {
      dispatch(fetchProfile());
    }


  }, [status, profile, dispatch, retryCount, profileJustCompleted]);
  // Skeleton loading state
  if (status !== 'succeeded') {
    return (
      <div className="flex flex-col h-screen bg-white font-inter">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col items-center mt-6">
            <Skeleton circle width={96} height={96} />
            <Skeleton width={120} height={24} className="mt-4" />
            <div className="flex items-center gap-3 mt-2">
              <Skeleton width={80} height={16} />
              <Skeleton width={40} height={16} />
            </div>
          </div>
          <div className="mt-6 text-center px-6">
            <Skeleton count={3} />
          </div>
          <div className="mt-8 flex flex-col gap-4 px-6">
            <Skeleton width="100%" height={48} />
            <Skeleton width="100%" height={48} />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : '—';

  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <TopNav />

      <main className="flex-1 overflow-y-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mt-6">
          <img
            src={profile.photo || profile.photos[0] || avatarimage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-border-clr"
          />

          <h1 className="mt-4 text-xl font-semibold">{profile.name}</h1>

          <div className="flex items-center gap-3 mt-2 text-sm text-text-sec">
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
        <div className="mt-6 text-center px-6">
          <p className="leading-5 text-sm">
            {profile.bio || 'Let your personality shine through your bio!'}
          </p>
        </div>

        {/* Social Media Links */}
        {Array.isArray(profile.socialMediaLinks) && profile.socialMediaLinks.length > 0 && (
  <div className="mt-6 px-6">
    <p className="text-sm font-semibold text-gray-700 mb-3"></p>
    <div className="space-y-3">
      {profile.socialMediaLinks
        .filter((link) => link.usernameOrLink?.trim())
        .map((link, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline break-all"
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {socialIconMap[link.platform] || <FaGlobe className="text-gray-500" />}
            </span>
            <a
              href={
                link.usernameOrLink.startsWith('http')
                  ? link.usernameOrLink
                  : `https://${link.platform.toLowerCase()}.com/${link.usernameOrLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="truncate"
            >
              {link.usernameOrLink}
            </a>
          </div>
        ))}
    </div>
  </div>
)}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 px-6">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full flex items-center justify-center px-6 py-3 bg-input border border-border-clr rounded-full text-sm font-medium text-text-sec hover:bg-focus-primary/10 transition"
          >
            <Edit2 size={16} className="inline-block mr-2 text-text-sec" />
            Edit Profile
          </button>
          {/* Show Share Profile only if usertype is not 'fm' */}
  {profile.userType !== 'fm' && (
    <button
      onClick={() => navigate('/share-qr')}
      className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white rounded-full text-sm font-medium hover:bg-gradient-to-r hover:from-gradient-primary hover:to-gradient-secondary transition"
    >
      <Share2 size={16} className="inline-block mr-2" />
      Share Profile
    </button>
  )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
