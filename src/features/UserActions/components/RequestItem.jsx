import React from 'react';
// import { formatDate } from '../../../Utlis/utlis';

const RequestItem = ({ request }) => (
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
    </div>
  </div>
);

export default RequestItem;
