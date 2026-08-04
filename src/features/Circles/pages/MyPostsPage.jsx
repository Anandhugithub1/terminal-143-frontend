import { ArrowLeft, MessageCircle, MessageSquare, MoreVertical, Pencil, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import BottomNav from "../../../components/Layout/BottomNavigation";
import PostMedia from "../components/post/PostMedia";
import EditPostModal from "../components/post/EditPostModal";
import CommentSection from "../components/comment/CommentSection";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useMyPosts, useUpdateMyPost, useDeleteMyPost } from "../hooks/usePosts";
import { useTranslatedCircleName } from "../constants/onboardingCircles";
import { formatPostTime } from "../utils/postDisplay";
import { shareLink } from "../utils/share";
import { PostCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../../../shared/components/EmptyState";

function MyPostCard({ post, circleName, t, onComment, onShare, onEdit, onDeleteMenu }) {
  const hasMedia = !!(post.media?.[0]?.url);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border-clr overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-2.5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-primary bg-primary/10 pl-2 pr-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {circleName}
          </span>
          <div className="text-xs text-gray-400 mt-1.5 tabular-nums">
            {formatPostTime(post.createdAtEpoch)}
          </div>
        </div>
        <button
          onClick={onDeleteMenu}
          className="p-1.5 -mr-1 rounded-full text-gray-400 hover:bg-gray-50 transition-colors shrink-0"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {post.content && (
        <p className="px-3.5 pb-3 text-sm text-gray-700 leading-relaxed">{post.content}</p>
      )}

      {hasMedia && <PostMedia media={post.media} alt={circleName} />}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3.5 pt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 px-2.5 py-1.5 mt-1.5 border-t border-gray-100">
        <button
          onClick={onComment}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {t("postCard.comment")}
        </button>
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          {t("postCard.share")}
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t("postCard.editPost")}
        </button>
      </div>
    </div>
  );
}

export default function MyPostsPage() {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const getCircleName = useTranslatedCircleName();

  const { data, isLoading, isError, refetch } = useMyPosts();
  const updatePostMutation = useUpdateMyPost();
  const deletePostMutation = useDeleteMyPost();

  const [editPost, setEditPost] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeCircleId, setActiveCircleId] = useState(null);

  const posts = (data?.items || []).filter((p) => p.status !== "deleted");

  const circleOptions = useMemo(() => {
    const byId = new Map();
    posts.forEach((p) => {
      if (!p.circleId) return;
      if (!byId.has(p.circleId)) {
        byId.set(p.circleId, {
          circleId: p.circleId,
          name: getCircleName(p.circleId, p.circleName),
          count: 0,
        });
      }
      byId.get(p.circleId).count += 1;
    });
    return [...byId.values()].sort((a, b) => b.count - a.count);
  }, [posts, getCircleName]);

  const visiblePosts = activeCircleId
    ? posts.filter((p) => p.circleId === activeCircleId)
    : posts;

  const handleSaveEdit = (payload) => {
    if (!editPost) return;
    updatePostMutation.mutate(
      { circleId: editPost.circleId, postId: editPost.postId, createdAtEpoch: editPost.createdAtEpoch, payload },
      {
        onSuccess: () => {
          setEditPost(null);
          toast.success(t("myPosts.postUpdated"));
        },
        onError: () => toast.error(t("myPosts.updateFailed")),
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    deletePostMutation.mutate(
      { circleId: deleteConfirm.circleId, postId: deleteConfirm.postId, createdAtEpoch: deleteConfirm.createdAtEpoch },
      {
        onSuccess: () => toast.success(t("myPosts.postDeleted")),
        onError: () => toast.error(t("myPosts.deleteFailed")),
      }
    );
  };

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/circles/${post.circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`;
    await shareLink({
      title: t("myPosts.shareTitle", { circleName: getCircleName(post.circleId, post.circleName) }),
      text: post.content || "",
      url: shareUrl,
      copiedMessage: t("common.linkCopied"),
      failedMessage: t("common.failedToShare"),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      {editPost && (
        <EditPostModal
          isOpen
          onClose={() => setEditPost(null)}
          post={editPost}
          circleId={editPost.circleId}
          circleName={getCircleName(editPost.circleId, editPost.circleName)}
          onSave={handleSaveEdit}
          isSaving={updatePostMutation.isPending}
        />
      )}

      <CommentSection
        isOpen={!!commentPost}
        onClose={() => setCommentPost(null)}
        post={commentPost}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title={t("myPosts.deletePostTitle")}
        message={t("myPosts.deletePostMessage")}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <div className="flex items-center gap-3 mb-3.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">{t("myPosts.header")}</h1>
              <p className="text-xs text-gray-400 truncate">{t("myPosts.subtitle")}</p>
            </div>
          </div>

          {!isLoading && !isError && posts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pb-3.5">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="text-lg font-bold text-gray-900 leading-tight tabular-nums">{posts.length}</div>
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                  {t("myPosts.statPosts")}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="text-lg font-bold text-gray-900 leading-tight tabular-nums">{circleOptions.length}</div>
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                  {t("myPosts.statCircles")}
                </div>
              </div>
            </div>
          )}
        </div>

        {!isLoading && !isError && circleOptions.length > 1 && (
          <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCircleId(null)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCircleId === null
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {t("myPosts.filterAll")} <span className="opacity-70 tabular-nums">{posts.length}</span>
            </button>
            {circleOptions.map((c) => (
              <button
                key={c.circleId}
                onClick={() => setActiveCircleId(c.circleId)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCircleId === c.circleId
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {c.name} <span className="opacity-70 tabular-nums">{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
        {isLoading && (
          <>
            <PostCardSkeleton variant="feed" />
            <PostCardSkeleton variant="feed" />
            <PostCardSkeleton variant="feed" />
          </>
        )}

        {isError && (
          <EmptyState
            title={t("myPosts.loadFailedTitle")}
            subtitle={t("myPosts.loadFailedBody")}
            action={
              <button
                onClick={() => refetch()}
                className="px-6 py-2.5 btn-filled text-sm rounded-full"
              >
                {t("circlesHome.retry")}
              </button>
            }
          />
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm px-6 py-14 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1.5">
              {t("myPosts.noPostsYetTitle")}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              {t("myPosts.noPostsYetSubtitle")}
            </p>
            <button
              onClick={() => navigate("/circles")}
              className="px-6 py-3 btn-filled text-sm rounded-full"
            >
              {t("myPosts.createFirstPost")}
            </button>
          </div>
        )}

        {!isLoading && !isError && visiblePosts.map((post) => (
          <MyPostCard
            key={`${post.circleId}-${post.postId}`}
            post={post}
            circleName={getCircleName(post.circleId, post.circleName)}
            t={t}
            onComment={() => setCommentPost(post)}
            onShare={() => handleShare(post)}
            onEdit={() => setEditPost(post)}
            onDeleteMenu={() => setDeleteConfirm(post)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
