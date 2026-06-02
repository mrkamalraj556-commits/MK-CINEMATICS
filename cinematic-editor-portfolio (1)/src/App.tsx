import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, 
  Sparkles, 
  Heart, 
  Eye, 
  ShieldAlert, 
  Settings, 
  FileVideo, 
  Lock, 
  LogOut,
  Instagram,
  Youtube,
  Send,
  Clapperboard,
  Tv,
  ArrowLeft
} from "lucide-react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import VideoGallery from "./components/VideoGallery";
import VideoModalPlayer from "./components/VideoModalPlayer";
import Services from "./components/Services";
import AboutMe from "./components/AboutMe";
import ContactForm from "./components/ContactForm";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";
import { Video, Testimonial } from "./types";
import { auth } from "./lib/firebase";
import { 
  fetchVideosFromFirestore, 
  likeVideoInFirestore, 
  viewVideoInFirestore, 
  deleteVideoFromFirestore 
} from "./lib/firestoreUtil";

// Static premium fallback reviews (matches initialized server JSON db)
const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    author: "Alex Thorne",
    role: "Head of Content",
    company: "TechSpire YouTube Channel",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    text: "Phenomenal sense of timing! Our viewer retention rate instantly jumped by 32% on the first batch of YouTube video cuts. Exceptional sound design and color grading too."
  },
  {
    id: "t2",
    author: "Sophie Hayes",
    role: "Creative Director",
    company: "Lumina Studio Agency",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    text: "His cinematic editing transformed simple raw interview footage into a beautiful boutique-grade brand film. He is incredibly receptive to feedback and delivers fast."
  },
  {
    id: "t3",
    author: "Marcus Durant",
    role: "Professional Creator",
    company: "eSports Syndicate",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    text: "The speed-ramped sync is literal perfection. Re-cut our streams into reels that secured over 500k views on TikTok inside 48 hours. Absolute magician with esports clips."
  }
];

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");
  const [activeSection, setActiveSection] = useState("hero");
  const [showAdminTriggers, setShowAdminTriggers] = useState(false);
  
  // Custom Path Routing State 
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  
  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  // Loading animations
  const [initialLoading, setInitialLoading] = useState(true);

  // Track liked video IDs locally for Instagram-style toggle behavior
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("liked_videos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track in-flight like operations to prevent double-click race conditions
  const processingLikeIds = useRef<Set<string>>(new Set());

  // Sync liked video IDs to local storage whenever list changes
  useEffect(() => {
    localStorage.setItem("liked_videos", JSON.stringify(likedVideoIds));
  }, [likedVideoIds]);

  // Parse pathing and keyboard backdoor triggers
  useEffect(() => {
    // Detect custom path routing for /admin
    const path = window.location.pathname;
    if (path === "/admin" || path.startsWith("/admin/")) {
      setIsAdminRoute(true);
      setShowAdminTriggers(true);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("manage") === "true") {
      setShowAdminTriggers(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret backdoor: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowAdminTriggers((prev) => !prev);
        setIsLoginOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Subscribe to secure Firebase session state
  useEffect(() => {
    let active = true;

    // Safety Force Stop Loader after 2.5 seconds to guarantee portfolio accessibility
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn("Loading timeout triggered. Forcing loader removal for UX accessibility.");
        setInitialLoading(false);
      }
    }, 2500);

    const checkLocalSession = async () => {
      const savedToken = localStorage.getItem("admin_token");
      if (savedToken && savedToken.startsWith("token_")) {
        try {
          const res = await fetch("/api/admin/verify", {
            headers: {
              "Authorization": `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.valid && active) {
              setIsAdmin(true);
              setToken(savedToken);
              setIsAdminPanelOpen(true);
              setInitialLoading(false);
              clearTimeout(safetyTimeout);
              return true;
            }
          }
        } catch (err) {
          console.warn("Express token verify failed, falling back...", err);
        }
      }
      return false;
    };

    let fbUnsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        const ok = await checkLocalSession();
        if (ok && active) return;

        if (auth) {
          fbUnsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!active) return;
            if (currentUser) {
              // Enforce strict restriction to only your designated email account
              if (currentUser.email === "montykumawatmk@gmail.com") {
                setIsAdmin(true);
                const idToken = await currentUser.getIdToken();
                setToken(idToken);
                localStorage.setItem("admin_token", idToken);
                setIsAdminPanelOpen(true);
              } else {
                // Unauthorized user connected, sign them out instantly
                console.warn("Unauthorized access try by email: ", currentUser.email);
                await auth.signOut();
                setIsAdmin(false);
                setToken("");
                localStorage.removeItem("admin_token");
                setIsAdminPanelOpen(false);
                setShowAdminTriggers(false);
              }
            } else {
              // Handle active path logic: if on `/admin` route, redirect to home directly to prevent flashing login card
              const path = window.location.pathname;
              if (path === "/admin" || path.startsWith("/admin/")) {
                localStorage.removeItem("admin_token");
                window.location.href = "/";
                return;
              }

              // Keep admin active of a valid server-side login token is present
              const localToken = localStorage.getItem("admin_token");
              if (localToken && localToken.startsWith("token_")) {
                return;
              }
              setIsAdmin(false);
              setToken("");
              localStorage.removeItem("admin_token");
              setIsAdminPanelOpen(false);
              setShowAdminTriggers(false);
            }
            setInitialLoading(false);
            clearTimeout(safetyTimeout);
          }, (err) => {
            console.error("Auth state changed error: ", err);
            setInitialLoading(false);
            clearTimeout(safetyTimeout);
          });
        } else {
          setInitialLoading(false);
          clearTimeout(safetyTimeout);
        }
      } catch (err) {
        console.error("Firebase auth initialization error: ", err);
        setInitialLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    initAuth();

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
      if (fbUnsubscribe) fbUnsubscribe();
    };
  }, []);

  // 1. Fetch Video list from Firebase Firestore
  const fetchVideos = async () => {
    try {
      const data = await fetchVideosFromFirestore();
      setVideos(data);
    } catch (err) {
      console.error("Failed fetching videos:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 2. Highlight Header links based on current scroll position (only if not in Admin full page)
  useEffect(() => {
    if (isAdminRoute) return;

    const handleScroll = () => {
      const sections = ["hero", "showcase", "services", "about", "contact"];
      const scrollPos = window.scrollY + 250;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdminRoute]);

  // 3. Client handles video play click counter trigger
  const handleVideoPlay = async (video: Video) => {
    setSelectedVideo(video);
    try {
      const updatedViews = await viewVideoInFirestore(video.id, video.views || 0);
      setVideos((prev) => 
        prev.map((v) => v.id === video.id ? { ...v, views: updatedViews } : v)
      );
    } catch (err) {
      console.error("View increment error:", err);
    }
  };

  // 4. Client Liking click triggers (Toggle behavior like Instagram)
  const handleLikeClick = async (id: string) => {
    // Prevent double triggers if already processing a click for this video
    if (processingLikeIds.current.has(id)) return;

    const targetVideo = videos.find((v) => v.id === id);
    if (!targetVideo) return;

    processingLikeIds.current.add(id);

    const hasLiked = likedVideoIds.includes(id);
    const action = hasLiked ? "unlike" : "like";

    try {
      // Opt-in update liked state locally immediately for snappy responsiveness
      if (hasLiked) {
        setLikedVideoIds((prev) => prev.filter((item) => item !== id));
      } else {
        setLikedVideoIds((prev) => [...prev, id]);
      }

      const updatedLikes = await likeVideoInFirestore(id, targetVideo.likes || 0, action);
      
      setVideos((prev) => 
        prev.map((v) => v.id === id ? { ...v, likes: updatedLikes } : v)
      );
      if (selectedVideo && selectedVideo.id === id) {
        setSelectedVideo((prev) => prev ? { ...prev, likes: updatedLikes } : null);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      processingLikeIds.current.delete(id);
    }
  };

  // 5. Admin login success callback code proxy
  const handleLoginSuccess = async (newToken: string) => {
    setIsAdmin(true);
    setToken(newToken);
    localStorage.setItem("admin_token", newToken);
    setIsAdminPanelOpen(true);
    
    if (!isAdminRoute) {
      setTimeout(() => {
        const el = document.getElementById("admin-dashboard");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  // Logout actions
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      // If we are on `/admin` route, remove token and redirect immediately to avoid flashing the login card before page reloads
      if (isAdminRoute) {
        localStorage.removeItem("admin_token");
        window.location.href = "/";
        return;
      }

      setIsAdmin(false);
      setToken("");
      localStorage.removeItem("admin_token");
      setIsAdminPanelOpen(false);
      setShowAdminTriggers(false);
    }
  };

  // Admin deletes video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project permanently from Firestore?")) return;
    try {
      await deleteVideoFromFirestore(id);
      fetchVideos();
    } catch (err) {
      console.error("Delete video error:", err);
    }
  };

  // Admin initial editing triggers
  const handleEditVideo = (video: Video) => {
    setIsAdminPanelOpen(true);
    const el = document.getElementById("admin-editor-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-[#B3B3B3] overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0B0B0B] selection:font-bold">
      
      {/* 1. Cinematic Roll Spinner Startup Loader */}
      <AnimatePresence>
        {initialLoading && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#0B0B0B] z-50 flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 bg-gradient-to-br from-[#D4AF37] to-amber-600 rounded-2xl glow-amber animate-pulse">
              <Film className="w-12 h-12 text-[#0B0B0B] stroke-[2.5px] animate-spin-slow" />
            </div>
            
            <span className="text-sm font-mono tracking-widest text-[#D4AF37] font-bold animate-pulse">
              BOOTING CONSOLE FILMS //
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!initialLoading && (
        <>
          {/* STANDALONE ADMIN ROUTE SCREEN */}
          {isAdminRoute ? (
            <div className="min-h-screen flex flex-col">
              {/* Header bar */}
              <header className="py-4 bg-[#151515] border-b border-white/5 px-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#D4AF37]/15 rounded text-[#D4AF37]">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className="text-white font-bold font-display text-sm">
                      MK <span className="text-[#D4AF37]">CINEMATICS</span> ADMIN
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <a 
                      href="/" 
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Portfolio
                    </a>
                    
                    {isAdmin && (
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-all border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    )}
                  </div>

                </div>
              </header>

              {/* Main content body block */}
              <div className="flex-1">
                {isAdmin ? (
                  <div className="py-8 bg-[#0B0B0B]">
                    <AdminPanel 
                      token={token}
                      videos={videos}
                      onRefreshVideos={fetchVideos}
                      onClose={() => {
                        window.location.href = "/";
                      }}
                    />
                  </div>
                ) : (
                  <div className="py-12 flex-1 flex items-center justify-center">
                    <AdminLoginModal 
                      standalone={true}
                      isOpen={true}
                      onClose={() => {}}
                      onLoginSuccess={handleLoginSuccess}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* STANDARD PUBLIC HOMEPAGE PORTFOLIO */}
              
              {/* Header element */}
              <Header 
                isAdmin={isAdmin}
                showAdminTriggers={showAdminTriggers}
                activeSection={activeSection}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogout={handleLogout}
              />

              {/* Hero space */}
              <Hero videos={videos} />

              {/* Admin panel control board (rendered when active & authorized) */}
              <AnimatePresence>
                {isAdmin && isAdminPanelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <AdminPanel 
                      token={token}
                      videos={videos}
                      onRefreshVideos={fetchVideos}
                      onClose={() => setIsAdminPanelOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Videos Grid Archiving section */}
              <VideoGallery 
                videos={videos}
                isAdmin={isAdmin}
                likedVideoIds={likedVideoIds}
                onVideoClick={handleVideoPlay}
                onLikeClick={handleLikeClick}
                onDeleteVideo={handleDeleteVideo}
                onEditVideo={handleEditVideo}
                onAddVideoClick={() => {
                  setIsAdminPanelOpen(true);
                  setTimeout(() => {
                    const el = document.getElementById("admin-editor-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
              />

              {/* Services list */}
              <Services />

              {/* Biography details about skills */}
              <AboutMe />

              {/* Contact and Social hot links forms */}
              <ContactForm />

              {/* Immersive Cinematic Video player modal popup */}
              <AnimatePresence>
                {selectedVideo && (
                  <VideoModalPlayer 
                    video={selectedVideo}
                    likedVideoIds={likedVideoIds}
                    onClose={() => setSelectedVideo(null)}
                    onLike={handleLikeClick}
                  />
                )}
              </AnimatePresence>

              {/* Password secure dialog popups */}
              <AnimatePresence>
                {isLoginOpen && (
                  <AdminLoginModal 
                    isOpen={isLoginOpen}
                    onClose={() => setIsLoginOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )}
              </AnimatePresence>

              {/* Universal footer */}
              <footer className="py-12 bg-[#0B0B0B] border-t border-white/5 px-6 font-mono text-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded text-[#D4AF37]">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className="text-white font-bold font-display text-sm">
                      MK <span className="text-[#D4AF37]">CINEMATICS</span>
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs">
                    © {new Date().getFullYear()} MK CINEMATICS. Loaded under Secure Studio Standards. Created with React & Tailwind CSS.
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    {isAdmin ? (
                      <button 
                        onClick={() => setIsAdminPanelOpen(true)}
                        className="text-[#D4AF37] hover:underline hover:text-[#e5c758] font-bold cursor-pointer"
                      >
                        Open Console
                      </button>
                    ) : showAdminTriggers ? (
                      <button 
                        onClick={() => setIsLoginOpen(true)}
                        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Host portal
                      </button>
                    ) : null}
                  </div>

                </div>
              </footer>
            </>
          )}
        </>
      )}

    </div>
  );
}
