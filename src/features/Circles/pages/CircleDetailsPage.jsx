import {
  ArrowLeft,
  Search,
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
import PostMeta from "../components/post/PostMeta";
import CommentSection from "../components/comment/CommentSection";
import { useCircle } from "../hooks/useCircles";
import { usePosts } from "../hooks/usePosts";
import { getPost } from "../api/postsApi";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { queryKeys } from "../queries/queryKeys";
import { DEFAULT_AVATAR } from "../utils/postDisplay";
import { buildPostActions } from "../utils/postActions";
import { shareLink } from "../utils/share";

export default function CircleDetailsPage() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isJoined, setIsJoined] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);

  const queryClient = useQueryClient();

  const { data: fetchedCircle, isLoading } = useCircle(circleId);
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(circleId);
  const { data: myProfile } = useMyProfile();

  // Prefer freshly fetched circle data, fall back to data passed via navigation state
  const data = fetchedCircle || location.state?.circleData;
  const posts = postsData?.items || [];

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading circle...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Circle not found</p>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <Search className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Circle Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {data.name}
              </h1>
              <div className="flex items-center gap-3 text-white/90 text-sm">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex gap-3">
            {isJoined ? (
              <>
                <button className="flex-1 bg-primary text-white rounded-xl py-2.5 font-semibold hover:shadow-lg transition-all">
                  Share
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 font-semibold hover:bg-gray-200 transition-colors">
                  Invite Friends
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsJoined(true)}
                className="flex-1 bg-primary text-white rounded-xl py-3 font-semibold hover:shadow-lg transition-all"
              >
                Join Circle
              </button>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">About</h2>
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
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Circle Rules</h2>
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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 space-y-4">
            {/* Create Post */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 text-left px-4 py-2 bg-white rounded-full text-gray-400 text-sm hover:bg-gray-100 transition-colors"
              >
                Share your running experience...
              </button>
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {isLoadingPosts && (
              <p className="text-sm text-gray-400 text-center py-4">Loading posts...</p>
            )}

            {!isLoadingPosts && posts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No posts yet. Be the first to post!</p>
            )}

            {posts.map((post) => (
              <PostCard
                key={post.postId}
                variant="circle"
                avatar={post.authorImage || DEFAULT_AVATAR}
                name={post.authorName || "Anonymous"}
                meta={<PostMeta post={post} />}
                body={post.content}
                media={post.media}
                tags={post.tags || []}
                onShare={() => handleSharePost(post)}
                onReport={() => alert("Post reported")}
                actionsWrapperClassName="grid grid-cols-3 gap-2"
                actions={buildPostActions({
                  isLiked: likedPosts.has(post.postId),
                  onToggleLike: () => toggleLike(post.postId),
                  onComment: () => setCommentPost(post),
                })}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
