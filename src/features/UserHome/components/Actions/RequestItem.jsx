import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../../../../Utlis/utlis";

const RequestItem = ({ request, openModal, isProcessing }) => {
  const { senderPhoto, senderName, age, bio, sentAt, status, interests, tags } = request;

  const chips = Array.isArray(interests) ? interests : Array.isArray(tags) ? tags : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {senderPhoto ? (
          <img
            src={senderPhoto}
            alt={senderName}
            className="w-20 h-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gray-100" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {senderName}{age ? <span className="font-normal text-gray-500">, {age}</span> : null}
            </h3>
            {sentAt && (
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(sentAt)}</p>
            )}
          </div>
          {status && (
            <span className="text-xs font-semibold text-primary capitalize bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              {status}
            </span>
          )}
        </div>

        {bio && (
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-snug">{bio}</p>
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {chips.slice(0, 3).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-medium"
              >
                {t}
              </span>
            ))}
            {chips.length > 3 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
                +{chips.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); openModal(request, "reject"); }}
            disabled={isProcessing}
            className="flex-1 rounded-full py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white active:bg-gray-50 transition disabled:opacity-50"
            aria-label={`Reject ${senderName}`}
          >
            {isProcessing ? "…" : "Reject"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openModal(request, "accept"); }}
            disabled={isProcessing}
            className="flex-1 rounded-full py-2 text-sm font-semibold bg-primary text-white active:bg-pink-600 transition shadow-sm disabled:opacity-60"
            aria-label={`Accept ${senderName}`}
          >
            {isProcessing ? "…" : "Accept"}
          </button>
        </div>
      </div>
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
