import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "../../../components/Layout/BottomNavigation";
import { LoadingSpinner } from "../../../components/Ui/Spinner";
import PostCard from "../components/post/PostCard";
import CommentSection from "../components/comment/CommentSection";
import { usePost } from "../hooks/usePosts";
import { useCircle } from "../hooks/useCircles";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

const formatPostTime = (epochMillis) => {
  if (!epochMillis) return "";

  const diffSec = Math.max(0, (Date.now() - epochMillis) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export default function PostDetailsPage() {
  const { circleId, postId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createdAtEpoch = searchParams.get("createdAtEpoch");

  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: post, isLoading } = usePost(circleId, postId, createdAtEpoch);
  const { data: circle } = useCircle(circleId);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: post?.authorName ? `${post.authorName}'s post` : "Circle post",
      text: post?.content || "",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Post link copied to clipboard");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500 bg-gray-50">
        <p>Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Comment Sheet */}
      <CommentSection
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        post={post}
      />

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Post</h1>
            {(post.circleName || circle?.name) && (
              <p className="text-xs text-gray-500">
                in{" "}
                <button
                  onClick={() => navigate(`/circles/${circleId}`)}
                  className="font-semibold text-primary hover:underline"
                >
                  {post.circleName || circle?.name}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Post */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <PostCard
          variant="circle"
          avatar={post.authorImage || DEFAULT_AVATAR}
          name={post.authorName || "Anonymous"}
          meta={
            <p className="text-xs text-gray-500">
              {formatPostTime(post.createdAtEpoch)}
              {post.location?.placeName && (
                <>
                  {" "}
                  • {post.location.placeName}
                  {post.location.countryCode ? `, ${post.location.countryCode}` : ""}
                </>
              )}
            </p>
          }
          body={post.content}
          media={post.media}
          tags={post.tags || []}
          actionsWrapperClassName="flex items-center gap-4"
          actions={[
            {
              key: "like",
              icon: Heart,
              label: (post.likes ?? 0) + (isLiked ? 1 : 0),
              onClick: () => setIsLiked((l) => !l),
              iconClassName: `w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`,
              className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors",
            },
            {
              key: "comment",
              icon: MessageCircle,
              label: post.commentCount ?? 0,
              onClick: () => setShowComments(true),
              iconClassName: "w-4 h-4",
              className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors",
            },
            {
              key: "share",
              icon: Share2,
              label: "Share",
              onClick: handleShare,
              iconClassName: "w-4 h-4",
              className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors ml-auto",
            },
          ]}
        />
      </div>

      <BottomNav />
    </div>
  );
}
