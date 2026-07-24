// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useMatchRequestResponse, useMatchRequests } from '../api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import PageLayout from '../../../shared/components/PageLayout';
import EmptyState from '../../../shared/components/EmptyState';
import { ConfirmationModal } from '../../../components/Ui/Confirmation';
import RequestItem from '../components/Actions/RequestItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';


export default function RequestsPage() {
  const { t } = useTranslation('swipe');
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
            ? t('requests.accepted')
            : t('requests.rejected')
        );
        refetch();
      },
      onError: (err) => {
        console.error('Match request action failed', err);
        toast.error(t('requests.genericError'));
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
        <div className="flex-1 px-4 pt-5 space-y-3">
          <div className="h-7 w-40 bg-gray-200 rounded-full animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2.5 pt-1">
                  <div className="h-4 bg-gray-200 rounded-full w-2/5" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-9 bg-gray-100 rounded-full flex-1" />
                <div className="h-9 bg-primary/20 rounded-full flex-1" />
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
            {t('requests.couldNotLoad')}
          </p>
        </div>
      );
    }

    if (!requests.length) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState title={t('requests.noRequestsYetTitle')} subtitle={t('requests.noRequestsYetSubtitle')} />
        </div>
      );
    }

    return (
      <div className="flex-1">
        <div className="max-w-md w-full mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-900">{t('requests.pageTitle')}</h1>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          </div>

          <div className="space-y-3">
            {requests.map(({ request }, idx) => {
              if (!request?.senderUsername) return null;

              return (
                <div
                  key={`${request.senderUsername}-${request.sentAt || idx}`}
                  onClick={() =>
                    navigate(`/profile/${encodeURIComponent(request.senderUsername)}`, {
                      state: { fromRequest: true },
                    })
                  }
                  className="cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <RequestItem
                    request={request}
                    openModal={openModal}
                    isProcessing={processingRequests.has(request.senderUsername)}
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
    <PageLayout className="bg-gray-50">
      {renderContent()}

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        action={selectedRequest?.action}
        name={selectedRequest?.senderUsername}
      />
    </PageLayout>
  );
}
