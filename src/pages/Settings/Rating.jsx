import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, FileText, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function ReviewPage() {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1–5)");
      return;
    }

    if (text.trim().length < 5 || text.length > 300) {
      toast.error("Review must be 5–300 characters");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate async operation
    setTimeout(() => {
      const reviewData = {
        rating,
        text: text.trim(),
        isAnonymous,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Review submitted (no API call):", reviewData);
      toast.success("Review submitted successfully");
      setIsSubmitting(false);
      navigate(-1);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center px-4 py-4 bg-white border-b shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="ml-2 text-xl font-semibold">Rate the App</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          {/* Rating */}
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold mb-3">How was your experience?</h2>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    className={
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="mb-6">
            <label className="text-sm font-medium flex items-center gap-2 mb-1.5">
              <FileText size={16} />
              Your Review
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Write your experience (5–300 characters)"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {text.length}/300
            </p>
          </div>

          {/* Anonymous */}
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-sm">
              <User size={16} />
              Post anonymously
            </span>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            onClick={submitReview}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-white text-white py-3.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}