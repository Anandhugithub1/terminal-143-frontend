/* ========== UserHomePage.jsx ========= */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles } from '../../Redux/Profile/slice';
import ProfileCard from '../../components/Cards/ProfileCard';
import BottomNav from '../../components/Layout/BottomNavigation';
import TopNav from '../../components/Layout/TopNavigation';
import { DetailSection } from '../../components/User_Home/Details';
import { ActionControls } from '../../components/User_Home/LocationBar';
import AlertMessage from '../../components/Ui/Alerts';
import axios from 'axios';

const placeholderImage = '/images/placeholder.png';

export default function UserHomePage() {
  const dispatch = useDispatch();
  const { list: profiles, status, error } = useSelector((state) => state.profiles);
  const [idx, setIdx] = useState(0);
  const [requestError, setRequestError] = useState('');

  const accessToken = localStorage.getItem('accessToken');
  const userType = localStorage.getItem('userType');
  const idToken = localStorage.getItem('idToken');
  const preferences = useMemo(() => ['F'], []);

  // Only fetch once when status is 'idle'
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles({ preferences, accessToken, userType, idToken }));
    }
  }, [status, dispatch, preferences, accessToken, userType, idToken]);

  const profile = profiles[idx] || {};

  const handleConnect = async (recipientUserId) => {
    try {
      await axios.post(
        'http://localhost:4000/api/request/',
        { recipientUserId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-user-type': userType,
            'x-id-token': idToken,
          },
        }
      );
      setIdx((i) => Math.min(i + 1, profiles.length - 1));
      setRequestError('');
    } catch (err) {
      setRequestError(err.response?.data?.error || 'Unable to send request.');
    }
  };

  // Refresh handler resets status to 'idle' before dispatching
  const handleRefresh = () => {
    if (status !== 'loading') {
      dispatch({ type: 'profiles/resetStatus' }); // add reducer to handle this
      dispatch(fetchProfiles({ preferences, accessToken, userType, idToken }));
    }
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (status === 'loading') return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />
      {requestError && (
        <div className="px-4 mt-4">
          <AlertMessage
            message={requestError}
            type="error"
            isVisible={!!requestError}
            onClose={() => setRequestError('')}
          />
        </div>
      )}
      <ProfileCard
        profile={profile}
        placeholderImage={placeholderImage}
        onConnectClick={() => handleConnect(profile.userId)}
        onMessageClick={() => console.log('Message clicked for', profile.name)}
      />
      <ActionControls
        onReject={() => setIdx((i) => Math.min(i + 1, profiles.length - 1))}
        onRefresh={handleRefresh}
        onLike={() => setIdx((i) => Math.min(i + 1, profiles.length - 1))}
      />
      <DetailSection profile={profile} />
      <BottomNav />
    </div>
  );
}
