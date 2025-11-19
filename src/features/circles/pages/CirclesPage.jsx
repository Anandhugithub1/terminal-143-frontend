import React, { useEffect, useMemo, useState } from "react";


import { SAMPLE_CIRCLES,SAMPLE_POSTS } from "../utlis/utlis";


/* -------------------- Enhanced Main Component -------------------- */
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
    circles.forEach(c => (c.tags || []).forEach(t => s.add(t)));
    return Array.from(s);
  }, [circles]);

  const filteredCircles = useMemo(() => {
    return circles.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && 
            !c.description.toLowerCase().includes(q) && 
            !(c.tags||[]).some(t=>t.includes(q))) return false;
      }
      if (tagFilter && !(c.tags||[]).includes(tagFilter)) return false;
      return true;
    });
  }, [circles, search, tagFilter]);

  const selectedCircle = circles.find(c => c.circleId === selectedCircleId);

  const createCircle = (payload) => {
    const newC = { 
      circleId: `c-${Date.now()}`, 
      memberCount: 1,
      onlineCount: 1,
      ...payload 
    };
    setCircles(prev => [newC, ...prev]);
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
      ...payload 
    };
    setPosts(prev => [newP, ...prev]);
    setIsComposeOpen(false);
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.postId === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          }
        : post
    ));
  };

  // Close mobile menu when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsCirclesDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
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
                  <div className="text-xs text-gray-500 hidden sm:block">Communities & conversations</div>
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
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Desktop: Search and Buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-2xl mx-8">
              {/* Search Bar - Hidden on mobile in header */}
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New Circle
              </button>
              <button 
                onClick={() => setIsComposeOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm font-semibold bg-gradient-to-r from-gradient-primary to-gradient-secondary"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Create Post
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Below main header */}
          <div className="sm:hidden pb-3 -mt-2">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                    <h2 className="text-lg font-bold text-gray-900 truncate">{selectedCircle?.name || "Select a circle"}</h2>
                    <p className="text-sm text-gray-500 truncate">{selectedCircle?.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCircle?.name || "Select a circle"}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedCircle?.description}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <button 
                    onClick={() => { setLoadingPosts(true); setTimeout(() => setLoadingPosts(false), 680); }}
                    className="px-4 py-2 rounded-xl border border-border-clr text-sm font-medium transition-all duration-200 hover:shadow-md bg-white"
                  >
                    <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                {["feed", "members", "events", "media"].map(tab => (
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
                      {tab === 'feed' && '📝'}
                      {tab === 'members' && '👥'}
                      {tab === 'events' && '📅'}
                      {tab === 'media' && '🖼️'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                {["Create Post", "Invite", "Events", "Settings"].map((action, index) => (
                  <button 
                    key={action}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-border-clr text-sm font-medium whitespace-nowrap bg-white"
                    onClick={() => {
                      if (action === "Create Post") setIsComposeOpen(true);
                    }}
                  >
                    {action}
                  </button>
                ))}
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
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-sm text-gray-500 mb-4 sm:mb-6">Be the first to start the conversation in this circle.</p>
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

      {/* Enhanced Modals */}
      {isComposeOpen && (
        <EnhancedModal title="Create Post" onClose={() => setIsComposeOpen(false)}>
          <EnhancedCreatePostForm 
            onCreate={createPost} 
            onCancel={() => setIsComposeOpen(false)} 
          />
        </EnhancedModal>
      )}
      
      {isNewCircleOpen && (
        <EnhancedModal title="Create New Circle" onClose={() => setIsNewCircleOpen(false)}>
          <EnhancedCreateCircleForm 
            onCreate={createCircle} 
            onCancel={() => setIsNewCircleOpen(false)} 
          />
        </EnhancedModal>
      )}
    </div>
  );
}

/* -------------------- Mobile-Specific Components -------------------- */

function MobileCirclesDrawer({ circles, selectedCircleId, onSelectCircle, onClose, tags, tagFilter, onTagFilter, onCreateCircle, loading }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Content */}
      <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl slide-in overflow-y-auto">
        <div className="p-4 border-b border-border-clr">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Circles</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {/* Mobile Search in Drawer */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              placeholder="Search circles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-clr text-sm bg-gray-100"
            />
          </div>
        </div>

        <div className="p-4">
          {/* Circles List */}
          <div className="space-y-2 mb-6">
            {loading ? (
              <MobileSkeletonList lines={3} />
            ) : circles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm">No circles found</div>
              </div>
            ) : (
              circles.map((c, index) => (
                <button
                  key={c.circleId}
                  onClick={() => onSelectCircle(c.circleId)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedCircleId === c.circleId 
                      ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-primary" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 truncate">{c.description}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-900">Tags</h4>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => onTagFilter("")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  tagFilter === "" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                All
              </button>
              {tags.map(t => (
                <button 
                  key={t}
                  onClick={() => onTagFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    tagFilter === t
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button 
            onClick={onCreateCircle}
            className="w-full py-3.5 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Create New Circle
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({ onCompose, onCircles, selectedCircle }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bottom-safe-area">
      <div className="bg-white border-t border-border-clr shadow-2xl">
        <div className="flex items-center justify-around p-2">
          {/* Circles Button */}
          <button 
            onClick={onCircles}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">Circles</span>
          </button>

          {/* Current Circle */}
          <button 
            onClick={onCircles}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200 flex-1 max-w-[120px]"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              {selectedCircle?.name?.[0] || "C"}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {selectedCircle?.name || "Select"}
            </span>
          </button>

          {/* Compose Button */}
          <button 
            onClick={onCompose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MobilePostCard({ post, onLike, style }) {
  return (
    <article 
      className="bg-white rounded-2xl p-4 shadow-lg fade-in border border-border-clr"
      style={style}
    >
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center text-white font-semibold text-sm">
          {post.author?.name?.[0] || "U"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm font-semibold text-gray-900 truncate">{post.author?.name}</div>
            {post.author?.role && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium hidden sm:inline">
                {post.author.role}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.body}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {post.likeCount}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {post.commentCount}
        </div>
      </div>

      {/* Comment Previews */}
      {(post.previews || []).length > 0 && (
        <div className="mb-3 border-t border-border-clr pt-3">
          <div className="space-y-2">
            {post.previews.slice(0,2).map(p => (
              <div key={p.commentId} className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
                  {p.authorName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-semibold text-gray-900">{p.authorName}</span>
                    {p.isLiked && (
                      <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-700">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 pt-3 border-t border-border-clr">
        <button 
          onClick={() => onLike(post.postId)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium ${
            post.isLiked 
              ? "bg-red-50 text-red-600" 
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          Like
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Share
        </button>
      </div>
    </article>
  );
}

/* -------------------- Desktop Components -------------------- */

function DesktopCirclesPanel({ circles, selectedCircleId, onSelectCircle, tags, tagFilter, onTagFilter, onCreateCircle, loading }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-gray-900">Your Circles</h4>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
            {circles.length}
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
          {loading ? (
            <EnhancedSkeletonList lines={4} />
          ) : circles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No circles found</div>
              <button 
                onClick={onCreateCircle}
                className="mt-3 text-primary text-sm font-medium hover:underline"
              >
                Create your first circle
              </button>
            </div>
          ) : (
            circles.map((c, index) => (
              <button
                key={c.circleId}
                onClick={() => onSelectCircle(c.circleId)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group slide-in ${
                  selectedCircleId === c.circleId 
                    ? "ring-2 ring-primary shadow-md bg-gradient-to-r from-purple-50 to-blue-50" 
                    : "hover:shadow-md hover:bg-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-gradient-primary to-gradient-secondary"
                    >
                      {c.name[0]}
                    </div>
                    {c.onlineCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold truncate text-gray-900">{c.name}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${
                        c.visibility === 'public' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.visibility}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mb-2">{c.description}</div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{c.memberCount} members</span>
                      <span>{c.onlineCount} online</span>
                    </div>
                  </div>
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500">
                        #{t}
                      </span>
                    ))}
                    {c.tags.length > 2 && (
                      <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500">
                        +{c.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button 
            onClick={onCreateCircle}
            className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Create New Circle
          </button>
        </div>
      </div>

      {/* Tags panel */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <div className="text-sm font-bold mb-4 text-gray-900">Popular Tags</div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => onTagFilter("")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tagFilter === "" 
                ? "bg-primary text-white shadow-md" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {tags.map(t => (
            <button 
              key={t}
              onClick={() => onTagFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tagFilter === t
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function DesktopSidebar({ selectedCircle }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <h4 className="text-lg font-bold mb-4 text-gray-900">Circle Details</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Members</span>
            <span className="font-semibold">{selectedCircle?.memberCount || 0}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Online</span>
            <span className="font-semibold text-green-500">{selectedCircle?.onlineCount || 0}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Visibility</span>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
              selectedCircle?.visibility === 'public' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {selectedCircle?.visibility}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <h5 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h5>
        <div className="space-y-3">
          {["Invite Members", "Circle Settings", "Create Event", "Share Circle"].map((action, index) => (
            <button 
              key={action}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-clr text-sm font-medium transition-all duration-200 hover:shadow-md hover:border-primary group bg-white"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {action}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------- Skeleton Loaders -------------------- */

function MobileSkeletonList({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MobilePostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-border-clr">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
      <div className="h-8 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

function EnhancedSkeletonList({ lines = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------- Modal and Form Components -------------------- */

function EnhancedModal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 safe-area-padding">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-auto fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-border-clr">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-clr">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EnhancedCreatePostForm({ onCreate, onCancel }) {
  const [body, setBody] = useState("");
  const submit = (e) => { 
    e.preventDefault(); 
    if (!body.trim()) return; 
    onCreate({ body, author: { name: "You", role: "Member" } }); 
    setBody(""); 
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">What's on your mind?</label>
        <textarea 
          aria-label="Post body" 
          rows={6} 
          value={body} 
          onChange={e => setBody(e.target.value)} 
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus resize-none bg-white"
          placeholder="Share your thoughts with the circle..."
        />
      </div>

      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <button type="button" className="w-10 h-10 rounded-xl border border-border-clr flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200 bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
            </svg>
          </button>
          <button type="button" className="w-10 h-10 rounded-xl border border-border-clr flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200 bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!body.trim()}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl disabled:hover:shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
          >
            Post to Circle
          </button>
        </div>
      </div>
    </form>
  );
}

function EnhancedCreateCircleForm({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const submit = (e) => { 
    e.preventDefault(); 
    if (!name.trim()) return; 
    onCreate({ name, description: desc, visibility, tags }); 
    setName(""); 
    setDesc(""); 
    setVisibility("public");
    setTags([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Circle Name</label>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus bg-white"
          placeholder="e.g., Book Club, Hiking Buddies..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Description</label>
        <textarea 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          rows={3} 
          className="w-full p-4 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus resize-none bg-white"
          placeholder="What is this circle about?"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Visibility</label>
        <div className="grid grid-cols-2 gap-3">
          {["public", "invite"].map(vis => (
            <button
              key={vis}
              type="button"
              onClick={() => setVisibility(vis)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                visibility === vis 
                  ? "border-primary ring-2 ring-primary ring-opacity-20 bg-blue-50" 
                  : "border-border-clr hover:border-primary"
              }`}
            >
              <div className="text-sm font-medium text-gray-900 capitalize">{vis}</div>
              <div className="text-xs text-gray-500 mt-1">
                {vis === 'public' ? 'Anyone can join' : 'Invite only'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Tags</label>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 p-3 rounded-xl border border-border-clr bg-white"
            placeholder="Add a tag..."
          />
          <button 
            type="button"
            onClick={addTag}
            className="px-4 py-3 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map(tag => (
            <span 
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-sm"
            >
              #{tag}
              <button 
                type="button"
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl border border-border-clr font-medium transition-all duration-200 hover:shadow-md bg-white"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!name.trim()}
          className="flex-1 py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl disabled:hover:shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary"
        >
          Create Circle
        </button>
      </div>
    </form>
  );
}

function timeAgo(epoch) {
  if (!epoch) return "";
  const diff = Date.now() - epoch;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}