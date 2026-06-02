import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  Mail, 
  Activity, 
  Eye, 
  Heart, 
  MessageSquare, 
  Check, 
  X, 
  Upload, 
  Clock, 
  FileVideo, 
  FolderSync,
  XCircle,
  Sparkles,
  Link,
  BookOpen
} from "lucide-react";
import { Video, ContactInquiry, DashboardStats, AppSettings } from "../types";
import { 
  fetchInquiriesFromFirestore, 
  updateInquiryStatusInFirestore, 
  deleteInquiryFromFirestore, 
  fetchGlobalSettingsFromFirestore, 
  updateSettingsInFirestore,
  createVideoInFirestore,
  updateVideoInFirestore,
  deleteVideoFromFirestore
} from "../lib/firestoreUtil";

interface AdminPanelProps {
  token: string;
  videos: Video[];
  onRefreshVideos: () => void;
  onClose: () => void;
  // Trigger editing externally if needed, or inline
}

export default function AdminPanel({ token, videos, onRefreshVideos, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "manage-videos" | "inquiries" | "settings">("stats");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: "", type: "info" });

  // Dynamic AppSettings states
  const [settings, setSettingsState] = useState<AppSettings>({
    whatsappNumber: "918890534383",
    email: "montykumawatmk@gmail.com",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpEnabled: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ text: "", type: "info" });
  
  // Video Add/Edit form state
  const [isEditing, setIsEditing] = useState<Video | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState<Video["category"]>("reels");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("0:30");

  // Multi-file upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Fetch Stats & Inquiries
  const fetchStats = async () => {
    try {
      setStats({
        totalVideos: videos.length,
        totalLikes: videos.reduce((acc, v) => acc + (v.likes || 0), 0),
        totalViews: videos.reduce((acc, v) => acc + (v.views || 0), 0),
        totalInquiries: inquiries.length
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const data = await fetchInquiriesFromFirestore();
      setInquiries(data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await fetchGlobalSettingsFromFirestore();
      setSettingsState({
        whatsappNumber: data.whatsappNumber || "918890534383",
        email: data.email || "montykumawatmk@gmail.com",
        smtpHost: data.smtpHost || "smtp.gmail.com",
        smtpPort: data.smtpPort || "587",
        smtpUser: data.smtpUser || "",
        smtpPass: data.smtpPass || "",
        smtpEnabled: !!data.smtpEnabled
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchSettings();
  }, [token, activeTab]);

  useEffect(() => {
    fetchStats();
  }, [videos, inquiries]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "thumbnail") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (restrict preview client upload check just for feedback)
    if (file.size > 100 * 1024 * 1024) {
      setFormMsg({ text: `File is too large! Maximum limit is 100MB. Yours was ${(file.size / (1024 * 1024)).toFixed(1)}MB.`, type: "error" });
      return;
    }

    if (type === "video") setUploadingVideo(true);
    else setUploadingThumb(true);

    const formData = new FormData();
    formData.append(type, file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (type === "video") {
          setVideoUrl(data.paths.videoPath);
          setFormMsg({ text: "MP4 Video file uploaded and auto-linked successfully!", type: "success" });
        } else {
          setThumbnailUrl(data.paths.thumbnailPath);
          setFormMsg({ text: "Thumbnail image file uploaded and auto-linked successfully!", type: "success" });
        }
      } else {
        setFormMsg({ text: data.error || `Upload failed. Try entering a public URL.`, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setFormMsg({ text: "Network connection lost during file transmission.", type: "error" });
    } finally {
      if (type === "video") setUploadingVideo(false);
      else setUploadingThumb(false);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setVideoTitle("");
    setVideoDesc("");
    setVideoCategory("reels");
    setVideoUrl("");
    setThumbnailUrl("");
    setVideoDuration("0:30");
    setFormMsg({ text: "", type: "info" });
  };

  const handleEditInit = (video: Video) => {
    setIsEditing(video);
    setVideoTitle(video.title);
    setVideoDesc(video.description);
    setVideoCategory(video.category);
    setVideoUrl(video.videoUrl);
    setThumbnailUrl(video.thumbnailUrl);
    setVideoDuration(video.duration || "0:30");
    setFormMsg({ text: `Editing video: ${video.title}`, type: "info" });
    
    // Scroll form to view
    const el = document.getElementById("admin-editor-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoCategory || !videoUrl) {
      setFormMsg({ text: "Title, Category, and Video URL/Path are completely mandatory.", type: "error" });
      return;
    }

    setFormLoading(true);
    const payload = {
      title: videoTitle,
      description: videoDesc,
      category: videoCategory,
      videoUrl,
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop",
      duration: videoDuration,
      createdAt: isEditing ? isEditing.createdAt : new Date().toISOString()
    };

    try {
      if (isEditing) {
        await updateVideoInFirestore(isEditing.id, payload);
        setFormMsg({ 
          text: "Video edited and synced successfully in Firestore!", 
          type: "success" 
        });
      } else {
        await createVideoInFirestore(payload);
        setFormMsg({ 
          text: "New video added successfully to Firestore portfolio!", 
          type: "success" 
        });
      }
      resetForm();
      onRefreshVideos();
      fetchInquiries();
    } catch (err) {
      console.error(err);
      setFormMsg({ text: "Database synchronization failed.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleVideoDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete: "${name}"?`)) return;
    try {
      await deleteVideoFromFirestore(id);
      onRefreshVideos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInquiryStatus = async (id: string, status: "new" | "replied" | "archived") => {
    try {
      await updateInquiryStatusInFirestore(id, status);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInquiryDelete = async (id: string) => {
    if (!confirm("Remove this client consultation logs?")) return;
    try {
      await deleteInquiryFromFirestore(id);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettingsState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg({ text: "", type: "info" });

    try {
      await updateSettingsInFirestore(settings);
      setSettingsMsg({ text: "Configurations synchronized and written to Firestore successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setSettingsMsg({ text: "Failed to update configurations in Firestore.", type: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setSettingsMsg({ text: "Transmitting a verified test email...", type: "info" });

    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          email: settings.email
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsMsg({ text: `Test email dispatched successfully! Double check your email inbox: ${settings.email}`, type: "success" });
      } else {
        setSettingsMsg({ text: data.error || "Failed to transmit test email.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setSettingsMsg({ text: "Network connection lost during SMTP handshake test.", type: "error" });
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <section id="admin-dashboard" className="py-24 bg-[#0b0b0b] px-6 border-t border-white/10 relative">
      <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-blue-500" />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Board */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest font-mono font-bold text-cyan-400 uppercase">
                ADMIN CONSOLE SECURE
              </span>
              <h2 className="text-3xl font-extrabold text-white font-display tracking-tight text-left">
                PORTFOLIO MANAGEMENT DASHBOARD
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-start md:self-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            id="close-admin-tab-btn"
          >
            Collapse Dashboard
          </button>
        </div>

        {/* Tab Scroller Links */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar justify-start">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "stats"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-opt-stats"
          >
            <Activity className="w-4 h-4" />
            Stats Analytics
          </button>

          <button
            onClick={() => setActiveTab("manage-videos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "manage-videos"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-opt-videos"
          >
            <FileVideo className="w-4 h-4" />
            Add / Edit Video Cuts
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === "inquiries"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-opt-inquiries"
          >
            <Mail className="w-4 h-4" />
            Client Inquiries inbox
            {inquiries.some((i) => i.status === "new") && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === "settings"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-opt-settings"
          >
            <FolderSync className="w-4 h-4" />
            Settings (WhatsApp & Email)
          </button>
        </div>

        {/* 1. Stat Panel Tab */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            
            {/* Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl glass-panel border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Video Projects</span>
                  <span className="text-3xl font-extrabold text-white font-display block mt-1">{stats?.totalVideos ?? 0}</span>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/15">
                  <FileVideo className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Accumulated Views</span>
                  <span className="text-3xl font-extrabold text-white font-display block mt-1">{stats?.totalViews ?? 0}</span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/15">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Client Likes</span>
                  <span className="text-3xl font-extrabold text-white font-display block mt-1">{stats?.totalLikes ?? 0}</span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/15">
                  <Heart className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Client Consultations</span>
                  <span className="text-3xl font-extrabold text-white font-display block mt-1">{stats?.totalInquiries ?? 0}</span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/15">
                  <Mail className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Quick action list / helper guide */}
            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 max-w-4xl">
              <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Quick Administrator Guidelines
              </h3>
              <ul className="space-y-2 text-xs text-gray-400 font-mono list-disc pl-5 leading-relaxed">
                <li>Under <strong className="text-white">Add / Edit Video Cuts</strong>, you can configure new entries for your gallery. You can write YouTube/Vimeo links OR upload MP4 and thumbnail clips directly up to <strong className="text-white">100MB per file</strong>.</li>
                <li>When normal visitors click on video showcase play overlays, their views counter automatically increments by +1 in the server data log.</li>
                <li>Your default server-side database backup is hosted securely inside <strong className="text-white">/data/db.json</strong> on Node.js disk to persist edits.</li>
                <li>Client consult submissions are rendered instantly in the third tab for direct mail reviews.</li>
              </ul>
            </div>

          </div>
        )}

        {/* 2. Video Content Project Editor Tab */}
        {activeTab === "manage-videos" && (
          <div className="space-y-12">
            
            {/* Form Console Block */}
            <div id="admin-editor-form" className="p-8 rounded-2xl glass-panel border-white/10 max-w-4xl relative overflow-hidden">
              <h3 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                {isEditing ? `EDIT VIDEO CONSOLE: ${isEditing.title}` : "ADD NEW VIDEO TO PORTFOLIO"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Apex Legends Highlight Sync"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs"
                      id="admin-form-title"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase">
                      Category Category *
                    </label>
                    <select
                      value={videoCategory}
                      onChange={(e) => setVideoCategory(e.target.value as Video["category"])}
                      className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-white/10 text-white text-xs text-mono"
                      id="admin-form-category"
                    >
                      <option value="reels">reels - Cinematic Reels / Shorts (Vertical)</option>
                      <option value="youtube">youtube - YouTube Video cuts</option>
                      <option value="gaming">gaming - Esports / Gaming Montages</option>
                      <option value="cinematic">cinematic - Brand Promotion & Ads</option>
                      <option value="color-grading">color-grading - Slog-3 Look comparisons</option>
                      <option value="thumbnail">thumbnail - CTR Thumbnail Graphic showcase</option>
                    </select>
                  </div>
                </div>

                {/* Video URL & File Direct upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  
                  {/* Video URL Text */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase flex items-center justify-between">
                      <span>Video Stream URL (MP4, YouTube, Vimeo) *</span>
                      <span className="text-[10px] text-gray-500">Inputs override uploads</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=abc or /uploads/temp-123.mp4"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs"
                      id="admin-form-videourl"
                    />
                  </div>

                  {/* Browse MP4 Upload */}
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => handleFileUpload(e, "video")}
                      accept="video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-emerald-500 hover:bg-emerald-500/5 text-gray-400 hover:text-emerald-400 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      id="admin-form-videobrowse"
                    >
                      {uploadingVideo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          <span>Uploading Direct MP4 (Up to 100MB)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Browse & Upload raw MP4 Clip</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Thumbnail URL & File direct Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  
                  {/* Thumbnail URL Text */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase">
                      Thumbnail Image URL / Path (Defaults to fallback Unsplash image)
                    </label>
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-... or /uploads/thumb-123.jpg"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs"
                      id="admin-form-thumburl"
                    />
                  </div>

                  {/* Browse JPEG/PNG Upload */}
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      ref={thumbInputRef}
                      onChange={(e) => handleFileUpload(e, "thumbnail")}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingThumb}
                      onClick={() => thumbInputRef.current?.click()}
                      className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-emerald-500 hover:bg-emerald-500/5 text-gray-400 hover:text-emerald-400 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      id="admin-form-thumbbrowse"
                    >
                      {uploadingThumb ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          <span>Uploading Image (PNG/JPEG)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Browse & Upload custom Thumbnail</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase">
                      Visual Duration (e.g. 0:45)
                    </label>
                    <input
                      type="text"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      placeholder="0:30"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs"
                      id="admin-form-duration"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-gray-300 uppercase">
                    Description / Project Logs
                  </label>
                  <textarea
                    rows={3}
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    placeholder="Provide context of your edits, sound packs, tracking, masks features, lut charts etc..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs resize-none"
                    id="admin-form-desc"
                  />
                </div>

                {/* Status Message */}
                {formMsg.text && (
                  <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                    formMsg.type === "success" 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : formMsg.type === "error"
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  }`}>
                    <span>{formMsg.text}</span>
                  </div>
                )}

                {/* Submit button row */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-8 py-3.5 rounded-xl bg-emerald-500 text-gray-950 hover:bg-emerald-440 text-xs font-bold font-mono tracking-wider transition-all disabled:opacity-50 inline-flex items-center gap-2 uppercase cursor-pointer"
                    id="admin-form-submit-btn"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                        <span>Applying system changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-gray-950" />
                        <span>{isEditing ? "Save Updated Logs" : "Instantly Deploy Video Project"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 transition-all font-mono"
                  >
                    Clear Form / Cancel
                  </button>
                </div>

              </form>
            </div>

            {/* Existing Portfolio Records List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-white">
                CURRENT PORTFOLIO DATABASE LISTING ({videos.length})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-gray-950/60">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-gray-300 uppercase tracking-wider text-[10px]">
                      <th className="p-4 font-semibold">Thumbnail / Project Title</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Likes / Views</th>
                      <th className="p-4 font-semibold">Duration / Path</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((vid) => (
                      <tr key={vid.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors leading-relaxed">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-9 rounded object-cover border border-white/10"
                          />
                          <div>
                            <span className="block font-bold text-white font-display text-sm">{vid.title}</span>
                            <span className="block text-[10px] text-gray-500 max-w-sm line-clamp-1">{vid.description}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-amber-500 uppercase text-[9px] font-bold">
                            {vid.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white font-bold">{vid.likes} Likes</span>
                            <span>{vid.views} Views</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">
                          <div className="flex flex-col">
                            <span className="text-gray-300 font-semibold">{vid.duration || "0:00"}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-xs">{vid.videoUrl}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditInit(vid)}
                              className="p-1 px-2.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/20 cursor-pointer text-[10px] uppercase"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleVideoDelete(vid.id, vid.title)}
                              className="p-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 cursor-pointer text-[10px] uppercase animate-pulse-slow"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. Client Inquiries Inbox Tab */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-display text-white">
              CLIENT CONSULTATION LEDGER ({inquiries.length})
            </h3>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center bg-gray-950/60 rounded-2xl border border-white/5">
                <span className="block text-4xl mb-2">📬</span>
                <span className="block text-sm text-gray-400 font-mono">No customer submissions received yet.</span>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {inquiries.map((inq) => (
                  <div 
                    key={inq.id} 
                    className={`p-6 rounded-xl border transition-all ${
                      inq.status === "new" 
                        ? "bg-emerald-500/[0.02] border-emerald-500/20 shadow-md shadow-emerald-500/[0.02]" 
                        : "bg-white/[0.01] border-white/5"
                    }`}
                    id={`inq-box-${inq.id}`}
                  >
                    {/* Status badges header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inq.status === "new"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/10 text-gray-400"
                        }`}>
                          {inq.status} Submission
                        </span>
                        <span className="text-[10px] font-mono text-amber-500 font-semibold uppercase tracking-wider">
                          Service Needed: {inq.service}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Sender block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4 text-gray-300">
                      <div>
                        <span className="text-gray-500 block uppercase text-[10px]">Client Name</span>
                        <span className="font-bold text-white text-sm font-display">{inq.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase text-[10px]">Direct Email</span>
                        <a href={`mailto:${inq.email}`} className="text-amber-400 underline hover:text-amber-500">
                          {inq.email}
                        </a>
                      </div>
                    </div>

                    {/* Message detail raw text text */}
                    <div className="p-4 rounded bg-gray-950/80 border border-white/5 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {inq.message}
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {inq.status === "new" && (
                          <button
                            onClick={() => handleInquiryStatus(inq.id, "replied")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase hover:bg-emerald-500/20 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark as Replied
                          </button>
                        )}
                        {inq.status !== "archived" && (
                          <button
                            onClick={() => handleInquiryStatus(inq.id, "archived")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 text-gray-300 border border-white/10 text-[10px] font-bold uppercase hover:bg-white/10 cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleInquiryDelete(inq.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                        title="Remove records"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Connectors & API Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8 max-w-4xl text-left" id="settings-tab-view">
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                API CONNECTORS & COMMUNICATION SETTINGS
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-2">
                Configure your public WhatsApp hot-path routing and real-time email synchronization keys.
              </p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-8">
              {/* Box 1: Core Contact Coordinates */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.01] border border-white/5 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400 opacity-80" />
                <h4 className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  1. Live Message Coordinates
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WhatsApp input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      WhatsApp Phone Number (With Country Code)
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      required
                      value={settings.whatsappNumber}
                      onChange={handleSettingsChange}
                      placeholder="e.g. 911234567890"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono"
                    />
                    <span className="block text-[10px] text-gray-500 font-mono">
                      Must start with country code without '+', spaces or hyphens (e.g., <strong>91</strong> for India followed by your number).
                    </span>
                  </div>

                  {/* Forward Email Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      Target Notification Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={settings.email}
                      onChange={handleSettingsChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono"
                    />
                    <span className="block text-[10px] text-gray-500 font-mono">
                      All new consultation messages sent by users will be instantly forwarded to this email address.
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: SMTP Mail Keys */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.01] border border-white/5 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-80" />
                
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <h4 className="text-sm font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    2. Server-Side SMTP Email Forwarding
                  </h4>

                  {/* Enable notification checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="smtpEnabled"
                      checked={!!settings.smtpEnabled}
                      onChange={handleSettingsChange}
                      className="w-4.5 h-4.5 rounded bg-gray-900 border border-white/20 focus:ring-0 checked:bg-cyan-500 text-cyan-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white font-medium uppercase tracking-wider">
                      Enable Forwarding
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      SMTP Host (Mail Server)
                    </label>
                    <input
                      type="text"
                      name="smtpHost"
                      disabled={!settings.smtpEnabled}
                      value={settings.smtpHost || ""}
                      onChange={handleSettingsChange}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      name="smtpPort"
                      disabled={!settings.smtpEnabled}
                      value={settings.smtpPort || ""}
                      onChange={handleSettingsChange}
                      placeholder="587"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      Connection SSL
                    </label>
                    <div className="py-3 px-4 rounded-xl bg-white/2 border border-white/5 text-gray-400 text-xs font-mono select-none">
                      {settings.smtpPort === "465" ? "🔒 Explicit SSL" : "⚡ TLS / StartTLS"}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      Authorized Username (Email)
                    </label>
                    <input
                      type="text"
                      name="smtpUser"
                      disabled={!settings.smtpEnabled}
                      value={settings.smtpUser || ""}
                      onChange={handleSettingsChange}
                      placeholder="user@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      App-Specific Mail Code (Password)
                    </label>
                    <input
                      type="password"
                      name="smtpPass"
                      disabled={!settings.smtpEnabled}
                      value={settings.smtpPass || ""}
                      onChange={handleSettingsChange}
                      placeholder="••••••••••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20 text-cyan-400 text-xs font-light leading-relaxed">
                  <span className="font-bold text-white block uppercase mb-1 font-mono">Gmail Integration Instruction:</span>
                  If using a standard <strong className="text-white">Gmail</strong> account:
                  <ol className="list-decimal list-inside space-y-1 mt-1 font-mono text-[11px] text-gray-300">
                    <li>Activate <strong className="text-cyan-300">2-Step Verification</strong> on your Google Account profile.</li>
                    <li>Search for <strong className="text-cyan-300">"App Passwords"</strong> inside Google Search accounts settings.</li>
                    <li>Generate a new App Password styled for "Select App: Other, Name: Portfolio-Mail".</li>
                    <li>Copy the resulting <strong className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">16-character secure code</strong> directly into the password box above.</li>
                  </ol>
                </div>
              </div>

              {/* Loader, success message display */}
              {settingsMsg.text && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                    settingsMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : settingsMsg.type === "error"
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                      : "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                  }`}
                  id="settings-form-msg"
                >
                  <span className="text-base">
                    {settingsMsg.type === "success" ? "✓" : settingsMsg.type === "error" ? "⚠" : "ℹ"}
                  </span>
                  <span className="font-mono">{settingsMsg.text}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="submit"
                  disabled={settingsLoading || testEmailLoading}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-sm tracking-wider uppercase disabled:opacity-40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {settingsLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save & Apply Changes"
                  )}
                </button>

                {settings.smtpEnabled && (
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={settingsLoading || testEmailLoading || !settings.smtpUser || !settings.smtpPass}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wider uppercase hover:border-cyan-400/50 disabled:opacity-35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {testEmailLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Transmitting handshake...
                      </>
                    ) : (
                      "Send Connection Test Email"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </section>
  );
}
