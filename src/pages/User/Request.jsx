// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useMatchRequests } from '../../features/UserActions/api';
import { useMatchRequestResponse } from '../../features/UserActions/api';
import { useSelector } from 'react-redux';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import { ConfirmationModal } from '../../components/Ui/Confirmation';
import RequestItem from '../../features/UserActions/components/RequestItem';

export default function RequestsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.userProfile.currentUser);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  const { data: requests = [], isLoading, error } = useMatchRequests();
  const mutation = useMatchRequestResponse();

  const openModal = (request, profile, action) => {
    setSelectedRequest({
      ...request,
      name: profile?.name || request.senderUsername,
      action
    });
    setModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !currentUser) return;
  
    const { senderUsername, action, senderPK, senderSK } = selectedRequest;
    const recipientPK = currentUser?.PK;
    const recipientSK = currentUser?.SK;
  
    console.log("Sending match response payload:", {
      senderUsername,
      action,
      senderPK,
      senderSK,
      recipientPK,
      recipientSK,
    });
  
    // Track processing request
    setProcessingRequests(prev => new Set(prev).add(senderUsername));
  
    mutation.mutate(
      { senderUsername, action, senderPK, senderSK, recipientPK, recipientSK },
      {
        onSettled: () => {
          setProcessingRequests(prev => {
            const updated = new Set(prev);
            updated.delete(senderUsername);
            return updated;
          });
        }
      }
    );
  
    setModalOpen(false);
  };
  

  const renderContent = () => {
    if (isLoading) {
      return (
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
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-red-500 text-center">
            Could not load requests. Please try again later.
          </p>
        </div>
      );
    }

    if (!requests.length) {
      return (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold">No Requests Yet</h2>
            <p className="text-sm text-gray-500">You're all caught up.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 pt-4 flex-1">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Your Match Requests</h1>
        <div className="space-y-4">
          {requests.map(({ request, profile }) => (
            <RequestItem
              key={`${request.senderUsername}-${request.sentAt}`}
              request={request}
              profile={profile}
              openModal={openModal}
              isProcessing={processingRequests.has(request.senderUsername)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pb-24 flex flex-col">
      <TopNav />
      {renderContent()}
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