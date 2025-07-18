import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { ConfirmationModal } from '../../components/Ui/Confirmation';
import { calculateAge } from '../../Utlis/utlis';

import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../features/UserProfile/thunks/profile';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.userProfile.currentUser);

  const PROFILE_BASE = 'https://userapi.terminal143.com/match/requests';
  const REQUEST_ACTION_URL = 'https://userapi.terminal143.com/match/requests/action';

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await axios.get(PROFILE_BASE, { withCredentials: true });
        setRequests(response.data.requests || []);
      } catch (err) {
        console.error('Error fetching match requests', err);
        setError('Could not load requests. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const confirmAction = async () => {
    const { senderUsername, action } = selectedRequest;

    if (!currentUser?.PK || !currentUser?.SK) {
      alert('User identity missing.');
      return;
    }

    try {
      await axios.post(
        REQUEST_ACTION_URL,
        {
          senderUsername,
          action,
          recipientPK: currentUser.PK,
          recipientSK: currentUser.SK,
        },
        { withCredentials: true }
      );

      setRequests((prev) =>
        prev.filter((r) => r.request.senderUsername !== senderUsername)
      );
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      alert(`Could not ${action} request. Please try again.`);
    } finally {
      setModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const openModal = (senderUsername, name, action) => {
    setSelectedRequest({ senderUsername, name, action });
    setModalOpen(true);
  };

  // --- UI Loading States ---
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading Requests...</h1>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl shadow p-4 bg-gray-50 flex gap-4 items-center">
              <Skeleton circle height={64} width={64} />
              <div className="flex-1 space-y-2">
                <Skeleton height={20} width="40%" />
                <Skeleton height={16} width="80%" />
                <Skeleton height={16} width="60%" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-center">{error}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold">No Requests Yet</h2>
            <p className="text-sm text-gray-500">You're all caught up.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="bg-white min-h-screen pb-24 flex flex-col">
      <TopNav />
      <div className="px-4 pt-4 flex-1">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Your Match Requests</h1>
        <div className="space-y-4">
          {requests.map(({ request, profile }) => (
            <div
              key={request.senderUsername}
              className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-start gap-4"
            >
              {profile?.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
              )}

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {profile?.name || request.senderUsername}
                  {profile?.dob && (
                    <span className="text-gray-500 text-sm ml-1">
                      ({calculateAge(profile.dob)})
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {profile?.bio || 'No bio available.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sent on: {new Date(request.sentAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <span className="text-xs text-blue-500 font-medium capitalize">{request.status}</span>
                {request.status === 'pending' && (
                  <div className="flex flex-col gap-2 mt-2 w-full">
                    <button
                      onClick={() =>
                        openModal(request.senderUsername, profile?.name || request.senderUsername, 'accept')
                      }
                      className="w-full px-4 py-2 text-sm rounded-xl text-white bg-gradient-to-r from-gradient-primary to-gradient-secondary shadow-md hover:opacity-90 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        openModal(request.senderUsername, profile?.name || request.senderUsername, 'reject')
                      }
                      className="w-full px-4 py-2 text-sm rounded-xl text-white bg-gradient-to-r from-pink-400 to-pink-500 shadow-md hover:opacity-90 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />

      {/* Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        action={selectedRequest?.action}
        name={selectedRequest?.name}
      />
    </div>
  );
}
