import {
  ArrowLeft,
  Search,
  Bell,
  MoreVertical,
  Users,
  Calendar,
  MessageCircle,
  MapPin,
  Heart,
  Share2,
  Settings,
  Plus,
  Grid3X3,
  Clock,
  ChevronRight,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../../components/Layout/BottomNavigation";
import CreatePostModal from "../components/post/CreatePostModal";
import PostCard from "../components/post/PostCard";
import CommentSection from "../components/comment/CommentSection";
import { useCircle } from "../hooks/useCircles";
import { usePosts } from "../hooks/usePosts";
import { queryKeys } from "../queries/queryKeys";
import {
  members,
  events,
} from "../constants/circleDetailsData";

const formatPostTime = (epochMillis) => {
  if (!epochMillis) return "";

  const diffSec = Math.max(0, (Date.now() - epochMillis) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export default function CircleDetailsPage() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("posts");
  const [isJoined, setIsJoined] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);

  const queryClient = useQueryClient();

  const { data: fetchedCircle, isLoading } = useCircle(circleId);
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(circleId);

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

  const tabs = [
    { id: "posts", label: "Posts", icon: Grid3X3 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "members", label: "Members", icon: Users },
    { id: "chat", label: "Chat", icon: MessageCircle },
  ];

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

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="grid grid-cols-4 border-b border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-3 transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="space-y-4">
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
                    avatar={post.authorImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                    name={post.authorName || "Anonymous"}
                    meta={
                      <p className="text-xs text-gray-500">{formatPostTime(post.createdAtEpoch)}</p>
                    }
                    body={post.content}
                    image={post.media?.[0]?.url}
                    tags={post.tags || []}
                    actionsWrapperClassName="flex items-center gap-4"
                    actions={[
                      {
                        key: "like",
                        icon: Heart,
                        label: (post.likes ?? 0) + (likedPosts.has(post.postId) ? 1 : 0),
                        onClick: () => toggleLike(post.postId),
                        iconClassName: `w-4 h-4 ${
                          likedPosts.has(post.postId) ? "fill-rose-500 text-rose-500" : ""
                        }`,
                        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors",
                      },
                      {
                        key: "comment",
                        icon: MessageCircle,
                        label: post.commentCount ?? 0,
                        onClick: () => setCommentPost(post),
                        iconClassName: "w-4 h-4",
                        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors",
                      },
                      {
                        key: "share",
                        icon: Share2,
                        label: "Share",
                        iconClassName: "w-4 h-4",
                        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors ml-auto",
                      },
                    ]}
                  />
                ))}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-2">
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>

                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-primary text-white rounded-lg py-2 font-semibold hover:shadow-md transition-all">
                        Join Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {member.name}
                          </h4>
                          {member.role !== "Member" && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {member.role}
                            </span>
                          )}
                        </div>
                        {member.isOnline && (
                          <p className="text-xs text-green-600">Online</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 p-3 text-primary font-semibold hover:bg-gray-50 rounded-xl transition-colors">
                  View All {data.members ?? 0} Members
                </button>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Circle Chat
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Chat with your circle members in real-time
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Open Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
