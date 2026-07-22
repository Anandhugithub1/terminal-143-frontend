import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import DetailSection from "./Details";
import PostCard from "../../../Circles/components/post/PostCard";
import PostMeta from "../../../Circles/components/post/PostMeta";
import { PostCardSkeleton } from "../../../Circles/components/common/Skeletons";
import EmptyState from "../../../../shared/components/EmptyState";
import { useUserPosts } from "../../../Circles/hooks/usePosts";
import { DEFAULT_AVATAR } from "../../../Circles/utils/postDisplay";
import { shareLink } from "../../../Circles/utils/share";

const PREVIEW_LIMIT = 5;

// Info/Posts tab switcher below the profile card (ProfileCard + the
// pass/refresh/like row above this are untouched — this only replaces what
// used to be a bare <DetailSection>). Posts are fetched lazily: nothing
// hits the API until the user actually switches to the Posts tab.
export default function ProfileTabs({ profile, authorId }) {
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const {
    posts,
    isLoading,
    isError,
    refetch,
  } = useUserPosts(activeTab === "posts" ? authorId : null, { limit: PREVIEW_LIMIT });

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
    <div className="-mt-12 px-1 pb-6">
      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "info" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("profileTabs.info")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "posts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("profileTabs.posts")}
        </button>
      </div>

      {activeTab === "info" ? (
        <DetailSection profile={profile} />
      ) : (
        <div className="space-y-3">
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
    </div>
  );
}
