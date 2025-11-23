// src/pages/CirclesPagePro.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import MobileCirclesDrawer from "../components/mobileui/MobileCirclesDrawer";
import MobileBottomNav from "../components/mobileui/MobileBottomNav";
import DesktopCirclesPanel from "../components/desktopui/DesktopCirclesPanel";
import { MobilePostSkeleton } from "../components/mobileui/MobilePostSkeleton";
import DesktopSidebar from "../components/desktopui/DesktopSidebar";
import CreateCircleForm from "../components/forms/CreateCircleForm";
import CreatePostForm from "../components/forms/CreatePostForm";
import Model from "../components/forms/Model";
import { HeaderSearch } from "../components/HeaderSearch";
import PostCard from "../components/Cards/Postcard";
import { getCirclesByUser, listPosts } from "../api";
import { normalizeCircle } from "../models/circleModel";

export default function CirclesPagePro() {
  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isNewCircleOpen, setIsNewCircleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [isCirclesDrawerOpen, setIsCirclesDrawerOpen] = useState(false);

  // -- circles list (react-query)
  const {
    data: rawCirclesData,
    isLoading: loadingCirclesQuery,
    isError: isCirclesError,
    error: circlesError,
  } = useQuery({
    queryKey: ["userCircles"],
    queryFn: () => getCirclesByUser({ limit: 10 }),
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2min
  });

  // normalize incoming circles
  useEffect(() => {
    if (!rawCirclesData) {
      setCircles([]);
      setSelectedCircleId(null);
      return;
    }
    const items = Array.isArray(rawCirclesData)
      ? rawCirclesData
      : rawCirclesData.items || rawCirclesData.circles || [];
    const normalized = items.map((it) => normalizeCircle(it));
    setCircles(normalized);
    setSelectedCircleId((prev) => {
      if (prev && normalized.some((c) => c.circleId === prev)) return prev;
      return normalized[0]?.circleId || null;
    });
  }, [rawCirclesData]);

  // derived: selected circle object & name
  const selectedCircle = useMemo(
    () => circles.find((c) => c.circleId === selectedCircleId) || null,
    [circles, selectedCircleId]
  );
  const selectedCircleName = useMemo(
    () => selectedCircle?.name || null,
    [selectedCircle]
  );

  // -- posts query (react-query per-circle)
  const {
    data: postsData,
    isLoading: loadingPosts,
    isError: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts", selectedCircleName],
    queryFn: async () => {
      if (!selectedCircleName) return [];
      // second argument to listPosts is axios config; listPosts returns res.data or res
      const raw = await listPosts(selectedCircleName, {
        params: { limit: 10 },
      });
      return raw;
    },
    enabled: Boolean(selectedCircleName),
    keepPreviousData: true,
    staleTime: 1000 * 30, // 30s
    retry: 1,
   select: (raw) => {
  if (!raw) return [];

  const arr = Array.isArray(raw)
    ? raw
    : raw.items || raw.posts || raw.data || [];

  const baseArray =
    !Array.isArray(arr) && arr?.Items && Array.isArray(arr.Items)
      ? arr.Items
      : Array.isArray(arr)
      ? arr
      : [];

  return baseArray.map((post) => {
    let postPostedAtEpoch = null;

    // Parse postedAtEpoch from SK = "POST#<epoch>#<postId>"
    if (typeof post.SK === "string" && post.SK.startsWith("POST#")) {
      const parts = post.SK.split("#");
      if (parts.length >= 3) {
        postPostedAtEpoch = parts[1];
      }
    }

    return {
      ...post,
      postCircleId: post.circleId,      
      postPostedAtEpoch,               
    };
  });
},

  });

  const toggleLike = useCallback((postId) => {
    // UI-only toggle placeholder for now
  }, []);

  const openCompose = useCallback(() => setIsComposeOpen(true), []);
  const closeCompose = useCallback(() => setIsComposeOpen(false), []);
  const openNewCircle = useCallback(() => setIsNewCircleOpen(true), []);
  const closeNewCircle = useCallback(() => setIsNewCircleOpen(false), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsCirclesDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const posts = postsData || [];

  // derived tags array
  const tags = useMemo(() => {
    const s = new Set();
    circles.forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [circles]);

  // filteredCircles
  const filteredCircles = useMemo(() => {
    if (!search && !tagFilter) return circles;
    const q = search.toLowerCase();
    return circles.filter((c) => {
      if (search) {
        const matchesText =
          c.name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesText) return false;
      }
      if (tagFilter && !(c.tags || []).includes(tagFilter)) return false;
      return true;
    });
  }, [circles, search, tagFilter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased safe-area-padding font-sans">
      <header className="bg-white sticky top-0 z-40 border-b border-border-clr backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCirclesDrawerOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Open circles menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12h18M3 6h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                    C
                  </div>
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

            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-2xl mx-8">
              <HeaderSearch value={search} onChange={setSearch} />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={openNewCircle}
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
                onClick={openCompose}
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

          <div className="sm:hidden pb-3 -mt-2">
            <HeaderSearch value={search} onChange={setSearch} />
          </div>
        </div>
      </header>

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
            openNewCircle();
            setIsCirclesDrawerOpen(false);
          }}
          loading={loadingCirclesQuery}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 bottom-safe-area">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <DesktopCirclesPanel
                circles={filteredCircles}
                selectedCircleId={selectedCircleId}
                onSelectCircle={setSelectedCircleId}
                tags={tags}
                tagFilter={tagFilter}
                onTagFilter={setTagFilter}
                onCreateCircle={openNewCircle}
                loading={loadingCirclesQuery}
              />
            </div>
          </aside>

          <section className="lg:col-span-6">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsCirclesDrawerOpen(true)}
                className="w-full bg-white rounded-2xl p-4 shadow-lg text-left border border-border-clr"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                    {selectedCircle?.coverPhoto ? (
                      <img
                        src={selectedCircle.coverPhoto}
                        alt={selectedCircle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                        {selectedCircle?.name?.[0] || "C"}
                      </div>
                    )}
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

            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-border-clr">
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                    {selectedCircle?.coverPhoto ? (
                      <img
                        src={selectedCircle.coverPhoto}
                        alt={selectedCircle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                        {selectedCircle?.name?.[0] || "C"}
                      </div>
                    )}
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
                    onClick={() => refetchPosts()}
                    className="px-4 py-2 rounded-xl border border-border-clr text-sm font-medium transition-all duration-200 hover:shadow-md bg-white"
                  >
                    Refresh
                  </button>
                  <div className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-500">
                    {posts.length} posts
                  </div>
                </div>
              </div>

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
                    onClick={openCompose}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-gradient-primary to-gradient-secondary"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                posts.map((post, index) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    onLike={toggleLike}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))
              )}
            </div>
          </section>

          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <DesktopSidebar selectedCircle={selectedCircle} />
            </div>
          </aside>
        </div>
      </main>

      <MobileBottomNav
        onCompose={openCompose}
        onCircles={() => setIsCirclesDrawerOpen(true)}
        selectedCircle={selectedCircle}
      />

      {isComposeOpen && (
        <Model title="Create Post" onClose={closeCompose}>
          <CreatePostForm
            onCreate={async (post) => {
              try {
                await refetchPosts();
              } catch (err) {
                console.error("Failed to refresh posts after create:", err);
              } finally {
                setIsComposeOpen(false);
              }
            }}
            onCancel={closeCompose}
            circleName={selectedCircle?.name}
          />
        </Model>
      )}

      {isNewCircleOpen && (
        <Model title="Create New Circle" onClose={closeNewCircle}>
          <CreateCircleForm
            onCreate={(c) => {
              /* add and select new circle (if backend returns created circle) */
            }}
            onCancel={closeNewCircle}
          />
        </Model>
      )}
    </div>
  );
}
