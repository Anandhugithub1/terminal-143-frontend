import { AnimatePresence, motion } from "framer-motion";
import { Compass, FileText, MapPin, PenLine, Plus, Rss } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
import CircleSearchBar from "../components/circle/CircleSearchBar";
import { useCircles } from "../hooks/useCircles";
import { useFeed, usePosts } from "../hooks/usePosts";
import { listPosts } from "../api/postsApi";
import { useSeenTracker } from "../hooks/useSeenTracker";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { useMatches } from "../../UserHome/api";
import { haversineDistanceKm, formatDistance } from "../utils/geo";
import { buildPostActions } from "../utils/postActions";
import { DEFAULT_AVATAR, getAuthorDisplayName } from "../utils/postDisplay";
import { shareLink } from "../utils/share";
import { PostCardSkeleton, CircleAvatarSkeleton } from "../components/common/Skeletons";
import { queryKeys } from "../queries/queryKeys";
import EmptyState from "../../../shared/components/EmptyState";
import { AlertTriangle } from "lucide-react";

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
  const { t } = useTranslation("circles");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isCirclePickerOpen, setIsCirclePickerOpen] = useState(false);
  const [postTargetCircle, setPostTargetCircle] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [selectedCircleId, setSelectedCircleId] = useState(null);

  const { data: circlesData, isLoading: isLoadingCircles, isError: isCirclesError, refetch: refetchCircles } = useCircles();
  const myCircles = circlesData?.circles || [];
  // Lets search results badge the circles you're already in.
  const joinedCircleIds = new Set(myCircles.map((c) => c.circleId));

  const { data: feedData, isLoading: isLoadingFeed } = useFeed();
  const feed = (feedData?.posts || []).filter((p) => p.status !== "deleted");

  const { data: circlePostsData, isLoading: isLoadingCirclePosts } = usePosts(selectedCircleId);
  const circlePosts = (circlePostsData?.items || []).filter((p) => p.status !== "deleted");

  const { data: myProfile } = useMyProfile();
  const myCoords = myProfile?.location?.coordinates;
  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

  // Usernames the current user has already matched with. A match's PK is the
  // other user's username — the same identifier a post carries as authorId —
  // so we can use this set to hide Match/Pass on those authors' posts (you
  // can't re-match someone you're already matched with). Normalized to bare
  // usernames to be robust against a stray USER# prefix on either side.
  const { data: matches } = useMatches();
  const matchedUserIds = useMemo(
    () =>
      new Set(
        (matches || []).map((m) => String(m.PK || "").replace(/^USER#/, ""))
      ),
    [matches]
  );
  const isMatchedAuthor = (authorId) =>
    !!authorId && matchedUserIds.has(String(authorId).replace(/^USER#/, ""));

  // ─── Feed-empty fallback ───
  // When the "For You" feed comes back empty, instead of only surfacing the
  // first circle's posts we pull posts from ALL the circles the user is in.
  // GET /circles/{id}/posts already applies the same mutual preference /
  // compatibility filter as the feed (plus block/deletion filters) server-side
  // — see circle-service listPosts.js — so we don't re-filter here; we only
  // merge across circles, dedupe, and sort by recency. Only fetch when we
  // actually need the fallback: feed is loaded, empty, and no circle selected.
  const needFallback =
    !isLoadingFeed && feed.length === 0 && !selectedCircleId;

  const fallbackQueries = useQueries({
    queries: (needFallback ? myCircles : []).map((c) => ({
      queryKey: queryKeys.posts(c.circleId),
      queryFn: async () => {
        const res = await listPosts(c.circleId);
        return res.data;
      },
      staleTime: 1000 * 30,
    })),
  });

  const fallbackPosts = useMemo(() => {
    if (!needFallback) return [];

    const seen = new Set();
    return fallbackQueries
      .flatMap((q) => q.data?.items || [])
      .filter((p) => p.status !== "deleted")
      // A post can surface from more than one circle query; keep the first.
      .filter((p) => {
        if (seen.has(p.postId)) return false;
        seen.add(p.postId);
        return true;
      })
      .sort((a, b) => (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0));
    // fallbackQueries is a fresh array each render; depend on its data only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needFallback, fallbackQueries.map((q) => q.dataUpdatedAt).join(",")]);

  const markPostSeen = useSeenTracker();
  const { send: sendMatchRequest } = useSendMatchRequest();

  if (isCirclesError) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={AlertTriangle}
            title={t("circlesHome.loadFailedTitle")}
            subtitle={t("circlesHome.loadFailedBody")}
            action={
              <button
                onClick={() => refetchCircles()}
                className="px-6 py-2.5 btn-filled text-sm rounded-full"
              >
                {t("circlesHome.retry")}
              </button>
            }
          />
        </div>
        <BottomNav />
      </div>
    );
  }

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

  const handleSharePost = (post, circleId) => {
    const url = `${window.location.origin}/circles/${circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`;
    shareLink({
      title: getAuthorDisplayName(post) ? `${getAuthorDisplayName(post)}'s post` : t("common.circlePost"),
      text: post.content ? post.content.slice(0, 100) : "",
      url,
      copiedMessage: t("common.linkCopied"),
      failedMessage: t("common.failedToShare"),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-20 overflow-x-hidden">
      {/* Modals */}
      <CreateCircleModal isOpen={isCreateCircleOpen} onClose={() => setIsCreateCircleOpen(false)} />
      <CommentSection isOpen={!!commentPost} onClose={() => setCommentPost(null)} post={commentPost} />

      {/* Reddit-style circle picker */}
      <BottomSheetModal isOpen={isCirclePickerOpen} onClose={() => setIsCirclePickerOpen(false)}>
        <div className="px-4 pb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {t("circlesHome.postToCircle")}
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

      {/* Search circles and posts (server-side, not just what you're in) */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-3 py-2.5">
          <CircleSearchBar
            joinedCircleIds={joinedCircleIds}
            onSelect={(circle) => navigate(`/circles/${circle.circleId}`)}
            onSelectPost={(post) =>
              navigate(
                `/circles/${post.circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`
              )
            }
          />
        </div>
      </div>

      {/* Sticky story strip */}
      <div className="sticky top-[65px] z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3" style={{ minWidth: "min-content" }}>

            {/* For You */}
            <StoryAvatar
              isActive={!selectedCircleId}
              onClick={() => setSelectedCircleId(null)}
              label={t("common.forYou")}
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

            {/* My Posts */}
            {!isLoadingCircles && (
              <StoryAvatar
                isActive={false}
                onClick={() => navigate("/circles/my-posts")}
                label={t("circlesHome.myPosts")}
              >
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </StoryAvatar>
            )}

            {/* Discover */}
            {!isLoadingCircles && (
              <>
                <StoryAvatar
                  isActive={false}
                  onClick={() => navigate("/circles/discover")}
                  label={t("common.discover")}
                >
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-gray-400" />
                  </div>
                </StoryAvatar>

                <StoryAvatar
                  isActive={false}
                  onClick={() => setIsCreateCircleOpen(true)}
                  label={t("circlesHome.new")}
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
            {t("circlesHome.whatsOnYourMind")}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <PenLine className="w-4 h-4 text-primary" />
          </div>
        </button>

        {/* Section header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">
              {selectedCircle ? selectedCircle.name : t("common.forYou")}
            </h2>
            {!selectedCircleId && !isLoadingFeed && feed.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">{t("circlesHome.postsSuffix", { count: feed.length })}</span>
            )}
            {selectedCircleId && !isLoadingCirclePosts && circlePosts.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">{t("circlesHome.postsSuffix", { count: circlePosts.length })}</span>
            )}
          </div>
          {selectedCircle && (
            <button
              onClick={() => navigate(`/circles/${selectedCircleId}`, { state: { circleData: selectedCircle } })}
              className="text-xs btn-outlined px-3 py-1 rounded-full"
            >
              {t("circlesHome.viewCircle")}
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
                    <p className="text-sm font-semibold text-gray-700 mb-1">{t("circlesHome.noPostsYetTitle")}</p>
                    <p className="text-xs text-gray-400 mb-5">{t("circlesHome.beFirstToPost", { circleName: selectedCircle?.name })}</p>
                    <button
                      onClick={() => handlePickCircle(selectedCircle)}
                      className="px-5 py-2 btn-filled text-sm rounded-full shadow-sm"
                    >
                      {t("circlesHome.createAPost")}
                    </button>
                  </div>
                )}

                {!isLoadingCirclePosts && circlePosts.map((post) => {
                  const isAuthor = !!myId && myId === post.authorId;
                  const isMatched = !isAuthor && isMatchedAuthor(post.authorId);
                  const showMatchActions = !isAuthor && !isMatched;
                  return (
                    <PostCard
                      key={post.postId}
                      variant="feed"
                      avatar={post.authorImage || DEFAULT_AVATAR}
                      name={getAuthorDisplayName(post) || t("common.anonymous")}
                      meta={<PostMeta post={post} />}
                      body={post.content}
                      media={post.media}
                      tags={post.tags || []}
                      onAuthorClick={post.authorId ? () => navigate(`/profile/${post.authorId}`) : undefined}
                      onShare={() => handleSharePost(post, selectedCircleId)}
                      matched={
                        isMatched
                          ? { name: getAuthorDisplayName(post), onMessage: () => navigate(`/matches/${post.authorId}/chat`) }
                          : null
                      }
                      actionsWrapperClassName={showMatchActions ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                      actions={buildPostActions({
                        includeMatchActions: showMatchActions,
                        onComment: () => setCommentPost(post),
                        onToggleLike: () =>
                          sendMatchRequest(post.authorId, {
                            postId: post.postId,
                            circleId: selectedCircleId,
                            createdAtEpoch: post.createdAtEpoch,
                            onSuccess: () => toast.success(t("circlesHome.matchRequestSent")),
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
                          <p className="text-sm font-semibold text-gray-700">{t("circlesHome.feedQuietTitle")}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t("circlesHome.feedQuietBody")}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/circles/discover")}
                        className="text-xs btn-outlined px-3 py-1.5 rounded-full"
                      >
                        {t("common.discover")}
                      </button>
                    </div>

                    {/* Fallback — recent posts across all your circles */}
                    {fallbackPosts.length > 0 && (
                      <>
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-sm font-bold text-gray-700">
                            {t("circlesHome.fromYourCircles")}{" "}✨
                          </p>
                          <button
                            onClick={() => navigate("/circles/discover")}
                            className="text-xs btn-outlined px-3 py-1 rounded-full"
                          >
                            {t("common.discover")}
                          </button>
                        </div>
                        {fallbackPosts.map((post) => {
                          const isAuthor = !!myId && myId === post.authorId;
                          const isMatched = !isAuthor && isMatchedAuthor(post.authorId);
                          const showMatchActions = !isAuthor && !isMatched;
                          return (
                            <PostCard
                              key={post.postId}
                              variant="feed"
                              avatar={post.authorImage || DEFAULT_AVATAR}
                              name={getAuthorDisplayName(post) || t("common.anonymous")}
                              heading={post.circleName}
                              onHeadingClick={post.circleId ? () => navigate(`/circles/${post.circleId}`) : undefined}
                              meta={<PostMeta post={post} />}
                              body={post.content}
                              media={post.media}
                              tags={post.tags || []}
                              onAuthorClick={post.authorId ? () => navigate(`/profile/${post.authorId}`) : undefined}
                              onShare={() => handleSharePost(post, post.circleId)}
                              matched={
                                isMatched
                                  ? { name: getAuthorDisplayName(post), onMessage: () => navigate(`/matches/${post.authorId}/chat`) }
                                  : null
                              }
                              actionsWrapperClassName={showMatchActions ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                              actions={buildPostActions({
                                includeMatchActions: showMatchActions,
                                onComment: () => setCommentPost(post),
                                onToggleLike: () =>
                                  sendMatchRequest(post.authorId, {
                                    postId: post.postId,
                                    circleId: post.circleId,
                                    createdAtEpoch: post.createdAtEpoch,
                                    onSuccess: () => toast.success(t("circlesHome.matchRequestSent")),
                                  }),
                              })}
                            />
                          );
                        })}
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
                  const isMatched = !isAuthor && isMatchedAuthor(post.authorId);
                  const showMatchActions = !isAuthor && !isMatched;
                  const onSeen = (postId) => markPostSeen(postId, { immediate: isLastPost });

                  return (
                    <PostSeenObserver key={post.postId} postId={post.postId} onSeen={onSeen}>
                      <PostCard
                        variant="feed"
                        avatar={post.authorImage || DEFAULT_AVATAR}
                        name={getAuthorDisplayName(post) || t("common.anonymous")}
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
                        onShare={post.circleId ? () => handleSharePost(post, post.circleId) : undefined}
                        media={post.media}
                        body={post.content}
                        tags={post.tags || []}
                        matched={
                          isMatched
                            ? { name: getAuthorDisplayName(post), onMessage: () => navigate(`/matches/${post.authorId}/chat`) }
                            : null
                        }
                        actionsWrapperClassName={showMatchActions ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                        actions={buildPostActions({
                          includeMatchActions: showMatchActions,
                          onComment: () => setCommentPost(post),
                          onToggleLike: () =>
                            sendMatchRequest(post.authorId, {
                              postId: post.postId,
                              circleId: post.circleId,
                              createdAtEpoch: post.createdAtEpoch,
                              onSuccess: () => toast.success(t("circlesHome.matchRequestSent")),
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
