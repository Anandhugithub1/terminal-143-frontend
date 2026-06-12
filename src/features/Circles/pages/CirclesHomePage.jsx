import {
  Menu,
  Search,
  Bell,
  Heart,
  MessageCircle,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../../../components/Layout/BottomNavigation";
import Sidebar from "../components/layout/Sidebar";
import CreateCircleModal from "../components/circle/CreateCircleModal";
import CommentSection from "../components/comment/CommentSection";
import PostCard from "../components/post/PostCard";
import { useCircles } from "../hooks/useCircles";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import { haversineDistanceKm, formatDistance } from "../utils/geo";
import { feed } from "../constants/demoFeed";

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

  const { data: myProfile } = useMyProfile();
  const myCoords = myProfile?.location?.coordinates;

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
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border-clr px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-sec">Circles</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Find people, share interests, make real connections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 space-y-6">
        {/* My Circles - Horizontal scroll on mobile */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-sec">My Circles</h2>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
            <div className="flex gap-4" style={{ minWidth: "min-content" }}>
              {isLoadingCircles && (
                <p className="text-sm text-gray-400 py-4">Loading circles...</p>
              )}

              {myCircles.map((circle, index) => (
                <div
                  key={circle.circleId}
                  className="flex-shrink-0 w-24 text-center cursor-pointer"
                  onClick={() => navigate(`/circles/${circle.circleId}`, { state: { circleData: circle } })}
                >
                  <div
                    className={`${CIRCLE_BG_COLORS[index % CIRCLE_BG_COLORS.length]} rounded-2xl p-3 transition-all hover:scale-105 hover:shadow-md`}
                  >
                    {circle.coverPhoto ? (
                      <img
                        src={circle.coverPhoto}
                        alt={circle.name}
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 rounded-full object-cover mx-auto shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
                        <span className="text-lg font-bold text-text-sec">
                          {circle.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-text-sec mt-2 text-sm truncate">
                      {circle.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {circle.category}
                    </p>
                  </div>
                </div>
              ))}

              {/* Create Circle Card */}
              <div
                className="flex-shrink-0 w-24 text-center cursor-pointer"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <div className="bg-gray-50 rounded-2xl p-3 transition-all hover:scale-105 hover:shadow-md border-2 border-dashed border-gray-200 h-full flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Plus className="w-7 h-7 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-text-sec mt-2 text-sm">
                    Create
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Circle</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feed Section */}
        <section>
          <div className="space-y-5">
            {feed.map((post) => {
              const distance =
                myCoords && post.location?.coordinates
                  ? formatDistance(haversineDistanceKm(myCoords, post.location.coordinates))
                  : post.distance;

              return (
              <PostCard
                key={post.id}
                variant="feed"
                avatar={post.avatar}
                name={`${post.name}, ${post.age}`}
                statusDot={post.isOnline}
                badge={
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                    <Heart className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-xs font-semibold text-primary">
                      {post.liked}% liked
                    </span>
                  </div>
                }
                meta={
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <span className="text-sm">🇹🇭</span>
                    <span>{post.location?.placeName || post.location}</span>
                    <span>•</span>
                    <span>{distance}</span>
                  </div>
                }
                image={post.image}
                media={post.media}
                heading={post.title}
                body={post.body}
                tags={post.tags}
                actionsWrapperClassName="grid grid-cols-3 gap-2"
                actions={[
                  {
                    key: "pass",
                    icon: X,
                    label: "Pass",
                    iconClassName: "w-4 h-4",
                    className:
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors",
                  },
                  {
                    key: "comment",
                    icon: MessageCircle,
                    label: "Comment",
                    iconClassName: "w-4 h-4",
                    onClick: () => setCommentPost(post),
                    className:
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors",
                  },
                  {
                    key: "match",
                    icon: Heart,
                    label: "Match",
                    iconClassName: "w-4 h-4 group-hover:fill-white transition-colors",
                    className:
                      "group flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:shadow-lg transition-all hover:scale-105",
                  },
                ]}
              />
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
