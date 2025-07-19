// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useMatchRequests } from '../../features/UserActions/api';
import { useMatchRequestResponse } from '../../features/UserActions/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { ConfirmationModal } from '../../components/Ui/Confirmation';
import { calculateAge } from '../../Utlis/utlis';

export default function RequestsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: requests, isLoading, error } = useMatchRequests();
  const mutation = useMatchRequestResponse();

  const openModal = (request, profile, action) => {
    setSelectedRequest({ ...request, name: profile?.name || request.senderUsername });
    setModalOpen(true);
  };

  const confirmAction = () => {
    const { senderUsername, action, senderPK, senderSK, recipientPK, recipientSK } = selectedRequest;
    mutation.mutate({ senderUsername, action, senderPK, senderSK, recipientPK, recipientSK });
    setModalOpen(false);
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
          <p className="text-red-500 text-center">Could not load requests. Please try again later.</p>
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
                    <span className="text-gray-500 text-sm ml-1">({calculateAge(profile.dob)})</span>
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
                  <div className="flex flex-col gap-2 mt-2 w-full">`
                    <button
                      onClick={() => openModal(request, profile, 'accept')}
                      className="w-full px-4 py-2 text-sm rounded-xl text-white bg-gradient-to-r from-gradient-primary to-gradient-secondary shadow-md hover:opacity-90 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => openModal(request, profile, 'reject')}
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
