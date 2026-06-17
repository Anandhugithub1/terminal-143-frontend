import {
  Menu,
  Bell,
  Plus,
  Compass,
  MapPin,
  Rss,
} from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import BottomNav from "../../../components/Layout/BottomNavigation";
import Sidebar from "../components/layout/Sidebar";
import CreateCircleModal from "../components/circle/CreateCircleModal";
import CommentSection from "../components/comment/CommentSection";
import PostCard from "../components/post/PostCard";
import PostMeta from "../components/post/PostMeta";
import PostSeenObserver from "../components/post/PostSeenObserver";
import { useCircles } from "../hooks/useCircles";
import { useFeed } from "../hooks/usePosts";
import { useSeenTracker } from "../hooks/useSeenTracker";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { haversineDistanceKm, formatDistance } from "../utils/geo";
import { buildPostActions } from "../utils/postActions";
import { DEFAULT_AVATAR } from "../utils/postDisplay";
import { PostCardSkeleton, CircleAvatarSkeleton } from "../components/common/Skeletons";

const CIRCLE_BG_COLORS = [
  "bg-rose-50",
  "bg-blue-50",
  "bg-purple-50",
  "bg-green-50",
  "bg-orange-50",
];

export default function CirclesHomePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const { data: circlesData, isLoading: isLoadingCircles } = useCircles();
  const myCircles = circlesData?.circles || [];

  const { data: feedData, isLoading: isLoadingFeed } = useFeed();
  const feed = feedData?.posts || [];

  const { data: myProfile } = useMyProfile();
  const myCoords = myProfile?.location?.coordinates;

  const markPostSeen = useSeenTracker();
  const { send: sendMatchRequest } = useSendMatchRequest();

  if (!isLoadingCircles && myCircles.length === 0) {
    return <Navigate to="/circles/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <CommentSection
        isOpen={!!commentPost}
        onClose={() => setCommentPost(null)}
        post={commentPost}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border-clr px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-sec">Circles</h1>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              Find people, share interests, make real connections.
            </p>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative -mr-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 space-y-5">
        {/* My Circles - Horizontal scroll on mobile */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-sec">
              My Circles
              {!isLoadingCircles && myCircles.length > 0 && (
                <span className="ml-1.5 text-sm font-normal text-gray-400">({myCircles.length})</span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
            <div className="flex gap-3" style={{ minWidth: "min-content" }}>
              {isLoadingCircles && (
                <>
                  {[...Array(4)].map((_, i) => <CircleAvatarSkeleton key={i} />)}
                </>
              )}

              {!isLoadingCircles && myCircles.map((circle, index) => (
                <div
                  key={circle.circleId}
                  className="flex-shrink-0 w-20 text-center cursor-pointer active:scale-95 transition-transform"
                  onClick={() => navigate(`/circles/${circle.circleId}`, { state: { circleData: circle } })}
                >
                  <div
                    className={`${CIRCLE_BG_COLORS[index % CIRCLE_BG_COLORS.length]} rounded-2xl p-2.5 transition-all hover:shadow-md`}
                  >
                    {circle.coverPhoto ? (
                      <img
                        src={circle.coverPhoto}
                        alt={circle.name}
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 rounded-full object-cover mx-auto shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
                        <span className="text-lg font-bold text-text-sec">
                          {circle.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-text-sec mt-2 text-xs truncate">
                      {circle.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {circle.category}
                    </p>
                  </div>
                </div>
              ))}

              {!isLoadingCircles && (
              <>
              {/* Discover More Circles Card */}
              <div
                className="flex-shrink-0 w-20 text-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => navigate("/circles/discover")}
              >
                <div className="bg-gray-50 rounded-2xl p-2.5 transition-all hover:shadow-md border-2 border-dashed border-gray-200 h-full flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-text-sec mt-2 text-xs">
                    Discover
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Circles</p>
                </div>
              </div>

              {/* Create Circle Card */}
              <div
                className="flex-shrink-0 w-20 text-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <div className="bg-gray-50 rounded-2xl p-2.5 transition-all hover:shadow-md border-2 border-dashed border-gray-200 h-full flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-text-sec mt-2 text-xs">
                    Create
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Circle</p>
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        </section>

        {/* Feed Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Rss className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold text-text-sec">For You</h2>
            {!isLoadingFeed && feed.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({feed.length})</span>
            )}
          </div>

          <div className="space-y-4">
            {isLoadingFeed && (
              <>
                <PostCardSkeleton variant="feed" />
                <PostCardSkeleton variant="feed" />
              </>
            )}

            {!isLoadingFeed && feed.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Rss className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-sm mb-1">Nothing here yet</p>
                <p className="text-gray-400 text-xs">Posts from your circles will appear here. Try joining more circles!</p>
                <button
                  onClick={() => navigate("/circles/discover")}
                  className="mt-4 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full active:scale-95 transition-transform"
                >
                  Discover Circles
                </button>
              </div>
            )}

            {feed.map((post, index) => {
              const distance =
                myCoords && post.location?.coordinates
                  ? formatDistance(haversineDistanceKm(myCoords, post.location.coordinates))
                  : null;

              const isLastPost = index === feed.length - 1;
              const onSeen = (postId) => markPostSeen(postId, { immediate: isLastPost });

              return (
                <PostSeenObserver key={post.postId} postId={post.postId} onSeen={onSeen}>
                  <PostCard
                    variant="feed"
                    avatar={post.authorImage || DEFAULT_AVATAR}
                    name={post.authorName || "Anonymous"}
                    meta={
                      <PostMeta
                        post={post}
                        extra={
                          distance && (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {distance}
                            </span>
                          )
                        }
                      />
                    }
                    heading={post.circleName}
                    onHeadingClick={
                      post.circleId
                        ? () => navigate(`/circles/${post.circleId}`)
                        : undefined
                    }
                    onAuthorClick={
                      post.authorId
                        ? () => navigate(`/profile/${post.authorId}`)
                        : undefined
                    }
                    media={post.media}
                    body={post.content}
                    tags={post.tags || []}
                    actionsWrapperClassName="grid grid-cols-3 gap-2"
                    actions={buildPostActions({
                      onComment: () => setCommentPost(post),
                      onToggleLike: () => sendMatchRequest(post.authorId, {
                        onSuccess: () => toast.success("Match request sent"),
                      }),
                      onPass: () => markPostSeen(post.postId, { immediate: isLastPost }),
                    })}
                  />
                </PostSeenObserver>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
