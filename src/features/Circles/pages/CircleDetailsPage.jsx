import {
  ArrowLeft,
  Users,
  Calendar,
  Image,
  Video,
  MessageSquare,
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
import { DEFAULT_AVATAR } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";
import { CircleHeaderSkeleton, PostCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../../../shared/components/EmptyState";

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

  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";

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
    <div className="min-h-screen bg-gray-50 pb-24">
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
        title="Delete post?"
        message="This cannot be undone. The post will be permanently removed."
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
              <span>{data.memberCount ?? 0} members</span>
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
                  Share
                </button>
                <button
                  onClick={handleShareCircle}
                  className="flex-1 btn-outlined rounded-xl py-2.5 text-sm"
                >
                  Invite
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsJoined(true)}
                className="flex-1 btn-filled rounded-xl py-3"
              >
                Join Circle
              </button>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-2">About</h2>
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
              <span>Created {data.createdDate}</span>
            </div>
          )}
        </div>

        {/* Rules */}
        {data.rules?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Circle Rules</h2>
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
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-400 text-sm transition-colors"
            >
              Share something with the circle...
            </button>
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Image className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Photo</span>
            </button>
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Video className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Video</span>
            </button>
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Post</span>
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-base font-bold text-gray-800">Posts</h2>
            {!isLoadingPosts && posts.length > 0 && (
              <span className="text-sm text-gray-400">{posts.length} posts</span>
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
                  title="No posts yet"
                  subtitle="Be the first to share something with this circle!"
                  action={
                    <button
                      onClick={() => setIsCreatePostModalOpen(true)}
                      className="px-6 py-2.5 btn-filled text-sm rounded-full"
                    >
                      Create Post
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
                  actionsWrapperClassName={!isAuthor ? "grid grid-cols-3 gap-2" : "grid grid-cols-1 gap-2"}
                  actions={buildPostActions({
                    isLiked: likedPosts.has(post.postId),
                    onToggleLike: () => toggleLike(post.postId),
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
