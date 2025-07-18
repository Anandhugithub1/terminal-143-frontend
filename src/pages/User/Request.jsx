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



  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await axios.get(PROFILE_BASE);
        // Expecting { requests: [ { request: {...}, profile: {...} } ] }
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

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading Requests...</h1>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-md p-4 bg-gray-50 flex flex-col gap-2"
            >
              <Skeleton height={20} width="40%" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={16} width="60%" />
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
          <p className="text-red-500">{error}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
            <h2 className="text-lg font-bold">No Requests Yet</h2>
            <p className="text-sm text-gray-500">You have no requests.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20 flex flex-col">
      <TopNav />
      <div className="px-4 pt-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">Your Match Requests</h1>
        <div className="grid grid-cols-1 gap-6">
          {requests.map(({ request, profile }) => (
            <div
              key={request.senderUsername}
              className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 transition hover:shadow-lg flex flex-col sm:flex-row items-center gap-4"
            >
              {/* Profile photo */}
              {profile?.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full" />
              )}

              {/* Profile info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {profile?.name || request.senderUsername}, {profile?.dob ? calculateAge(profile.dob) : ''}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {profile?.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Request status and actions */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Sent at: {new Date(request.sentAt).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium text-blue-600 capitalize">
                  {request.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
