import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Heart, Share2, Calendar, Eye, Check } from "lucide-react";
import { Video } from "../types";

interface VideoModalPlayerProps {
  video: Video | null;
  likedVideoIds?: string[];
  onClose: () => void;
  onLike: (id: string) => void;
}

export default function VideoModalPlayer({ video, likedVideoIds = [], onClose, onLike }: VideoModalPlayerProps) {
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const handleShare = () => {
    // Copy the video URL or current window URL with query param
    const shareUrl = video.videoUrl;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isYouTube = video.videoUrl ? (video.videoUrl.includes("youtube.com") || video.videoUrl.includes("youtu.be")) : false;
  const isVimeo = video.videoUrl ? video.videoUrl.includes("vimeo.com") : false;
  const isImage = !video.videoUrl || 
                  video.videoUrl.endsWith(".png") || 
                  video.videoUrl.endsWith(".jpg") || 
                  video.videoUrl.endsWith(".jpeg") || 
                  video.videoUrl.endsWith(".webp") || 
                  video.category === "photo-editing";

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("embed/")) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  const getVimeoEmbedUrl = (url: string) => {
    if (url.includes("player.vimeo.com")) return url;
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      
      {/* Absolute Backdrop closing trigger */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Floating Modal Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-5xl glass-panel shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col"
        id="video-player-modal"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/80 text-left">
          <span className="p-1 px-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono rounded font-semibold uppercase tracking-wider">
            Now Playing: {video.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display / Image Viewer */}
        <div className="relative aspect-video w-full bg-black text-left flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isVimeo ? (
            <iframe
              src={getVimeoEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.videoUrl}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>

        {/* Info detail block */}
        <div className="p-6 md:p-8 bg-[#0b0b0b] flex flex-col md:flex-row gap-6 justify-between items-start text-left">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight text-left">
              {video.title}
            </h3>
            
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 mt-2 text-left">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-widest text-[10px] text-left">
                {video.category} edit
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                {new Date(video.createdAt).toLocaleDateString()}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                {video.views} Views
              </span>
            </div>

            <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-3xl font-light text-left">
              {video.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-start justify-end">
            <button
              onClick={() => onLike(video.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all cursor-pointer ${
                likedVideoIds.includes(video.id)
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:bg-rose-500/20"
                  : "bg-white/5 border-white/10 text-gray-300 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 group"
              }`}
              id="modal-like-btn"
              title={likedVideoIds.includes(video.id) ? "Liked! Click to unlike" : "Give some love!"}
            >
              <Heart 
                className={`w-4 h-4 transition-transform group-hover:scale-120 ${
                  likedVideoIds.includes(video.id)
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-gray-400 group-hover:text-rose-400"
                }`} 
              />
              <span className={likedVideoIds.includes(video.id) ? "font-semibold" : ""}>
                {video.likes} {likedVideoIds.includes(video.id) ? "Liked!" : "Likes"}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 text-sm font-semibold transition-all cursor-pointer"
              id="modal-share-btn"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Cut</span>
                </>
              )}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
