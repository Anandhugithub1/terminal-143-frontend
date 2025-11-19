import React, { useEffect, useMemo, useState } from "react";

import { SAMPLE_CIRCLES, SAMPLE_POSTS } from "../utlis/utlis";
import MobileCirclesDrawer from "../components/mobileui/MobileCirclesDrawer";
import MobileBottomNav from "../components/mobileui/MobileBottomNav";
import MobilePostCard from "../components/mobileui/MobilePostCard";
import DesktopCirclesPanel from "../components/desktopui/DesktopCirclesPanel";
import { MobilePostSkeleton } from "../components/mobileui/MobilePostSkeleton";
import DesktopSidebar from "../components/desktopui/DesktopSidebar";
import CreateCircleForm from "../components/forms/CreateCircleForm";
import CreatePostForm from "../components/forms/CreatePostForm";
import Model from "../components/forms/Model";
export default function CirclesPagePro() {
  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCircles, setLoadingCircles] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isNewCircleOpen, setIsNewCircleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [isCirclesDrawerOpen, setIsCirclesDrawerOpen] = useState(false);

  useEffect(() => {
    setLoadingCircles(true);
    const t = setTimeout(() => {
      setCircles(SAMPLE_CIRCLES);
      setSelectedCircleId(SAMPLE_CIRCLES[0].circleId);
      setLoadingCircles(false);
    }, 160);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!selectedCircleId) return;
    setLoadingPosts(true);
    const t = setTimeout(() => {
      setPosts(SAMPLE_POSTS[selectedCircleId] || []);
      setLoadingPosts(false);
    }, 140);
    return () => clearTimeout(t);
  }, [selectedCircleId]);

  const tags = useMemo(() => {
    const s = new Set();
    circles.forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [circles]);

  const filteredCircles = useMemo(() => {
    return circles.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !(c.tags || []).some((t) => t.includes(q))
        )
          return false;
      }
      if (tagFilter && !(c.tags || []).includes(tagFilter)) return false;
      return true;
    });
  }, [circles, search, tagFilter]);

  const selectedCircle = circles.find((c) => c.circleId === selectedCircleId);

  const createCircle = (payload) => {
    const newC = {
      circleId: `c-${Date.now()}`,
      memberCount: 1,
      onlineCount: 1,
      ...payload,
    };
    setCircles((prev) => [newC, ...prev]);
    setSelectedCircleId(newC.circleId);
    setIsNewCircleOpen(false);
  };

  const createPost = (payload) => {
    const newP = {
      postId: `p-${Date.now()}`,
      createdAt: Date.now(),
      previews: [],
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      attachments: 0,
      ...payload,
    };
    setPosts((prev) => [newP, ...prev]);
    setIsComposeOpen(false);
  };

  const toggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );
  };

  // Close mobile menu when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsCirclesDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased safe-area-padding font-sans">
      {/* Enhanced Mobile-Friendly Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-border-clr backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile First Header Layout */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsCirclesDrawerOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                    C
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                    Circles
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    Communities & conversations
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Compose Button */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsComposeOpen(true)}
                className="w-10 h-10 rounded-xl text-white shadow-lg flex items-center justify-center bg-gradient-to-r from-gradient-primary to-gradient-secondary"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop: Search and Buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-2xl mx-8">
              {/* Search Bar - Hidden on mobile in header */}
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search circles, posts, or tags..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus text-sm bg-white"
                />
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => setIsNewCircleOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-clr transition-all duration-200 hover:shadow-md text-sm font-medium bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                New Circle
              </button>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm font-semibold bg-gradient-to-r from-gradient-primary to-gradient-secondary"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Create Post
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Below main header */}
          <div className="sm:hidden pb-3 -mt-2">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search circles, posts, or tags..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus text-sm bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Circles Drawer */}
      {isCirclesDrawerOpen && (
        <MobileCirclesDrawer
          circles={filteredCircles}
          selectedCircleId={selectedCircleId}
          onSelectCircle={(id) => {
            setSelectedCircleId(id);
            setIsCirclesDrawerOpen(false);
          }}
          onClose={() => setIsCirclesDrawerOpen(false)}
          tags={tags}
          tagFilter={tagFilter}
          onTagFilter={setTagFilter}
          onCreateCircle={() => {
            setIsNewCircleOpen(true);
            setIsCirclesDrawerOpen(false);
          }}
          loading={loadingCircles}
        />
      )}

      {/* Enhanced Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 bottom-safe-area">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Enhanced Left Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <DesktopCirclesPanel
                circles={filteredCircles}
                selectedCircleId={selectedCircleId}
                onSelectCircle={setSelectedCircleId}
                tags={tags}
                tagFilter={tagFilter}
                onTagFilter={setTagFilter}
                onCreateCircle={() => setIsNewCircleOpen(true)}
                loading={loadingCircles}
              />
            </div>
          </aside>

          {/* Enhanced Center Feed */}
          <section className="lg:col-span-6">
            {/* Mobile Circle Header */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsCirclesDrawerOpen(true)}
                className="w-full bg-white rounded-2xl p-4 shadow-lg text-left border border-border-clr"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                    {selectedCircle?.name?.[0] || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {selectedCircle?.name || "Select a circle"}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">
                      {selectedCircle?.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Enhanced Header */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-border-clr">
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                    {selectedCircle?.name?.[0] || "C"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCircle?.name || "Select a circle"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedCircle?.description}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => {
                      setLoadingPosts(true);
                      setTimeout(() => setLoadingPosts(false), 680);
                    }}
                    className="px-4 py-2 rounded-xl border border-border-clr text-sm font-medium transition-all duration-200 hover:shadow-md bg-white"
                  >
                    <svg
                      className="w-4 h-4 inline mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Refresh
                  </button>
                  <div className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-500">
                    {posts.length} posts
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <div className="flex gap-1 mt-4 sm:mt-6 p-1 rounded-xl bg-gray-100">
                {["feed", "members", "events", "media"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="hidden sm:inline">{tab}</span>
                    <span className="sm:hidden">
                      {tab === "feed" && "📝"}
                      {tab === "members" && "👥"}
                      {tab === "events" && "📅"}
                      {tab === "media" && "🖼️"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                {["Create Post", "Invite", "Events", "Settings"].map(
                  (action, index) => (
                    <button
                      key={action}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-border-clr text-sm font-medium whitespace-nowrap bg-white"
                      onClick={() => {
                        if (action === "Create Post") setIsComposeOpen(true);
                      }}
                    >
                      {action}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Enhanced Posts */}
            <div className="space-y-3 sm:space-y-4">
              {loadingPosts ? (
                <>
                  <MobilePostSkeleton />
                  <MobilePostSkeleton />
                </>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 sm:p-12 text-center shadow-lg fade-in border border-border-clr">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                    Be the first to start the conversation in this circle.
                  </p>
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-gradient-primary to-gradient-secondary"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                posts.map((post, index) => (
                  <MobilePostCard
                    key={post.postId}
                    post={post}
                    onLike={toggleLike}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))
              )}
            </div>
          </section>

          {/* Enhanced Right Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <DesktopSidebar selectedCircle={selectedCircle} />
            </div>
          </aside>
        </div>
      </main>

      {/* Enhanced Mobile Bottom Navigation */}
      <MobileBottomNav
        onCompose={() => setIsComposeOpen(true)}
        onCircles={() => setIsCirclesDrawerOpen(true)}
        selectedCircle={selectedCircle}
      />

      {/* Enhanced Models */}
      {isComposeOpen && (
        <Model title="Create Post" onClose={() => setIsComposeOpen(false)}>
          <CreatePostForm
            onCreate={createPost}
            onCancel={() => setIsComposeOpen(false)}
          />
        </Model>
      )}

      {isNewCircleOpen && (
        <Model
          title="Create New Circle"
          onClose={() => setIsNewCircleOpen(false)}
        >
          <CreateCircleForm
            onCreate={createCircle}
            onCancel={() => setIsNewCircleOpen(false)}
          />
        </Model>
      )}
    </div>
  );
}
