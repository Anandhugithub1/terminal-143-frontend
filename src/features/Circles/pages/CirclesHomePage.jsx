// Updated CirclesHomePage.jsx with navigation
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

import BottomNav from "../../../components/Layout/BottomNavigation";
import Sidebar from "../components/circles/Sidebar";
import CreateCircleModal from "../components/circles/CreateCircleModal";
import CommentSection from "../components/comments/CommentSection";
import CircleDetailPage from "./CircleDetailsPage"; // New import for circle detail page
const myCircles = [
  {
    id: 1,
    name: "Running",
    members: 124,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop",
    bgColor: "bg-rose-50",
  },
  {
    id: 2,
    name: "Language Exchange",
    members: 86,
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    name: "Gaming",
    members: 210,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop",
    bgColor: "bg-purple-50",
  },
  {
    id: 4,
    name: "Photography",
    members: 64,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop",
    bgColor: "bg-green-50",
  },
  {
    id: 5,
    name: "Music",
    members: 51,
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
    bgColor: "bg-orange-50",
  },
];

const feed = [
  // ... your feed data remains the same
  {
    id: 1,
    name: "Alex",
    age: 23,
    liked: 90,
    location: "Bangkok, Thailand",
    distance: "2 km away",
    title: "Looking for a running partner",
    body: "Hey! Looking for someone to join me for a 5KM morning run this Sunday at Benjakitti Park. Easy pace, good vibes!",
    time: "2h ago",
    tags: ["Sun, 7:00 AM", "Benjakitti Park", "5KM", "All Levels"],
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    isOnline: true,
  },
  {
    id: 2,
    name: "Bella",
    age: 25,
    liked: 80,
    location: "Bangkok, Thailand",
    distance: "3 km away",
    title: "Let's practice English together!",
    body: "I'm looking for a language exchange partner. I can help you with English and you can help me with Thai.",
    time: "5h ago",
    tags: ["Weekdays", "Online / Cafe", "Conversation"],
    image:
      "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&h=400&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    isOnline: false,
  },
];

export default function CirclesHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  
  // State for circle detail navigation
  const [selectedCircle, setSelectedCircle] = useState(null);

  // If a circle is selected, show the detail page
  if (selectedCircle) {
    return (
      <CircleDetailPage 
        circleId={selectedCircle.id}
        circleData={selectedCircle}
        onBack={() => setSelectedCircle(null)} 
      />
    );
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
              {myCircles.map((circle, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-24 text-center cursor-pointer"
                  onClick={() => setSelectedCircle(circle)} // Navigate to circle detail
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