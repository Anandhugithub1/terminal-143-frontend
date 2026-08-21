import { ArrowLeft, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import BottomNav from "../../../components/Layout/BottomNavigation";
import PostCard from "../../Circles/components/post/PostCard";
import PostMeta from "../../Circles/components/post/PostMeta";
import CommentSection from "../../Circles/components/comment/CommentSection";
import { PostCardSkeleton } from "../../Circles/components/common/Skeletons";
import { useUserPosts } from "../../Circles/hooks/usePosts";
import { useCircle } from "../../Circles/hooks/useCircles";
import { DEFAULT_AVATAR } from "../../Circles/utils/postDisplay";
import { buildPostActions } from "../../Circles/utils/postActions";
import { shareLink } from "../../Circles/utils/share";
import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import EmptyState from "../../../shared/components/EmptyState";

const PAGE_SIZE = 20;

// Drill-down destination from ProfileTabs' Circles tab (Option A from the
// design review): the same infinite feed UserPostsListPage already fetches
// via useUserPosts, filtered client-side to one circle. This is a filter,
// not a separate backend query — listUserPosts.js merges every circle the
// author belongs to and sorts by recency before paginating, so the most
// recent page can legitimately contain zero posts for THIS circle while an
// older page has some; hasNextPage/fetchNextPage below are driven by the
// unfiltered cursor, so "load more" keeps working correctly under the filter.
export default function ProfileCirclePostsPage() {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const { pk: authorId, circleId } = useParams();
  const [commentsPost, setCommentsPost] = useState(null);
  const [matchedPostIds, setMatchedPostIds] = useState(() => new Set());
  const { send: sendMatchRequest } = useSendMatchRequest();

  const { data: circle, isLoading: isLoadingCircle } = useCircle(circleId);

  const {
    posts: allPosts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(authorId, { limit: PAGE_SIZE });

  const posts = useMemo(
    () => allPosts.filter((post) => post.circleId === circleId),
    [allPosts, circleId]
  );

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

  const loadMoreRef = useRef(null);
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      {/* Header — scoped to the circle, not just "this person's posts" */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          {isLoadingCircle ? (
            <Skeleton width={140} height={18} />
          ) : (
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                {circle?.coverPhoto ? (
                  <img
                    src={circle.coverPhoto}
                    alt={circle.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  circle?.name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">
                  {circle?.name || t("circleDetails.notFound")}
                </h1>
                <p className="text-xs text-gray-400 truncate">
                  {t("profileTabs.postsHere")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
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

        {!isLoading && !isError && posts.length === 0 && !hasNextPage && (
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

        {/* Fires while there's still an unfiltered page to load, even if
            every post filtered out of view so far belonged to other
            circles — see the component-level note on why this can't stop
            early just because `posts` (the filtered list) looks empty. */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && <Skeleton circle width={24} height={24} />}
          </div>
        )}
      </div>

      <CommentSection
        isOpen={!!commentsPost}
        onClose={() => setCommentsPost(null)}
        post={commentsPost}
      />

      <BottomNav />
    </div>
  );
}
