import {
  ArrowLeft,
  Users,
  Calendar,
  Image,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import CircleChatThread from "../components/chat/CircleChatThread";
import { useCircleChatPreviews } from "../hooks/useCircleChatPreviews";
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
import { useJoinCircle, useLeaveCircle, useRequestJoinCircle } from "../hooks/useMembership";
import { usePosts, useUpdatePost, useDeletePost } from "../hooks/usePosts";
import { useCircleMembers } from "../api/circleChatApi";
import { getPost } from "../api/postsApi";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import { useReportUser } from "../../UserHome/api";
import ReportUserModal from "../../UserHome/components/Modals/ReportUserModal";
import { queryKeys } from "../queries/queryKeys";
import { DEFAULT_AVATAR, getAuthorDisplayName } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { CircleHeaderSkeleton, PostCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../../../shared/components/EmptyState";
import { toast } from "sonner";

const MODERATOR_ROLES = ["owner", "moderator"];

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
  const [activeTab, setActiveTab] = useState("posts");
  const [moderateConfirm, setModerateConfirm] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");

  const { previews: circlePreviews } = useCircleChatPreviews();
  const chatUnreadCount = circlePreviews[circleId]?.unreadCount || 0;

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
  const { mutate: requestJoinCircle, isPending: isRequesting } = useRequestJoinCircle();
  const { mutate: reportUser } = useReportUser();

  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

  const isJoined = (circlesData?.circles || []).some(
    (c) => c.circleId === circleId
  );

  const data = fetchedCircle || location.state?.circleData;
  const posts = (postsData?.items || []).filter((p) => p.status !== "deleted");

  const isOwner = !!myId && myId === data?.ownerId;
  const isPrivate = data?.visibility === "private";

  // Membership roster only matters once we're actually a member (chat-service
  // 403s the whole endpoint otherwise) — role drives both the "Manage" entry
  // point and every post's per-card moderation affordance below.
  const { byUserId: membersByUserId } = useCircleMembers(isJoined ? circleId : null);
  const myRole = isOwner ? "owner" : membersByUserId.get(myId)?.role ?? null;
  const canModerate = MODERATOR_ROLES.includes(myRole);

  // Tracks a request already sent this session so the CTA flips to "pending"
  // without waiting on a dedicated GET — the backend has no "my request
  // status" endpoint, and re-deriving it from useCircleRequests would need
  // moderator role the requester doesn't have.
  const [justRequested, setJustRequested] = useState(false);

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

  const handleRequestJoin = () => {
    requestJoinCircle(
      { circleId, message: requestMessage.trim() },
      {
        onSuccess: (res) => {
          if (res?.data?.alreadyRequested) {
            toast.info(t("circleDetails.requestAlreadyPendingToast"));
          } else {
            toast.success(t("circleDetails.requestSentToast", { name: data.name }));
          }
          setJustRequested(true);
          setRequestMessage("");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "circleRequestFailed"));
        },
      }
    );
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

  // Moderator/owner removing someone else's post — same deletePost mutation
  // and endpoint as the author's own delete (the role check lives server-side
  // in deletePost.js), just a separate confirm copy so it reads as
  // moderation rather than "delete your own post."
  const handleModeratePost = (post) => {
    setModerateConfirm(post);
  };

  const handleSaveEdit = (payload) => {
    if (!editPost) return;
    updatePostMutation.mutate(
      { postId: editPost.postId, createdAtEpoch: editPost.createdAtEpoch, payload },
      { onSuccess: () => setEditPost(null) }
    );
  };

  return (
    <div
      className={
        activeTab === "chat"
          ? "flex flex-col h-[100dvh] bg-gray-50 overflow-hidden"
          : "min-h-[100dvh] bg-gray-50 pb-24"
      }
    >
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handlePostCreated}
        circleName={data.name}
        circleId={circleId}
        authorData={{ name: myProfile?.name, avatar: myProfile?.profilePhoto }}
        canAnnounce={canModerate}
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
        isOpen={!!moderateConfirm}
        onClose={() => setModerateConfirm(null)}
        onConfirm={() => {
          deletePostMutation.mutate(
            {
              postId: moderateConfirm.postId,
              createdAtEpoch: moderateConfirm.createdAtEpoch,
            },
            {
              onSuccess: () => {
                toast.success(t("circleDetails.postRemovedToast"));
                setModerateConfirm(null);
              },
              onError: (err) => {
                toast.error(getErrorMessage(err, "circleModerateFailed"));
              },
            }
          );
        }}
        title={t("circleDetails.removePostTitle")}
        message={t("circleDetails.removePostMessage")}
        confirmLabel={t("circleDetails.removePost")}
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
      <div className={`relative shrink-0 bg-gradient-to-br from-rose-400 to-orange-400 transition-all ${activeTab === "chat" ? "h-24" : "h-48 sm:h-64"}`}>
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
          {canModerate && activeTab === "posts" && (
            <button
              onClick={() => navigate(`/circles/${circleId}/manage`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/25 backdrop-blur-sm rounded-full text-white text-xs font-semibold active:bg-black/40 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("circleDetails.manage")}
            </button>
          )}
        </div>

        {/* Circle info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          {activeTab === "posts" && (
            <div className="flex items-end gap-2 mb-2">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                {data.category}
              </span>
            </div>
          )}
          <h1 className={`font-bold text-white leading-tight ${activeTab === "chat" ? "text-lg mb-0" : "text-2xl mb-2"}`}>
            {data.name}
          </h1>
          {activeTab === "posts" && (
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{t("common.membersCount", { count: data.memberCount ?? 0 })}</span>
              </div>
              {isPrivate && (
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t("circleDetails.privateBadge")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts | Chat tabs — flush under the hero as an underline control,
          not a floating card (see the design revision that replaced the
          original stacked-cards layout: chat is a peer view of the same
          circle, not a separate destination). */}
      <div className="flex bg-white border-b border-gray-100 relative z-10 shrink-0">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 text-center text-sm font-semibold py-2.5 border-b-2 transition-colors ${
            activeTab === "posts" ? "text-primary border-primary" : "text-gray-400 border-transparent"
          }`}
        >
          {t("circleDetails.postsTab")}
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 border-b-2 transition-colors ${
            activeTab === "chat" ? "text-primary border-primary" : "text-gray-400 border-transparent"
          }`}
        >
          {t("circleDetails.chatTab")}
          {chatUnreadCount > 0 && (
            <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "chat" ? (
        <CircleChatThread circleId={circleId} circleName={data.name} />
      ) : (
      <>
      {/* Main content */}
      <div className="max-w-3xl mx-auto px-3 -mt-4 relative z-10 space-y-3">

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-3">
          {isJoined ? (
            <div className="flex gap-2">
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
            </div>
          ) : isPrivate ? (
            justRequested ? (
              /* Pending state, not a dead end — no re-request button, just a
                 status banner, so it's unambiguous the request went through. */
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">{t("circleDetails.requestPendingTitle")}</p>
                  <p className="text-xs text-amber-700 mt-0.5">{t("circleDetails.requestPendingBody")}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={requestMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) setRequestMessage(e.target.value);
                  }}
                  placeholder={t("circleDetails.requestMessagePlaceholder")}
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                />
                <button
                  onClick={handleRequestJoin}
                  disabled={isRequesting}
                  className="w-full btn-filled rounded-xl py-3 disabled:opacity-60"
                >
                  {isRequesting ? t("circleDetails.requesting") : t("circleDetails.requestToJoin")}
                </button>
              </div>
            )
          ) : (
            <button
              onClick={handleJoinCircle}
              disabled={isJoining}
              className="w-full btn-filled rounded-xl py-3 disabled:opacity-60"
            >
              {isJoining ? t("circleDetails.joining") : t("circleDetails.joinCircle")}
            </button>
          )}
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

        {/* Private + not-joined: no create-post card, no post list — a
            gated circle never shows its feed to non-members, only the
            banner/description/member-count above already have. */}
        {!isJoined && isPrivate ? (
          <div className="bg-white rounded-2xl shadow-sm">
            <EmptyState
              icon={Lock}
              title={t("circleDetails.lockedFeedTitle")}
              subtitle={t("circleDetails.lockedFeedBody")}
            />
          </div>
        ) : (
          <>
        {/* Create Post Card */}
        {isJoined && (
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
        )}

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
                    isJoined && (
                      <button
                        onClick={() => setIsCreatePostModalOpen(true)}
                        className="px-6 py-2.5 btn-filled text-sm rounded-full"
                      >
                        {t("circleDetails.createPost")}
                      </button>
                    )
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
                  canModerate={canModerate}
                  onModerate={() => handleModeratePost(post)}
                  isAnnouncement={post.postType === "announcement"}
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
        </>
        )}
      </div>
      </>
      )}

      {activeTab === "posts" && <BottomNav />}
    </div>
  );
}
