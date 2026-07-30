import {
  ArrowLeft,
  Users,
  Calendar,
  Image,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BottomNav from "../../../components/Layout/BottomNavigation";
import CreatePostModal from "../components/post/CreatePostModal";
import PostCard from "../components/post/PostCard";
import EditPostModal from "../components/post/EditPostModal";
import PostMeta from "../components/post/PostMeta";
import CommentSection from "../components/comment/CommentSection";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useCircle, useCircles } from "../hooks/useCircles";
import { useJoinCircle, useLeaveCircle } from "../hooks/useMembership";
import { usePosts, useUpdatePost, useDeletePost } from "../hooks/usePosts";
import { getPost } from "../api/postsApi";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import { useReportUser } from "../../UserHome/api";
import ReportUserModal from "../../UserHome/components/Modals/ReportUserModal";
import { queryKeys } from "../queries/queryKeys";
import { DEFAULT_AVATAR, getAuthorDisplayName } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";
import { CircleHeaderSkeleton, PostCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../../../shared/components/EmptyState";
import { toast } from "sonner";

export default function CircleDetailsPage() {
  const { t } = useTranslation("circles");
  const { circleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const queryClient = useQueryClient();

  const { data: fetchedCircle, isLoading } = useCircle(circleId);
  const { data: circlesData } = useCircles();
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(circleId);
  const { data: myProfile } = useMyProfile();
  const updatePostMutation = useUpdatePost(circleId);
  const deletePostMutation = useDeletePost(circleId);
  const { send: sendMatchRequest } = useSendMatchRequest();
  const { mutate: joinCircle, isPending: isJoining } = useJoinCircle();
  const { mutate: leaveCircle, isPending: isLeaving } = useLeaveCircle();
  const { mutate: reportUser } = useReportUser();

  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

  const isJoined = (circlesData?.circles || []).some(
    (c) => c.circleId === circleId
  );

  const data = fetchedCircle || location.state?.circleData;
  const posts = (postsData?.items || []).filter((p) => p.status !== "deleted");

  const isOwner = !!myId && myId === data?.ownerId;

  if (isLoading && !data) {
    return <CircleHeaderSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t("circleDetails.notFound")}</p>
      </div>
    );
  }

  const handleShareCircle = async () => {
    await shareLink({
      title: data.name,
      text: data.description || "",
      url: `${window.location.origin}/circles/${circleId}`,
      copiedMessage: t("common.linkCopied"),
      failedMessage: t("common.failedToShare"),
    });
  };

  const handleJoinCircle = () => {
    joinCircle(circleId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.circles });
        toast.success(t("circleDetails.joinedToast", { name: data.name }));
      },
      onError: () => {
        toast.error(t("circleDetails.joinFailedToast"));
      },
    });
  };

  const handleLeaveCircle = () => {
    leaveCircle(circleId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.circles });
        queryClient.invalidateQueries({ queryKey: queryKeys.circle(circleId) });
        toast.success(t("circleDetails.leftToast", { name: data.name }));
      },
      onError: () => {
        toast.error(t("circleDetails.leaveFailedToast"));
      },
    });
  };

  const handleSharePost = async (post) => {
    try {
      const { data: postDetail } = await getPost(circleId, post.createdAtEpoch, post.postId);
      const shareUrl = `${window.location.origin}/circles/${circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`;
      await shareLink({
        title: getAuthorDisplayName(postDetail) ? `${getAuthorDisplayName(postDetail)}'s post` : t("common.circlePost"),
        text: postDetail?.content || post.content || "",
        url: shareUrl,
        copiedMessage: t("common.linkCopied"),
        failedMessage: t("common.failedToShare"),
      });
    } catch (err) {
      console.error(err);
      toast.error(t("circleDetails.failedToShare"));
    }
  };

  const handleReportPost = (post) => {
    if (!post.authorId) return;
    setReportPost(post);
  };

  const toggleLike = (post) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(post.postId)) {
      newLiked.delete(post.postId);
    } else {
      newLiked.add(post.postId);
      if (post.authorId) {
        sendMatchRequest(post.authorId, {
          postId: post.postId,
          circleId,
          createdAtEpoch: post.createdAtEpoch,
        });
      }
    }
    setLikedPosts(newLiked);
  };

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts(circleId) });
  };

  const handleDeletePost = (post) => {
    setDeleteConfirm(post);
  };

  const handleSaveEdit = (payload) => {
    if (!editPost) return;
    updatePostMutation.mutate(
      { postId: editPost.postId, createdAtEpoch: editPost.createdAtEpoch, payload },
      { onSuccess: () => setEditPost(null) }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handlePostCreated}
        circleName={data.name}
        circleId={circleId}
        authorData={{ name: myProfile?.name, avatar: myProfile?.profilePhoto }}
      />

      <CommentSection
        isOpen={!!commentPost}
        onClose={() => setCommentPost(null)}
        post={commentPost}
      />

      {editPost && (
        <EditPostModal
          isOpen
          onClose={() => setEditPost(null)}
          post={editPost}
          circleId={circleId}
          circleName={data?.name}
          onSave={handleSaveEdit}
          isSaving={updatePostMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() =>
          deletePostMutation.mutate({
            postId: deleteConfirm.postId,
            createdAtEpoch: deleteConfirm.createdAtEpoch,
          })
        }
        title={t("circleDetails.deletePostTitle")}
        message={t("circleDetails.deletePostMessage")}
      />

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveCircle}
        title={t("circleDetails.leaveCircleTitle")}
        message={t("circleDetails.leaveCircleMessage")}
        confirmLabel={t("circleDetails.leaveCircle")}
      />

      <ReportUserModal
        open={!!reportPost}
        onClose={() => setReportPost(null)}
        username={reportPost?.authorId}
        sourceType="POST"
        sourceService="circle-service"
        sourceId={reportPost?.postId}
        circleId={circleId}
        onSubmit={(payload) => reportUser(payload)}
      />

      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-rose-400 to-orange-400">
        {data.coverPhoto && (
          <img
            src={data.coverPhoto}
            alt={data.name}
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Nav bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black/25 backdrop-blur-sm rounded-full active:bg-black/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Circle info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              {data.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            {data.name}
          </h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{t("common.membersCount", { count: data.memberCount ?? 0 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-3 -mt-4 relative z-10 space-y-3">

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex gap-2">
            {isJoined ? (
              <>
                <button
                  onClick={handleShareCircle}
                  className="flex-1 btn-filled rounded-xl py-2.5 text-sm"
                >
                  {t("circleDetails.share")}
                </button>
                {!isOwner && (
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    disabled={isLeaving}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    {isLeaving ? t("circleDetails.leaving") : t("circleDetails.leaveCircle")}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleJoinCircle}
                disabled={isJoining}
                className="flex-1 btn-filled rounded-xl py-3 disabled:opacity-60"
              >
                {isJoining ? t("circleDetails.joining") : t("circleDetails.joinCircle")}
              </button>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-2">{t("circleDetails.about")}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{data.description}</p>
          {data.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {data.createdDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("circleDetails.createdOn", { date: data.createdDate })}</span>
            </div>
          )}
        </div>

        {/* Rules */}
        {data.rules?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">{t("circleDetails.circleRules")}</h2>
            <div className="space-y-2.5">
              {data.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-600 text-sm leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <img
              src={myProfile?.profilePhoto || DEFAULT_AVATAR}
              alt={t("circleDetails.yourAvatarAlt")}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-400 text-sm transition-colors"
            >
              {t("circleDetails.shareSomething")}
            </button>
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Image className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">{t("common.photo")}</span>
            </button>
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">{t("circleDetails.post")}</span>
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-base font-bold text-gray-800">{t("circleDetails.posts")}</h2>
            {!isLoadingPosts && posts.length > 0 && (
              <span className="text-sm text-gray-400">{t("circleDetails.postsSuffix", { count: posts.length })}</span>
            )}
          </div>

          <div className="space-y-3">
            {isLoadingPosts && (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            )}

            {!isLoadingPosts && posts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm">
                <EmptyState
                  icon={MessageSquare}
                  title={t("circleDetails.noPostsYetTitle")}
                  subtitle={t("circleDetails.noPostsYetSubtitle")}
                  action={
                    <button
                      onClick={() => setIsCreatePostModalOpen(true)}
                      className="px-6 py-2.5 btn-filled text-sm rounded-full"
                    >
                      {t("circleDetails.createPost")}
                    </button>
                  }
                />
              </div>
            )}

            {posts.map((post) => {
              const isAuthor = !!myId && myId === post.authorId;

              return (
                <PostCard
                  key={post.postId}
                  variant="circle"
                  avatar={post.authorImage || DEFAULT_AVATAR}
                  name={getAuthorDisplayName(post) || t("common.anonymous")}
                  meta={<PostMeta post={post} />}
                  body={post.content}
                  media={post.media}
                  tags={post.tags || []}
                  isAuthor={isAuthor}
                  onEdit={() => setEditPost(post)}
                  onDelete={() => handleDeletePost(post)}
                  onShare={() => handleSharePost(post)}
                  onReport={() => handleReportPost(post)}
                  onAuthorClick={
                    post.authorId
                      ? () => navigate(`/profile/${post.authorId}`)
                      : undefined
                  }
                  actionsWrapperClassName={!isAuthor ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                  actions={buildPostActions({
                    isLiked: likedPosts.has(post.postId),
                    onToggleLike: () => toggleLike(post),
                    onComment: () => setCommentPost(post),
                    includeMatchActions: !isAuthor,
                  })}
                />
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
