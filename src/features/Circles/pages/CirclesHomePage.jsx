import { AnimatePresence, motion } from "framer-motion";
import { Compass, MapPin, PenLine, Plus, Rss } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useSendMatchRequest } from "../../../Hooks/sendMatchRequest";
import BottomNav from "../../../components/Layout/BottomNavigation";
import TopNav from "../../../components/Layout/TopNavigation";
import CreateCircleModal from "../components/circle/CreateCircleModal";
import CreatePostModal from "../components/post/CreatePostModal";
import CommentSection from "../components/comment/CommentSection";
import PostCard from "../components/post/PostCard";
import PostMeta from "../components/post/PostMeta";
import PostSeenObserver from "../components/post/PostSeenObserver";
import BottomSheetModal from "../components/common/BottomSheetModal";
import { useCircles } from "../hooks/useCircles";
import { useFeed, usePosts } from "../hooks/usePosts";
import { useSeenTracker } from "../hooks/useSeenTracker";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { haversineDistanceKm, formatDistance } from "../utils/geo";
import { buildPostActions } from "../utils/postActions";
import { DEFAULT_AVATAR } from "../utils/postDisplay";
import { PostCardSkeleton, CircleAvatarSkeleton } from "../components/common/Skeletons";
import { queryKeys } from "../queries/queryKeys";

const RING_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-primary",
  "from-purple-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-orange-400 to-amber-500",
];

function StoryAvatar({ isActive, onClick, label, sublabel, children, gradientClass = "from-primary to-pink-500" }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform w-[4.5rem]"
    >
      <div
        className={`w-[3.75rem] h-[3.75rem] rounded-full p-[2.5px] transition-all duration-200 ${
          isActive
            ? `bg-gradient-to-br ${gradientClass} shadow-md`
            : "bg-gray-200"
        }`}
      >
        <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>
      <span className={`text-[11px] font-semibold truncate w-full text-center leading-tight ${isActive ? "text-primary" : "text-gray-500"}`}>
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-gray-400 truncate w-full text-center -mt-1">{sublabel}</span>
      )}
    </button>
  );
}

