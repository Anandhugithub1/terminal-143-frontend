// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useMatchRequests } from '../../UserActions/api';
import { useMatchRequestResponse } from '../../UserActions/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../UserProfile';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';
import { ConfirmationModal } from '../../../components/Ui/Confirmation';
import RequestItem from '../../UserActions/components/RequestItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function RequestsPage() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.userProfile.currentUser);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  // Destructure refetch to reload requests
  const { data: requests = [], isLoading, error, refetch } = useMatchRequests();
  const mutation = useMatchRequestResponse();

  // Ensure current user profile is loaded
  useEffect(() => {
    // 1. Fetch user profile if not present
    if (!currentUser) {
      dispatch(fetchProfile());
    }

    // 2. Handle axios auth error
    if (axios.isAxiosError(error)) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        console.warn('🔐 Unauthorized. Redirecting to /login...');
        navigate('/login');
      }
    }
  }, [currentUser, error, dispatch, navigate]);

  // Open confirmation modal
  const openModal = (request, profile, action) => {
    setSelectedRequest({
      senderUsername: request.senderUsername,
      senderPK: request.senderPK,
      senderSK: profile?.SK,
      name: profile?.name || request.senderUsername,
      action,
    });
    setModalOpen(true);
  };

  // Handle confirmation action
  const confirmAction = () => {
    if (!selectedRequest || !currentUser) return;

    const { senderUsername, action, senderPK, senderSK } = selectedRequest;
    const recipientPK = currentUser.PK;
    const recipientSK = currentUser.SK;

    // Log payload
    console.log('Sending match response payload:', {
      senderUsername,
      action,
      senderPK,
      senderSK,
      recipientPK,
      recipientSK,
    });

    // Track processing state
    setProcessingRequests((prev) => new Set(prev).add(senderUsername));

    mutation.mutate(
      { senderUsername, action, senderPK, senderSK, recipientPK, recipientSK },
      {
        onSettled: () => {
          // Refresh the requests list from server
          refetch();
          setProcessingRequests((prev) => {
            const updated = new Set(prev);
            updated.delete(senderUsername);
            return updated;
          });
        },
      }
    );

    setModalOpen(false);
  };

  // Render content based on state
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
          <p className="text-red-500 text-center">Could not load requests. Please try again later.</p>
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
