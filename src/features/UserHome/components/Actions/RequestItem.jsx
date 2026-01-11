// src/pages/components/Actions/RequestItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Coffee, Mountain } from 'lucide-react';
import { formatDate } from '../../../../Utlis/utlis';
import { toast } from 'sonner';

/**
 * ONLY LOGIC FIX:
 * - Stop click propagation on Accept / Reject buttons
 * - Prevent parent row navigation
 * - No UI or layout changes
 */

const ICONS = {
  Coffee: <Coffee size={14} className="text-gray-700" />,
  Adventures: <Mountain size={14} className="text-gray-700" />,
};

const RequestItem = ({ request, openModal, isProcessing }) => {
  const {
    senderPhoto,
    senderName,
    age,
    bio,
    sentAt,
    status,
    interests,
    tags,
  } = request;

  const chips = Array.isArray(interests)
    ? interests
    : Array.isArray(tags)
    ? tags
    : [];

  return (
    <div className="py-5 px-0">
      <div className="flex items-start gap-4 px-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {senderPhoto ? (
            <img
              src={senderPhoto}
              alt={senderName}
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {senderName}
                </h3>
                {age ? (
                  <span className="text-sm text-gray-500">, {age}</span>
                ) : null}
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {bio || 'No bio available.'}
              </p>

              {chips.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {chips.slice(0, 2).map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 border border-gray-100"
                    >
                      <span className="w-4 h-4 inline-flex items-center justify-center">
                        {ICONS[t] || null}
                      </span>
                      <span className="truncate">{t}</span>
                    </span>
                  ))}
                  {chips.length > 2 && (
                    <span className="text-sm text-gray-500 px-2 py-1 rounded-md bg-gray-100 border border-gray-100">
                      +{chips.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="text-right min-w-[72px]">
              {status && (
                <div className="text-xs text-blue-500 font-medium capitalize">
                  {status}
                </div>
              )}
              {sentAt && (
                <div className="text-xs text-gray-400 mt-2 whitespace-nowrap">
                  {formatDate(sentAt)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(request, 'reject');
                }}
                disabled={isProcessing}
                className={`w-full rounded-lg px-5 py-2 text-sm font-medium transition
                  ${
                    isProcessing
                      ? 'bg-white text-gray-400 border border-gray-200 cursor-wait opacity-60'
                      : 'bg-white text-gray-800 border border-gray-400 hover:shadow-sm'
                  }
                `}
                aria-label={`Reject ${senderName}`}
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(request, 'accept');
                }}
                disabled={isProcessing}
                className={`w-full rounded-lg px-6 py-2 text-sm font-semibold transition shadow-md
                  ${
                    isProcessing
                      ? 'bg-primary text-white cursor-wait opacity-80'
                      : 'bg-primary text-white hover:bg-pink-600'
                  }
                `}
                aria-label={`Accept ${senderName}`}
              >
                {isProcessing ? 'Processing...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-200" />
    </div>
  );
};

RequestItem.propTypes = {
  request: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
};

RequestItem.defaultProps = {
  isProcessing: false,
};

export default RequestItem;
