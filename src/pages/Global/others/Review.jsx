import React from "react";

const StarRating = ({ rating }) => {
  return ( 
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= rating
              ? "text-pink-500 text-sm"
              : "text-gray-300 text-sm"
          }
        >
          ★ 
        </span>
      ))} 
    </div>
  );
};

const ReviewCard = ({ review }) => {
  return ( 
    <div className="bg-white rounded-2xl shadow-sm p-5 flex gap-4 border border-gray-100">
      {/* Avatar */}
      <div className="relative">
        <img
          src={review.profilePhoto}
          alt="user"
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          ♥
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Name + Meta */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">
              {review.displayName}
            </h3>
            <p className="text-xs text-gray-400">
              {review.city}, {review.country}
            </p>
          </div>

          <span className="text-xs text-gray-400">
            {review.timeAgo}
          </span>
        </div>

        {/* Rating */}
        <StarRating rating={review.rating} />

        {/* Text */}
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {review.text}
        </p>

        {/* Badge */}
        <div className="mt-3">
          <span className="text-xs bg-pink-50 text-pink-500 px-3 py-1 rounded-full">
            ✓ Verified Review
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ReviewsSection({ reviews, onMoreClick }) {
  return ( 
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        What our users say 💕
      </h2>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <ReviewCard key={r.reviewId} review={r} />
        ))}
      </div>

      {/* More Reviews Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onMoreClick}
          className="px-6 py-3 rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50 transition"
        >
          ✨ More reviews →
        </button>
      </div>``
    </div>
  );
}