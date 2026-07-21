import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, FileText, Loader2, User, Check, Sparkles, ThumbsUp, MessageCircle } from "lucide-react";
import PageHeader from '../../shared/components/PageHeader';
import { toast } from "sonner";
import { submitAppReview } from "./api";

export default function ReviewPage() {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent"
  };

  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1–5)", {
        icon: "⭐",
        position: "top-center",
      });
      return;
    }

    if (text.trim().length < 5 || text.length > 300) {
      toast.error("Review must be 5–300 characters", {
        icon: "📝",
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitAppReview({
        rating,
        text: text.trim(),
        isAnonymous,
      });

      toast.success("Thank you for your feedback! 🎉", {
        icon: "❤️",
        position: "top-center",
      });
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      toast.error(error.message || "Failed to submit review", {
        icon: "⚠️",
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <PageHeader
        title="Rate the App"
        className="sticky top-0 z-10 backdrop-blur-md bg-white/90 border-gray-200/50 shadow-sm"
      />

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-300 to-primary rounded-2xl shadow-lg mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Share Your Experience
          </h2>
          <p className="text-gray-500 text-sm">
            Your feedback helps us improve and grow better
          </p>
        </div>

        <div className="space-y-4">
          {/* Rating Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <ThumbsUp size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-800">
                  How was your experience?
                </h3>
              </div>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-3 my-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transform transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star
                      size={40}
                      className={`transition-all duration-200 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Label */}
              {rating > 0 && (
                <div className="animate-fade-in">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 rounded-full text-sm font-medium">
                    {ratingLabels[rating]}
                    {rating === 5 && " 🎉"}
                    {rating === 4 && " 👍"}
                    {rating === 3 && " 🙂"}
                    {rating === 2 && " 😕"}
                    {rating === 1 && " 😔"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review Text Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <MessageCircle size={18} className="text-primary" />
              Your Review
              <span className="text-xs text-gray-400 font-normal">(Required)</span>
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="What did you like or dislike? Share your honest feedback..."
              maxLength={300}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">
                {text.length === 0 ? "Min. 5 characters" : `${text.length}/300 characters`}
              </p>
              {text.length > 0 && text.length < 5 && (
                <p className="text-xs text-orange-500">Need at least 5 characters</p>
              )}
            </div>
          </div>

          {/* Anonymous Toggle Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-200 ${isAnonymous ? 'bg-gray-100' : 'bg-blue-50'}`}>
                  <User size={18} className={isAnonymous ? 'text-gray-500' : 'text-primary'} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">
                    Post anonymously
                  </span>
                  <span className="text-xs text-gray-400">
                    Your name won't be displayed
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  isAnonymous ? 'bg-gray-400' : 'bg-primary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                    isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Preview Card (when text is entered) */}
          {text.length >= 5 && rating > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Check size={16} className="text-green-500" />
                <p className="text-xs font-medium text-gray-600">Preview</p>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                "{text.length > 60 ? text.substring(0, 60) + "..." : text}"
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
      
            <button
  onClick={submitReview}
  disabled={isSubmitting || rating === 0 || text.trim().length < 5}
  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
>
  {isSubmitting ? (
    <>
      <Loader2 size={20} className="animate-spin" />
      Submitting...
    </>
  ) : (
    <>
      <Sparkles size={18} />
      Submit Review
    </>
  )}
</button>
            {/* Validation Hints */}
            {(rating === 0 || text.trim().length < 5) && (
              <div className="mt-4 text-center text-xs text-gray-400 animate-fade-in">
                {rating === 0 && "⭐ Please select a rating"}
                {rating === 0 && text.trim().length < 5 && " • "}
                {text.trim().length < 5 && "📝 Please write at least 5 characters"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}