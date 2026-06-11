import {
  Menu,
  Search,
  Bell,
  Heart,
  MessageCircle,
  X,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../../../components/Layout/BottomNavigation";
import Sidebar from "../components/layout/Sidebar";
import CreateCircleModal from "../components/circle/CreateCircleModal";
import CommentSection from "../components/comment/CommentSection";
import { myCircles } from "../constants/demoCircles";
import { feed } from "../constants/demoFeed";

export default function CirclesHomePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);

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
              {myCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="flex-shrink-0 w-24 text-center cursor-pointer"
                  onClick={() => navigate(`/circles/${circle.id}`, { state: { circleData: circle } })}
                >
                  <div
                    className={`${circle.bgColor} rounded-2xl p-3 transition-all hover:scale-105 hover:shadow-md`}
                  >
                    <img
                      src={circle.image}
                      alt={circle.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto shadow-sm"
                    />
                    <h3 className="font-semibold text-text-sec mt-2 text-sm truncate">
                      {circle.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {circle.members} members
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
            {feed.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-border-clr overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={post.avatar}
                          alt={post.name}
                          className="w-12 h-12 rounded-full object-cover shadow-md"
                        />
                        {post.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-text-sec">
                            {post.name}, {post.age}
                          </h3>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                            <Heart className="w-3 h-3 text-primary fill-primary" />
                            <span className="text-xs font-semibold text-primary">
                              {post.liked}% liked
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <span className="text-sm">🇹🇭</span>
                          <span>{post.location}</span>
                          <span>•</span>
                          <span>{post.distance}</span>
                        </div>
                      </div>
                    </div>

                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Post Image */}
                <div className="px-4 pb-2">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-xl mt-2"
                  />
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  <h4 className="text-lg font-bold text-text-sec mb-1">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {post.body}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-2 border-t border-border-clr mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                      <X className="w-4 h-4" />
                      Pass
                    </button>

                    <button
                      onClick={() => setCommentPost(post)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </button>

                    <button className="group flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:shadow-lg transition-all hover:scale-105">
                      <Heart className="w-4 h-4 group-hover:fill-white transition-colors" />
                      Match
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
