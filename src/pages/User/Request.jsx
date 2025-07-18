import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';

// Utility to calculate age from DOB (ISO date string)
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const PROFILE_BASE = 'https://userapi.terminal143.com/match/requests';
  const REQUEST_ACTION_URL = 'https://userapi.terminal143.com/match/requests/action';

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

  const handleAction = async (senderUsername, action) => {
    try {
      await axios.post(
        REQUEST_ACTION_URL,
        { senderUsername, action },
        { withCredentials: true }
      );
      setRequests((prev) =>
        prev.filter((r) => r.request.senderUsername !== senderUsername)
      );
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      alert(`Could not ${action} request. Please try again.`);
    }
  };

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

  return (
    <div className="bg-white min-h-screen pb-24 flex flex-col">
      <TopNav />
      <div className="px-4 pt-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">Your Match Requests</h1>
        <div className="space-y-4">
          {requests.map(({ request, profile }) => (
            <div
              key={request.senderUsername}
              className="bg-white rounded-2xl p-4 shadow border border-gray-100 flex items-start gap-4"
            >
              {/* Profile Photo */}
              {profile?.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
              )}

              {/* Profile Info */}
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

              {/* Actions */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-blue-500 font-medium capitalize">{request.status}</span>
                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAction(request.senderUsername, 'accept')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(request.senderUsername, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
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
    </div>
  );
}
