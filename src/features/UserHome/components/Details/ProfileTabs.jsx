import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import DetailSection from "./Details";
import PostCard from "../../../Circles/components/post/PostCard";
import PostMeta from "../../../Circles/components/post/PostMeta";
import CommentSection from "../../../Circles/components/comment/CommentSection";
import { PostCardSkeleton, CircleChipSkeleton } from "../../../Circles/components/common/Skeletons";
import EmptyState from "../../../../shared/components/EmptyState";
import { useUserPosts } from "../../../Circles/hooks/usePosts";
import { useUserCircles } from "../../../Circles/hooks/useCircles";
import { DEFAULT_AVATAR } from "../../../Circles/utils/postDisplay";
import { buildPostActions } from "../../../Circles/utils/postActions";
import { shareLink } from "../../../Circles/utils/share";
import { useSendMatchRequest } from "../../../../Hooks/sendMatchRequest";

const PREVIEW_LIMIT = 5;

// Info/Posts tab switcher below the profile card (ProfileCard + the
// pass/refresh/like row above this are untouched — this only replaces what
// used to be a bare <DetailSection>). Posts are fetched lazily: nothing
// hits the API until the user actually switches to the Posts tab.
export default function ProfileTabs({ profile, authorId }) {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  // Which post's comment sheet is open — one shared sheet reused across the
  // list rather than one CommentSection instance per card.
  const [commentsPost, setCommentsPost] = useState(null);
  // Tracks which posts already had a match request sent via their heart
  // button this session — same pattern as CircleDetailsPage's likedPosts,
  // just local UI state for the filled-heart look, not a "like" concept.
  const [matchedPostIds, setMatchedPostIds] = useState(() => new Set());
  const { send: sendMatchRequest } = useSendMatchRequest();

  const {
    posts,
    isLoading,
    isError,
    refetch,
  } = useUserPosts(activeTab === "posts" ? authorId : null, { limit: PREVIEW_LIMIT });

  const {
    data: circlesData,
    isLoading: isLoadingCircles,
    isError: isCirclesError,
    refetch: refetchCircles,
  } = useUserCircles(activeTab === "circles" ? authorId : null, { limit: PREVIEW_LIMIT });
  const circles = circlesData?.circles || [];

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/circles/${post.circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`;
    await shareLink({
      title: t("myPosts.shareTitle", { circleName: post.circleName }),
      text: post.content || "",
      url: shareUrl,
      copiedMessage: t("common.linkCopied"),
      failedMessage: t("common.failedToShare"),
    });
  };

  // Every post here is by someone else (this tab only ever shows another
  // user's profile), so the heart button is always available — mirrors
  // CircleDetailsPage.jsx's toggleLike: the heart itself IS the "send a
  // match request via this post" action, not a like.
  const handleToggleMatch = (post) => {
    if (matchedPostIds.has(post.postId) || !post.authorId) return;
    setMatchedPostIds((prev) => new Set(prev).add(post.postId));
    sendMatchRequest(post.authorId, {
      postId: post.postId,
      circleId: post.circleId,
      createdAtEpoch: post.createdAtEpoch,
      onSuccess: () => toast.success(t("circlesHome.matchRequestSent")),
    });
  };

  return (
    <div className="px-1 pb-6">
      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "info"
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-400"
          }`}
        >
          {t("profileTabs.info")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "posts"
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-400"
          }`}
        >
          {t("profileTabs.posts")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("circles")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "circles"
              ? "bg-white text-gray-900 border border-gray-200"
              : "text-gray-400"
          }`}
        >
          {t("profileTabs.circles")}
        </button>
      </div>

      {activeTab === "info" && <DetailSection profile={profile} />}

      {activeTab === "posts" && (
        <div className="space-y-3 pt-1">
          {isLoading && (
            <>
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
              />
            </div>
          )}

          {!isLoading && !isError && posts.map((post) => (
            <PostCard
              key={`${post.circleId}-${post.postId}`}
              variant="circle"
              avatar={post.authorImage || DEFAULT_AVATAR}
              name={post.authorName || t("common.anonymous")}
              heading={post.circleName}
              onHeadingClick={() => navigate(`/circles/${post.circleId}`)}
              meta={<PostMeta post={post} />}
              body={post.content}
              media={post.media}
              tags={post.tags || []}
              onShare={() => handleShare(post)}
              actionsWrapperClassName="grid grid-cols-3 gap-2"
              actions={buildPostActions({
                isLiked: matchedPostIds.has(post.postId),
                onToggleLike: () => handleToggleMatch(post),
                onComment: () => setCommentsPost(post),
              })}
            />
          ))}

          {!isLoading && !isError && posts.length >= PREVIEW_LIMIT && (
            <button
              type="button"
              onClick={() => navigate(`/user/${authorId}/posts`)}
              className="w-full py-3 text-sm font-semibold text-primary"
            >
              {t("profileTabs.seeMore")}
            </button>
          )}
        </div>
      )}

      {activeTab === "circles" && (
        <div className="space-y-2.5 pt-1">
          {isLoadingCircles && (
            <>
              <CircleChipSkeleton />
              <CircleChipSkeleton />
            </>
          )}

          {isCirclesError && (
            <EmptyState
              title={t("myPosts.loadFailedTitle")}
              subtitle={t("myPosts.loadFailedBody")}
              action={
                <button
                  onClick={() => refetchCircles()}
                  className="px-6 py-2.5 btn-filled text-sm rounded-full"
                >
                  {t("circlesHome.retry")}
                </button>
              }
            />
          )}

          {/* Empty here means "no circles," "activity hidden," or
              "blocked" — the backend deliberately never distinguishes
              which (see listUserCircles.js), so this can't say which
              either. A generic empty state is the correct, private
              behavior, not a bug. */}
          {!isLoadingCircles && !isCirclesError && circles.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm">
              <EmptyState
                icon={Users}
                title={t("profileTabs.noCirclesTitle")}
              />
            </div>
          )}

          {!isLoadingCircles && !isCirclesError && circles.map((circle) => (
            <button
              key={circle.circleId}
              type="button"
              onClick={() => navigate(`/circles/${circle.circleId}`)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 text-left active:opacity-80 transition-opacity"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0 overflow-hidden">
                {circle.coverPhoto ? (
                  <img
                    src={circle.coverPhoto}
                    alt={circle.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  circle.name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{circle.name}</p>
                  {circle.visibility === "private" && (
                    <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {t("common.membersCount", { count: circle.memberCount ?? 0 })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Shared comment sheet — one instance reused across whichever post's
          Comment button was tapped. */}
      <CommentSection
        isOpen={!!commentsPost}
        onClose={() => setCommentsPost(null)}
        post={commentsPost}
      />
    </div>
  );
}
