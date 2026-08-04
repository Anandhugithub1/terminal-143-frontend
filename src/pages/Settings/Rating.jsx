import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageCircle, Loader2, User } from "lucide-react";
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
    5: "Excellent",
  };

  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1–5)");
      return;
    }

    if (text.trim().length < 5 || text.length > 300) {
      toast.error("Review must be 5–300 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitAppReview({
        rating,
        text: text.trim(),
        isAnonymous,
      });

      toast.success("Thank you for your feedback!");
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <PageHeader title="Rate the App" />

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Star size={26} className="text-primary" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              How was your experience?
            </h2>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-xs">
              Your feedback helps us improve PassorMatch
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-0.5 transition-transform active:scale-95 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={30}
                  className={
                    star <= (hoveredRating || rating)
                      ? "text-primary fill-primary"
                      : "text-gray-200"
                  }
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-semibold text-primary mt-2">
              {ratingLabels[rating]}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
            <MessageCircle size={16} className="text-primary" />
            Your review
          </label>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="What did you like or dislike? Share your honest feedback..."
            maxLength={300}
          />
          <div className="flex justify-between items-center mt-1.5">
            <p className="text-xs text-gray-400">
              {text.length === 0 ? "Min. 5 characters" : `${text.length}/300 characters`}
            </p>
            {text.length > 0 && text.length < 5 && (
              <p className="text-xs text-red-500">Need at least 5 characters</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <div>
              <span className="text-sm font-medium text-gray-700 block">
                Post anonymously
              </span>
              <span className="text-xs text-gray-400">
                Your name won't be displayed
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            aria-pressed={isAnonymous}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isAnonymous ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnonymous ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={submitReview}
            disabled={isSubmitting || rating === 0 || text.trim().length < 5}
            className="w-full bg-primary hover:opacity-90 text-white py-3.5 rounded-full font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
          {(rating === 0 || text.trim().length < 5) && (
            <p className="mt-3 text-center text-xs text-gray-400">
              {rating === 0 && "Please select a rating"}
              {rating === 0 && text.trim().length < 5 && " · "}
              {text.trim().length < 5 && "Please write at least 5 characters"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
