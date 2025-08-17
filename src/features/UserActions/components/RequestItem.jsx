import React from 'react';
// import { formatDate } from '../../../Utlis/utlis';

const RequestItem = ({ request, openModal, isProcessing }) => (
  <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-start gap-4">
    {request.senderPhoto ? (
      <img
        src={request.senderPhoto}
        alt={request.senderName}
        className="w-16 h-16 rounded-full object-cover"
      />
    ) : (
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
    )}

    <div className="flex-1">
      <h2 className="text-lg font-semibold text-gray-800">
        {request.senderName || request.senderUserName}
        {request.age && (
          <span className="text-gray-500 text-sm ml-1">
            ({request.age})
          </span>
        )}
      </h2>
      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
        {request.bio || 'No bio available.'}
      </p>

    </div>

    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <span className="text-xs text-blue-500 font-medium capitalize">
        {request.status}
      </span>
      {request.status === 'pending' && (
        <div className="flex flex-col gap-2 mt-2 w-full">
          <button
            onClick={() => openModal(request, 'accept')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm rounded-xl text-white bg-gradient-to-r from-gradient-primary to-gradient-secondary shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={() => openModal(request, 'reject')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm rounded-xl text-white bg-gradient-to-r from-pink-400 to-pink-500 shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default RequestItem;