export default function CirclesHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isCirclePickerOpen, setIsCirclePickerOpen] = useState(false);
  const [postTargetCircle, setPostTargetCircle] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [selectedCircleId, setSelectedCircleId] = useState(null);

  const { data: circlesData, isLoading: isLoadingCircles } = useCircles();
  const myCircles = circlesData?.circles || [];

  const { data: feedData, isLoading: isLoadingFeed } = useFeed();
  const feed = (feedData?.posts || []).filter((p) => p.status !== "deleted");

  const { data: circlePostsData, isLoading: isLoadingCirclePosts } = usePosts(selectedCircleId);
  const circlePosts = (circlePostsData?.items || []).filter((p) => p.status !== "deleted");

  const firstCircleId =
    !isLoadingFeed && feed.length === 0 && !selectedCircleId
      ? myCircles[0]?.circleId
      : null;
  const { data: firstCirclePostsData } = usePosts(firstCircleId);
  const firstCirclePosts = (firstCirclePostsData?.items || [])
    .filter((p) => p.status !== "deleted")
    .slice(0, 5);

  const { data: myProfile } = useMyProfile();
  const myCoords = myProfile?.location?.coordinates;
  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

  const markPostSeen = useSeenTracker();
  const { send: sendMatchRequest } = useSendMatchRequest();

  if (!isLoadingCircles && myCircles.length === 0) {
    return <Navigate to="/circles/onboarding" replace />;
  }

  const selectedCircle = myCircles.find((c) => c.circleId === selectedCircleId) ?? null;

  const handlePickCircle = (circle) => {
    setPostTargetCircle(circle);
    setIsCirclePickerOpen(false);
    setIsCreatePostOpen(true);
  };

  const handlePostCreated = () => {
    setIsCreatePostOpen(false);
    if (postTargetCircle?.circleId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts(postTargetCircle.circleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Modals */}
      <CreateCircleModal isOpen={isCreateCircleOpen} onClose={() => setIsCreateCircleOpen(false)} />
      <CommentSection isOpen={!!commentPost} onClose={() => setCommentPost(null)} post={commentPost} />

      {/* Reddit-style circle picker */}
      <BottomSheetModal isOpen={isCirclePickerOpen} onClose={() => setIsCirclePickerOpen(false)}>
        <div className="px-4 pb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Post to a Circle
          </p>
          <div className="space-y-1">
            {myCircles.map((circle, index) => (
              <button
                key={circle.circleId}
                onClick={() => handlePickCircle(circle)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${RING_GRADIENTS[index % RING_GRADIENTS.length]}`}
                >
                  {circle.coverPhoto ? (
                    <img src={circle.coverPhoto} alt={circle.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {circle.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{circle.name}</p>
                  {circle.category && (
                    <p className="text-xs text-gray-400 truncate">{circle.category}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </BottomSheetModal>

      {postTargetCircle && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handlePostCreated}
          circleId={postTargetCircle.circleId}
          circleName={postTargetCircle.name}
        />
      )}

      <TopNav />

      {/* Sticky story strip */}
      <div className="sticky top-[65px] z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3" style={{ minWidth: "min-content" }}>

            {/* For You */}
            <StoryAvatar
              isActive={!selectedCircleId}
              onClick={() => setSelectedCircleId(null)}
              label="For You"
              gradientClass="from-primary to-pink-500"
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center ${!selectedCircleId ? "bg-gradient-to-br from-primary to-pink-400" : "bg-gray-100"}`}>
                <Rss className={`w-5 h-5 ${!selectedCircleId ? "text-white" : "text-gray-400"}`} />
              </div>
            </StoryAvatar>

            {isLoadingCircles && (
              <>{[...Array(3)].map((_, i) => <CircleAvatarSkeleton key={i} />)}</>
            )}

            {!isLoadingCircles && myCircles.map((circle, index) => {
              const isActive = selectedCircleId === circle.circleId;
              return (
                <StoryAvatar
                  key={circle.circleId}
                  isActive={isActive}
                  onClick={() => setSelectedCircleId(circle.circleId)}
                  label={circle.name}
                  gradientClass={RING_GRADIENTS[index % RING_GRADIENTS.length]}
                >
                  {circle.coverPhoto ? (
                    <img
                      src={circle.coverPhoto}
                      alt={circle.name}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${RING_GRADIENTS[index % RING_GRADIENTS.length]}`}>
                      <span className="text-base font-bold text-white">
                        {circle.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </StoryAvatar>
              );
            })}

            {/* Discover */}
            {!isLoadingCircles && (
              <>
                <StoryAvatar
                  isActive={false}
                  onClick={() => navigate("/circles/discover")}
                  label="Discover"
                >
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-gray-400" />
                  </div>
                </StoryAvatar>

                <StoryAvatar
                  isActive={false}
                  onClick={() => setIsCreateCircleOpen(true)}
                  label="New"
                >
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </StoryAvatar>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 space-y-3">

        {/* Inline create-post prompt */}
        <button
          onClick={() => setIsCirclePickerOpen(true)}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <img
            src={myProfile?.profilePhoto || DEFAULT_AVATAR}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <span className="flex-1 text-left text-sm text-gray-400 bg-gray-100 rounded-full px-4 py-2">
            What's on your mind?
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <PenLine className="w-4 h-4 text-primary" />
          </div>
        </button>

        {/* Section header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">
              {selectedCircle ? selectedCircle.name : "For You"}
            </h2>
            {!selectedCircleId && !isLoadingFeed && feed.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">· {feed.length} posts</span>
            )}
            {selectedCircleId && !isLoadingCirclePosts && circlePosts.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">· {circlePosts.length} posts</span>
            )}
          </div>
          {selectedCircle && (
            <button
              onClick={() => navigate(`/circles/${selectedCircleId}`, { state: { circleData: selectedCircle } })}
              className="text-xs btn-outlined px-3 py-1 rounded-full"
            >
              View circle
            </button>
          )}
        </div>

        {/* Feed — animated on tab switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCircleId ?? "foryou"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3 pb-4"
          >

            {/* ─── Circle tab ─── */}
            {selectedCircleId && (
              <>
                {isLoadingCirclePosts && (
                  <><PostCardSkeleton variant="feed" /><PostCardSkeleton variant="feed" /></>
                )}

                {!isLoadingCirclePosts && circlePosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <PenLine className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No posts yet</p>
                    <p className="text-xs text-gray-400 mb-5">Be the first to post in {selectedCircle?.name}</p>
                    <button
                      onClick={() => handlePickCircle(selectedCircle)}
                      className="px-5 py-2 btn-filled text-sm rounded-full shadow-sm"
                    >
                      Create a post
                    </button>
                  </div>
                )}

                {!isLoadingCirclePosts && circlePosts.map((post) => {
                  const isAuthor = !!myId && myId === post.authorId;
                  return (
                    <PostCard
                      key={post.postId}
                      variant="feed"
                      avatar={post.authorImage || DEFAULT_AVATAR}
                      name={post.authorName || "Anonymous"}
                      meta={<PostMeta post={post} />}
                      body={post.content}
                      media={post.media}
                      tags={post.tags || []}
                      onAuthorClick={post.authorId ? () => navigate(`/profile/${post.authorId}`) : undefined}
                      actionsWrapperClassName={!isAuthor ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                      actions={buildPostActions({
                        includeMatchActions: !isAuthor,
                        onComment: () => setCommentPost(post),
                        onToggleLike: () =>
                          sendMatchRequest(post.authorId, {
                            onSuccess: () => toast.success("Match request sent"),
                          }),
                      })}
                    />
                  );
                })}
              </>
            )}

            {/* ─── For You feed ─── */}
            {!selectedCircleId && (
              <>
                {isLoadingFeed && (
                  <><PostCardSkeleton variant="feed" /><PostCardSkeleton variant="feed" /></>
                )}

                {!isLoadingFeed && feed.length === 0 && (
                  <>
                    {/* Compact empty notice */}
                    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌱</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Your feed is quiet</p>
                          <p className="text-xs text-gray-400 mt-0.5">Join more circles to fill it up</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/circles/discover")}
                        className="text-xs btn-outlined px-3 py-1.5 rounded-full"
                      >
                        Discover
                      </button>
                    </div>

                    {/* Fallback — first circle posts */}
                    {firstCirclePosts.length > 0 && (
                      <>
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-sm font-bold text-gray-700">
                            Meanwhile in{" "}
                            <button
                              onClick={() => navigate(`/circles/${firstCircleId}`)}
                              className="text-primary"
                            >
                              {myCircles[0]?.name}
                            </button>{" "}✨
                          </p>
                          <button
                            onClick={() => navigate(`/circles/${firstCircleId}`)}
                            className="text-xs btn-outlined px-3 py-1 rounded-full"
                          >
                            See all
                          </button>
                        </div>
                        {firstCirclePosts.map((post) => (
                          <button
                            key={post.postId}
                            onClick={() =>
                              navigate(
                                `/circles/${firstCircleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`
                              )
                            }
                            className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 active:scale-[0.99] transition-transform"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={post.authorImage || DEFAULT_AVATAR}
                                alt=""
                                loading="lazy"
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-semibold text-gray-800 block truncate">
                                  {post.authorName || "Anonymous"}
                                </span>
                                {post.content && (
                                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                                    {post.content}
                                  </p>
                                )}
                              </div>
                              {post.media?.[0]?.url && (
                                <img
                                  src={post.media[0].url}
                                  alt=""
                                  loading="lazy"
                                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}

                {feed.map((post, index) => {
                  const distance =
                    myCoords && post.location?.coordinates
                      ? formatDistance(haversineDistanceKm(myCoords, post.location.coordinates))
                      : null;
                  const isLastPost = index === feed.length - 1;
                  const isAuthor = !!myId && myId === post.authorId;
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
                        onHeadingClick={post.circleId ? () => navigate(`/circles/${post.circleId}`) : undefined}
                        onAuthorClick={post.authorId ? () => navigate(`/profile/${post.authorId}`) : undefined}
                        media={post.media}
                        body={post.content}
                        tags={post.tags || []}
                        actionsWrapperClassName={!isAuthor ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                        actions={buildPostActions({
                          includeMatchActions: !isAuthor,
                          onComment: () => setCommentPost(post),
                          onToggleLike: () =>
                            sendMatchRequest(post.authorId, {
                              onSuccess: () => toast.success("Match request sent"),
                            }),
                          onPass: () => markPostSeen(post.postId, { immediate: isLastPost }),
                        })}
                      />
                    </PostSeenObserver>
                  );
                })}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
