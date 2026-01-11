// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useMatchRequestResponse, useMatchRequests } from '../api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../../components/Layout/TopNavigation';
import BottomNav from '../../../components/Layout/BottomNavigation';
import { ConfirmationModal } from '../../../components/Ui/Confirmation';
import RequestItem from '../components/Actions/RequestItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';


export default function RequestsPage() {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  const { data: requests = [], isLoading, error, refetch } = useMatchRequests();
  const mutation = useMatchRequestResponse();

  // Ensure current user profile is loaded
  useEffect(() => {
    if (axios.isAxiosError(error)) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        navigate('/login');
      }
    }
  }, [error, navigate]);

  // Open confirmation modal
  const openModal = (request, action) => {
    if (!request?.senderUsername) return;

    setSelectedRequest({
      senderUsername: request.senderUsername,
      action,
    });
    setModalOpen(true);
  };

  // Handle confirmation action
const confirmAction = () => {
  if (!selectedRequest) return;

  const { senderUsername, action } = selectedRequest;

  setProcessingRequests(prev => {
    const next = new Set(prev);
    next.add(senderUsername);
    return next;
  });

  mutation.mutate(
    { senderUsername, action },
    {
      onSuccess: () => {
        toast.success(
          action === 'accept'
            ? 'Match request accepted'
            : 'Match request rejected'
        );
        refetch();
      },
      onError: (err) => {
        console.error('Match request action failed', err);
        toast.error('Something went wrong. Please try again.');
      },
      onSettled: () => {
        setProcessingRequests(prev => {
          const next = new Set(prev);
          next.delete(senderUsername);
          return next;
        });
      },
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
            <div
              key={i}
              className="rounded-xl shadow p-4 bg-gray-50 flex gap-4 items-center"
            >
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
      <div className="flex-1 bg-white pb-28">
        <div className="max-w-md w-full mx-auto px-4 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
            Your Match Requests
          </h1>

          <div className="divide-y divide-gray-200">
            {requests.map(({ request }, idx) => {
              if (!request?.senderUsername) return null;

              const handleClick = () => {
                navigate(
                  `/profile/${encodeURIComponent(request.senderUsername)}`
                );
              };

              return (
                <div
                  key={`${request.senderUsername}-${request.sentAt || idx}`}
                  onClick={handleClick}
                  className="cursor-pointer hover:bg-gray-50 transition"
                >
                  <RequestItem
                    request={request}
                    openModal={openModal}
                    isProcessing={processingRequests.has(
                      request.senderUsername
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 flex flex-col">
      <TopNav />
      {renderContent()}
      <BottomNav />

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        action={selectedRequest?.action}
        name={selectedRequest?.senderUsername}
      />
    </div>
  );
}
