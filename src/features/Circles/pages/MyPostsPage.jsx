import { ArrowLeft, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import BottomNav from "../../../components/Layout/BottomNavigation";
import PostCard from "../components/post/PostCard";
import EditPostModal from "../components/post/EditPostModal";
import CommentSection from "../components/comment/CommentSection";
import PostMeta from "../components/post/PostMeta";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useMyPosts, useUpdateMyPost, useDeleteMyPost } from "../hooks/usePosts";
import { useTranslatedCircleName } from "../constants/onboardingCircles";
import { DEFAULT_AVATAR, getAuthorDisplayName } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";
import { PostCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../../../shared/components/EmptyState";

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

  const posts = (data?.items || []).filter((p) => p.status !== "deleted");

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
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{t("myPosts.header")}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
        {isLoading && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
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
          <div className="bg-white rounded-2xl shadow-sm">
            <EmptyState
              icon={MessageSquare}
              title={t("myPosts.noPostsYetTitle")}
              subtitle={t("myPosts.noPostsYetSubtitle")}
            />
          </div>
        )}

        {!isLoading && !isError && posts.map((post) => (
          <PostCard
            key={`${post.circleId}-${post.postId}`}
            variant="circle"
            avatar={post.authorImage || DEFAULT_AVATAR}
            name={getAuthorDisplayName(post) || t("common.anonymous")}
            heading={getCircleName(post.circleId, post.circleName)}
            onHeadingClick={() => navigate(`/circles/${post.circleId}`)}
            meta={<PostMeta post={post} />}
            body={post.content}
            media={post.media}
            tags={post.tags || []}
            isAuthor
            onEdit={() => setEditPost(post)}
            onDelete={() => setDeleteConfirm(post)}
            onShare={() => handleShare(post)}
            actionsWrapperClassName="grid grid-cols-1 gap-2"
            actions={buildPostActions({
              includeMatchActions: false,
              onComment: () => setCommentPost(post),
            })}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
