import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../../components/Layout/BottomNavigation";
import { LoadingSpinner } from "../../../components/Ui/Spinner";
import PostCard from "../components/post/PostCard";
import PostMeta from "../components/post/PostMeta";
import CommentSection from "../components/comment/CommentSection";
import { usePost } from "../hooks/usePosts";
import { useCircle } from "../hooks/useCircles";
import { DEFAULT_AVATAR } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";

export default function PostDetailsPage() {
  const { t } = useTranslation("circles");
  const { circleId, postId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createdAtEpoch = searchParams.get("createdAtEpoch");

  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: post, isLoading } = usePost(circleId, postId, createdAtEpoch);
  const { data: circle } = useCircle(circleId);

  const handleShare = () =>
    shareLink({
      title: post?.authorName ? `${post.authorName}'s post` : t("common.circlePost"),
      text: post?.content || "",
      url: window.location.href,
      copiedMessage: t("common.linkCopied"),
      failedMessage: t("common.failedToShare"),
    });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500 bg-gray-50">
        <p>{t("postDetails.notFoundTitle")}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary font-semibold hover:underline"
        >
          {t("postDetails.goBack")}
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
            <h1 className="text-lg font-bold text-gray-800">{t("postDetails.header")}</h1>
            {(post.circleName || circle?.name) && (
              <p className="text-xs text-gray-500">
                {t("postDetails.inCircle")}
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
          name={post.authorName || t("common.anonymous")}
          meta={<PostMeta post={post} />}
          body={post.content}
          media={post.media}
          tags={post.tags || []}
          onShare={handleShare}
          onReport={() => alert(t("postDetails.postReportedAlert"))}
          actionsWrapperClassName="grid grid-cols-3 gap-2"
          actions={buildPostActions({
            isLiked,
            onToggleLike: () => setIsLiked((l) => !l),
            onComment: () => setShowComments(true),
          })}
        />
      </div>

      <BottomNav />
    </div>
  );
}
