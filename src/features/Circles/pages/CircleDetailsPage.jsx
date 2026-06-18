import {
  ArrowLeft,
  MoreVertical,
  Users,
  Calendar,
  Settings,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../../components/Layout/BottomNavigation";
import CreatePostModal from "../components/post/CreatePostModal";
import PostCard from "../components/post/PostCard";
import EditPostModal from "../components/post/EditPostModal";
import PostMeta from "../components/post/PostMeta";
import CommentSection from "../components/comment/CommentSection";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useCircle } from "../hooks/useCircles";
import { usePosts, useUpdatePost, useDeletePost } from "../hooks/usePosts";
import { getPost } from "../api/postsApi";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { queryKeys } from "../queries/queryKeys";
import { DEFAULT_AVATAR, isMutualPreferenceMatch } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";
import { CircleHeaderSkeleton, PostCardSkeleton } from "../components/common/Skeletons";

export default function CircleDetailsPage() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isJoined, setIsJoined] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  const { data: fetchedCircle, isLoading } = useCircle(circleId);
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(circleId);
  const { data: myProfile } = useMyProfile();
  const updatePostMutation = useUpdatePost(circleId);
  const deletePostMutation = useDeletePost(circleId);

  // Strip "USER#" prefix from PK to match bare authorId from post data
  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

  // Prefer freshly fetched circle data, fall back to data passed via navigation state
  const data = fetchedCircle || location.state?.circleData;
  const posts = (postsData?.items || []).filter((p) => p.status !== "deleted");

  if (isLoading && !data) {
    return <CircleHeaderSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Circle not found</p>
      </div>
    );
  }

  const handleShareCircle = async () => {
    await shareLink({
      title: data.name,
      text: data.description || "",
      url: `${window.location.origin}/circles/${circleId}`,
    });
  };

  const handleSharePost = async (post) => {
    try {
      const { data: postDetail } = await getPost(circleId, post.createdAtEpoch, post.postId);

      const shareUrl = `${window.location.origin}/circles/${circleId}/posts/${post.postId}?createdAtEpoch=${post.createdAtEpoch}`;

      await shareLink({
        title: postDetail?.authorName ? `${postDetail.authorName}'s post` : "Circle post",
        text: postDetail?.content || post.content || "",
        url: shareUrl,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to share post");
    }
  };

  const toggleLike = (postId) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handlePostCreated = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.posts(circleId),
    });
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handlePostCreated}
        circleName={data.name}
        circleId={circleId}
        authorData={{ name: myProfile?.name, avatar: myProfile?.profilePhoto }}
      />

      {/* Comment Sheet */}
      <CommentSection
        isOpen={!!commentPost}
        onClose={() => setCommentPost(null)}
        post={commentPost}
      />

      {/* Edit Post Modal — only mounted when a post is selected so state initialises from the real post */}
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

      {/* Delete Post Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deletePostMutation.mutate({ postId: deleteConfirm.postId, createdAtEpoch: deleteConfirm.createdAtEpoch })}
        title="Delete post?"
        message="This cannot be undone. The post will be permanently removed."
      />

      {/* Cover Image */}
      <div className="relative h-40 sm:h-64 bg-gradient-to-br from-rose-400 to-orange-400">
        {data.coverPhoto && (
          <img
            src={data.coverPhoto}
            alt={data.name}
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full active:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full active:bg-white/30 transition-colors">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Circle Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
            {data.name}
          </h1>
          <div className="flex items-center gap-3 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{data.members ?? 0} members</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>{data.onlineMembers ?? 0} online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-3 -mt-5 relative z-10 space-y-3">
        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex gap-2">
            {isJoined ? (
              <>
                <button
                  onClick={handleShareCircle}
                  className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold active:scale-95 transition-transform"
                >
                  Share
                </button>
                <button
                  onClick={handleShareCircle}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-semibold active:scale-95 transition-transform"
                >
                  Invite
                </button>
                <button className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-xl active:scale-95 transition-transform">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsJoined(true)}
                className="flex-1 bg-primary text-white rounded-xl py-3 font-semibold active:scale-95 transition-transform"
              >
                Join Circle
              </button>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <h2 className="text-base font-bold text-gray-800 mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description}
          </p>
          {data.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
            <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Created {data.createdDate}</span>
            </div>
          )}
        </div>

        {/* Rules Section */}
        {data.rules?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <h2 className="text-base font-bold text-gray-800 mb-3">Circle Rules</h2>
            <div className="space-y-2">
              {data.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
                  <p className="text-gray-600 text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-3 space-y-3">
            {/* Create Post */}
            <div className="flex gap-2 p-2 bg-gray-50 rounded-xl">
              <img
                src={myProfile?.profilePhoto || DEFAULT_AVATAR}
                alt="Your avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 text-left px-4 py-2 bg-white rounded-full text-gray-400 text-sm active:bg-gray-100 transition-colors"
              >
                Share something with the circle...
              </button>
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="p-2 active:bg-gray-200 rounded-full transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {isLoadingPosts && (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            )}

            {!isLoadingPosts && posts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No posts yet. Be the first to post!</p>
            )}

            {posts.map((post) => {
              const canMatch = isMutualPreferenceMatch(myProfile, post);
              const isAuthor = !!myId && myId === post.authorId;

              return (
                <PostCard
                  key={post.postId}
                  variant="circle"
                  avatar={post.authorImage || DEFAULT_AVATAR}
                  name={post.authorName || "Anonymous"}
                  meta={<PostMeta post={post} />}
                  body={post.content}
                  media={post.media}
                  tags={post.tags || []}
                  isAuthor={isAuthor}
                  onEdit={() => setEditPost(post)}
                  onDelete={() => handleDeletePost(post)}
                  onShare={() => handleSharePost(post)}
                  onReport={() => alert("Post reported")}
                  onAuthorClick={
                    post.authorId
                      ? () => navigate(`/profile/${post.authorId}`)
                      : undefined
                  }
                  actionsWrapperClassName={canMatch ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                  actions={buildPostActions({
                    isLiked: likedPosts.has(post.postId),
                    onToggleLike: () => toggleLike(post.postId),
                    onComment: () => setCommentPost(post),
                    includeMatchActions: canMatch,
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
