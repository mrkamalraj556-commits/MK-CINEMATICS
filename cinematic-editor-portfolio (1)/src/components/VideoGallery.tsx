import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Heart, Eye, Search, Sparkles, Trash2, Edit3, Plus, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Video } from "../types";

interface VideoGalleryProps {
  videos: Video[];
  isAdmin: boolean;
  likedVideoIds?: string[];
  onVideoClick: (video: Video) => void;
  onLikeClick: (id: string) => void;
  onDeleteVideo: (id: string) => void;
  onEditVideo: (video: Video) => void;
  onAddVideoClick: () => void;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "Popular Videos" },
  { value: "reels", label: "Reels & Shorts" },
  { value: "youtube", label: "YouTube Edit" },
  { value: "gaming", label: "Gaming Montages" },
  { value: "cinematic", label: "Cinematic Promo" },
  { value: "color-grading", label: "Color Grading" },
  { value: "photo-editing", label: "Photo Editing" },
  { value: "thumbnail", label: "Graphic Design" },
];

export default function VideoGallery({
  videos,
  isAdmin,
  likedVideoIds = [],
  onVideoClick,
  onLikeClick,
  onDeleteVideo,
  onEditVideo,
  onAddVideoClick,
}: VideoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (catVal: string) => {
    setSelectedCategory(catVal);
    setIsExpanded(false);
  };

  // Filter & sort videos based on category and search query. 
  // In 'All Cuts', we sort them by views + likes descending.
  const processedVideos = [...videos]
    .filter((video) => {
      const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      // Popularity score = views + likes
      const popularityA = (a.views || 0) + (a.likes || 0);
      const popularityB = (b.views || 0) + (b.likes || 0);
      return popularityB - popularityA;
    });

  // Limit shown videos to top 6 in "All Cuts" view, unless the user clicked 'View More Cuts' or searched
  const hasMore = selectedCategory === "all" && processedVideos.length > 6 && !searchQuery;
  const filteredVideos = (hasMore && !isExpanded)
    ? processedVideos.slice(0, 6)
    : processedVideos;

  return (
    <section id="showcase" className="py-24 bg-[#0b0b0b] px-6 border-t border-white/10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase mb-3">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              CURATED SHOWCASE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              CLIENT WORK & PROJECTS
            </h2>
            <p className="text-white/60 mt-2 max-w-xl text-sm sm:text-base font-light">
              A comprehensive archive of finished edits. Filter by format, look inside raw assets, increase the likes, and click to view.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search video titles or logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:bg-white/10"
              id="gallery-search"
            />
          </div>
        </div>

        {/* Categories Scroller list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 -mx-6 px-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.value
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold shadow-md"
                  : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
              id={`cat-filter-${cat.value}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Grid layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Admin Addition box as standard card inside panel */}
          {isAdmin && selectedCategory !== "all" && (
            <motion.button
              layout
              onClick={onAddVideoClick}
              className="flex flex-col items-center justify-center h-[380px] p-8 rounded-2xl bg-dashed border-2 border-dashed border-white/20 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all duration-300 group cursor-pointer text-center relative overflow-hidden"
              id="gallery-admin-add-card"
            >
              <div className="p-4 rounded-full bg-white/5 text-gray-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300 mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-white font-bold block text-lg font-display">Add New Project</span>
              <span className="text-gray-400 text-xs mt-1 block max-w-xs">
                Upload raw videos/thumbnails or provide direct URLs to add items under "{CATEGORIES.find(c => c.value === selectedCategory)?.label ?? selectedCategory}"
              </span>
            </motion.button>
          )}

          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.article
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col h-[400px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-xl hover:border-cyan-500/40 transition-all duration-500"
                id={`video-card-${video.id}`}
              >
                {/* Media Image Thumbnail block */}
                <div 
                  className="relative h-48 w-full overflow-hidden bg-gray-900 cursor-pointer"
                  onClick={() => onVideoClick(video)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Subtle Dark Image Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent opacity-60" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 p-1 px-2.5 rounded bg-[#0b0b0b]/80 backdrop-blur-md border border-white/10 text-cyan-400 text-[10px] font-mono tracking-wider font-semibold uppercase">
                    {video.category}
                  </span>

                  {/* Play Duration overlay */}
                  {video.duration && (
                    <span className="absolute bottom-3 right-4 p-1 px-1.5 rounded bg-[#0b0b0b]/80 backdrop-blur-sm text-gray-300 text-[11px] font-mono tracking-wider">
                      {video.duration}
                    </span>
                  )}

                  {/* Play Hover Transition Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-950/50 backdrop-blur-[2px]">
                    <div className="p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-black shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 fill-black" />
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      className="text-lg font-bold text-white font-display line-clamp-1 hover:text-cyan-400 transition-colors cursor-pointer"
                      onClick={() => onVideoClick(video)}
                    >
                      {video.title}
                    </h3>
                    <p className="text-white/60 mt-2 text-xs leading-relaxed line-clamp-3 font-light">
                      {video.description}
                    </p>
                  </div>

                  {/* Statistics Interactions row */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>{video.views}</span>
                      </div>
                      
                      {/* Interactive Client Likes clicker */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onLikeClick(video.id); }}
                        className={`flex items-center gap-1 group/like cursor-pointer transition-colors ${
                          likedVideoIds.includes(video.id)
                            ? "text-rose-500 hover:text-rose-400"
                            : "text-gray-400 hover:text-rose-400"
                        }`}
                        id={`like-btn-${video.id}`}
                        title={likedVideoIds.includes(video.id) ? "Liked! Click to unlike" : "Give some love!"}
                      >
                        <Heart 
                          className={`w-4 h-4 transition-all group-hover/like:scale-120 ${
                            likedVideoIds.includes(video.id)
                              ? "fill-rose-500 text-rose-500 scale-110"
                              : "text-gray-500 group-hover/like:text-rose-400 group-hover/like:fill-rose-500/30"
                          }`} 
                        />
                        <span className={likedVideoIds.includes(video.id) ? "font-semibold" : ""}>{video.likes}</span>
                      </button>
                    </div>

                    {/* Standard Action items or Admin edit capabilities */}
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditVideo(video)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/25 text-gray-300 hover:text-cyan-400 transition-colors border border-white/10 cursor-pointer"
                          id={`edit-btn-${video.id}`}
                          title="Modify details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteVideo(video.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                          id={`del-btn-${video.id}`}
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onVideoClick(video)}
                        className="flex items-center gap-1 text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        PLAY NOW
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

              </motion.article>
            ))}
          </AnimatePresence>

        </motion.div>

        {hasMore && (
          <div className="flex justify-center mt-12 w-full">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-300 transition-all duration-300 cursor-pointer flex items-center gap-2 font-mono uppercase tracking-wider shadow-lg hover:shadow-cyan-500/5"
              id="toggle-gallery-expand"
            >
              {isExpanded ? (
                <>
                  Show Less Videos
                  <ChevronUp className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                </>
              ) : (
                <>
                  View More Videos ({processedVideos.length - 6} more)
                  <ChevronDown className="w-4.5 h-4.5 text-cyan-400 animate-bounce" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state conditional */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl max-w-md mx-auto">
            <span className="block text-4xl mb-4">🎬</span>
            <h4 className="text-white font-bold text-lg font-display">No videos located</h4>
            <p className="text-gray-400 text-sm mt-1">
              No matching video cuts exist for your active query or filtered section. Let the admin upload new projects!
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
