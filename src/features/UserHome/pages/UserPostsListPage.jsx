import { ArrowLeft, MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import BottomNav from "../../../components/Layout/BottomNavigation";
import PostCard from "../../Circles/components/post/PostCard";
import PostMeta from "../../Circles/components/post/PostMeta";
import { PostCardSkeleton } from "../../Circles/components/common/Skeletons";
import { useUserPosts } from "../../Circles/hooks/usePosts";
import { DEFAULT_AVATAR } from "../../Circles/utils/postDisplay";
import { shareLink } from "../../Circles/utils/share";
import EmptyState from "../../../shared/components/EmptyState";

const PAGE_SIZE = 20;

// "See more" destination from the profile Posts tab preview — full,
// paginated list of one user's posts across every circle they belong to.
export default function UserPostsListPage() {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const { pk: authorId } = useParams();

  const {
    posts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(authorId, { limit: PAGE_SIZE });

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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{t("profileTabs.posts")}</h1>
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
          />
        ))}

        {hasNextPage && (
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && <Skeleton circle width={24} height={24} />}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
