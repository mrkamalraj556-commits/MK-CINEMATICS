import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, 
  Tv, 
  Gamepad2, 
  Sliders, 
  Layers, 
  Scissors, 
  Check, 
  Sparkles, 
  Briefcase,
  X,
  Play,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
  Award,
  Zap,
  ArrowRight
} from "lucide-react";
import { fetchGlobalSettingsFromFirestore } from "../lib/firestoreUtil";

// Before/After Slider Component for interactive color grading & thumbnail displays
function BeforeAfterSlider({ 
  beforeUrl, 
  afterUrl, 
  labelBefore = "RAW / LOG", 
  labelAfter = "CINEMATIC GRADED",
  isThumbnail = false
}: { 
  beforeUrl: string; 
  afterUrl: string; 
  labelBefore?: string; 
  labelAfter?: string;
  isThumbnail?: boolean;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 select-none cursor-ew-resize group/slider bg-gray-950"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image (LOG Flat Profile Overlay) */}
      <img 
        src={beforeUrl} 
        alt="Before Cut" 
        className={`absolute inset-0 w-full h-full object-cover select-none ${
          isThumbnail ? "filter contrast-75 brightness-75 blur-[1px]" : "filter saturate-[0.1] contrast-[0.7] brightness-[1.05]"
        }`}
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 border border-white/10 backdrop-blur-sm text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 z-10">
        {labelBefore}
      </div>

      {/* After Image (Cinematic Grade / High CTR Design) */}
      <div 
        className="absolute inset-y-0 left-0 right-0 overflow-hidden z-0"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={afterUrl} 
          alt="After Cut" 
          className={`absolute inset-0 w-full h-full object-cover select-none ${
            isThumbnail ? "filter saturate-[1.3] brightness-[1.1]" : "filter saturate-[1.4] contrast-[1.25] hue-rotate-[3deg]"
          }`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-amber-500/90 text-black font-mono font-bold tracking-wider uppercase text-[10px] border border-amber-600 z-10">
          {labelAfter}
        </div>
      </div>

      {/* Slider Divider Bar */}
      <div 
        className="absolute inset-y-0 w-0.5 bg-amber-400 group-hover/slider:bg-amber-300 transition-colors pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle Knob */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#121212] border-2 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
          <Sliders className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface PortfolioItem {
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  ctr?: string;
}

interface ServiceData {
  id: string;
  key: string; // matches option in ContactForm select
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  badge?: string;
  features: string[];
  workflow: string[];
  software: string[];
  deliveryTime: string;
  portfolio: PortfolioItem[];
  beforeAfterImage?: {
    before: string;
    after: string;
    labelBefore?: string;
    labelAfter?: string;
    isThumbnail?: boolean;
  };
}

const SERVICES_DATA: ServiceData[] = [
  {
    id: "s1",
    key: "reels",
    title: "Reel & Short Editing",
    badge: "Most Popular",
    description: "High-retention vertical edits designed to stop the infinite scroll. Perfect for Instagram Reels, TikTok, and YouTube Shorts.",
    detailedDescription: "Stop the infinite scroll with high-impact, retention-optimized vertical content. We combine sub-second kinetic cuts, colorful emojis, sound effects (SFX), zoom ramp ins, and fast pacing to capture user attention in the first 2 seconds and maximize average watch time.",
    icon: Smartphone,
    features: [
      "Sub-second kinetic cuts for rapid engagement",
      "Dynamic auto-styled captions and visual emojis",
      "Sound design layering (swooshes, pops, & impact beats)",
      "Vibrant zoom mapping and panning adjustments",
      "Hook strategy optimization in the first 2 seconds"
    ],
    workflow: [
      "01. Retention Planning: Hook ideation to lock user attention instantly.",
      "02. Kinetic Storytelling: Cutting dead air and spacing to keep edits rapid.",
      "03. Graphic Overlay: Injecting colorful dynamic captions, pop sound bites, and trackers.",
      "04. Audio Mastering: Fine-tuning vocals and ducking upbeat background themes."
    ],
    software: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve"],
    deliveryTime: "24 - 48 Hours",
    portfolio: [
      {
        title: "Gym Grind Hook Edit",
        subtitle: "97% initial hook retention vertical cutoff",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-boxer-training-alone-in-the-gym-43093-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&fit=crop"
      },
      {
        title: "Neon City Dancer Short",
        subtitle: "Vibe styling & kinetic subtitles",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-dancing-woman-in-the-city-at-night-42283-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&fit=crop"
      },
      {
        title: "Culinary Fast ASMR",
        subtitle: "Sound syncing & visual pops combo",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-chef-slicing-onions-42220-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&fit=crop"
      }
    ]
  },
  {
    id: "s2",
    key: "youtube",
    title: "YouTube Video Editing",
    description: "Multi-layered documentary or vlog editing that grips the viewer throughout the video, increasing your average view duration.",
    detailedDescription: "Full-scale professional editing for YouTube creators, educationalists, and businesses. We map raw sequences into immersive storytelling frameworks. Using elegant B-roll layering, clean soundscapes, screen zooms, dialogue flow, and dynamic graphic assets to maximize engagement.",
    icon: Tv,
    features: [
      "Rigid storytelling flow with unnecessary pauses skipped",
      "Dynamic B-rolls matching vocal discussions",
      "Foley ASMR and deep spatial audio balancing",
      "Cinematic intros, custom slideouts, and lower-third graphics",
      "Seamless multi-camera angle synchronization"
    ],
    workflow: [
      "01. Sequence Logging: Trimming raw recordings into cohesive pacing loops.",
      "02. Immersive Layering: Syncing rich B-rolls, stock videos, and screenshots.",
      "03. Graphics Integration: Designing interactive lower thirds and text callouts.",
      "04. Soundscapes & SFX: Leveling voices, overlaying lofi tracks, and adding Foley."
    ],
    software: ["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects", "Adobe Audition"],
    deliveryTime: "3 - 5 Days",
    portfolio: [
      {
        title: "Documentary: Art of Coffee Crafting",
        subtitle: "Cinematic close-ups, warm color lookup",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-machine-dripping-fresh-beverage-42224-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&fit=crop"
      },
      {
        title: "Developer Desk Setup Vlog",
        subtitle: "Lofi vibe lighting & ASMR click sequences",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-glowing-keyboard-in-a-dark-room-41916-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&fit=crop"
      }
    ]
  },
  {
    id: "s3",
    key: "gaming",
    title: "Esports & Gaming Montages",
    description: "Adrenaline-fueled montages synced exactly to high-energy beats with custom visual shockwaves and speed curves.",
    detailedDescription: "Intensify your gaming clips with top-tier montage editing. We use sub-pixel beat-snaps, slow-motion velocity ramps, neon outline tracking, shockwave impacts, sound design for weapon prompts, and beautiful aesthetic grading to deliver high-octane edits.",
    icon: Gamepad2,
    features: [
      "100% beat-accurate frame sync cuts",
      "Custom velocity/speed ramps highlighting kills",
      "VFX neon glowing lines and twitch screen shakes",
      "Premium stylized screen grading & vignette lights",
      "High-pass audio filters emphasizing weapon actions"
    ],
    workflow: [
      "01. Clip Selection: Selecting top gaming action moments for synchronization.",
      "02. Audio Sync: Mapping speed ramps to the exact rhythm spikes of your background audio.",
      "03. Shaken Impacts: Rendering Custom VFX shakes, overlay lighting, and blur frames.",
      "04. Audio Enhancement: Tweaking shotgun blast depth and high ultimate cues."
    ],
    software: ["Adobe After Effects", "Vegas Pro", "Adobe Premiere Pro"],
    deliveryTime: "2 - 4 Days",
    portfolio: [
      {
        title: "Apex Speed Sync Montage",
        subtitle: "120bpm frame velocity curve alignment",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-on-a-glowing-neon-gaming-keyboard-51167-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&fit=crop"
      },
      {
        title: "Symphony of Headshots Montage",
        subtitle: "Custom impact flares & neon trails",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-gaming-streamer-celebrating-winning-a-match-51886-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1629431722238-ac059e0eeebb?q=80&w=600&fit=crop"
      }
    ]
  },
  {
    id: "s4",
    key: "cinematic",
    title: "Cinematic Brand Edits",
    description: "Premium editorial films for luxury products, corporate highlights, real estate, and event campaigns that tell a deep story.",
    detailedDescription: "Hollywood-standard audiovisual storytelling representing luxury brands, real estate, and corporate events. We craft majestic transitions, dramatic speed adjustments, epic B-roll maps, and a multi-layered atmospheric score to make your projects look cinematic, emotional, and pristine.",
    icon: Scissors,
    features: [
      "Hollywood-style multi-format cinematic layouts",
      "Epic drone and macro close-up B-roll planning",
      "Atmospheric and orchestral background design",
      "Sophisticated seamless sound transitions and sweeps",
      "Commercial-grade depth and cinematic flow styling"
    ],
    workflow: [
      "01. Story Concept: Mapping visual message flow based on corporate values.",
      "02. Grid Rhythms: Matching pacing with majestic transition sweeps and audio rises.",
      "03. Atmosphere Layering: Fusing dialogue, outdoor noise, and score sweeps.",
      "04. Finishing Glows: Letterboxing widescreen grids and rendering movie titles."
    ],
    software: ["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects"],
    deliveryTime: "4 - 7 Days",
    portfolio: [
      {
        title: "Mountain Majestic Promo",
        subtitle: "Drone scenic layouts, wide atmosphere sound",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-green-forest-and-mountains-42296-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&fit=crop"
      },
      {
        title: "Artisanal Liquid Commercial",
        subtitle: "Detailed focus pull & slow-motion drips",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-serving-fresh-pour-over-coffee-41662-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600&fit=crop"
      },
      {
        title: "Boutique Chrono B-Roll",
        subtitle: "Luxury reflection lights & lens focus curves",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-glowing-modern-watches-broll-42411-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&fit=crop"
      }
    ]
  },
  {
    id: "s5",
    key: "color-grading",
    title: "Advanced Color Grading",
    description: "Professional node-based correction and stylized grading that converts raw flat LOG profiles into rich, cinematic lookups.",
    detailedDescription: "Elevate your footage into high-art aesthetics. We specialize in transforming grey, low-contrast LOG/RAW camera files into rich filmic lookups. Matching multi-camera setups, recovering natural skin tones, and creating teal-and-orange styles, sunset blooms, and film halation.",
    icon: Sliders,
    features: [
      "LOG / RAW conversion matching camera spaces",
      "Dynamic skin-tone mask recoveries & face tracking",
      "Vibrant signature Teal & Gold lookup palettes",
      "Ambient lighting, vignetting, & halation blooms",
      "Authentic film grain layers & analog noise"
    ],
    workflow: [
      "01. Camera Balancing: Setting color models for contrasting camera profiles.",
      "02. Primary Grades: Scaling contrast ratios, luminance curves, and black/white depths.",
      "03. Secondaries: Isolating skies and skins to keep tone assets balanced.",
      "04. Film Aesthetics: Infusing cinematic LUT signatures, glows, and custom textures."
    ],
    software: ["DaVinci Resolve Studio", "Dehancer Pro Plugins", "Node-based Trees"],
    deliveryTime: "2 - 3 Days",
    portfolio: [
      {
        title: "Mountain Range Grade",
        subtitle: "Teal-Orange sunset theme",
        videoUrl: "",
        thumbnailUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600&fit=crop"
      }
    ],
    beforeAfterImage: {
      before: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600&fit=crop",
      after: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600&fit=crop",
      labelBefore: "RAW FLAT LOG",
      labelAfter: "CINEMATIC TEAL & GOLD"
    }
  },
  {
    id: "s6",
    key: "thumbnail",
    title: "Thumbnail & CTR Designs",
    description: "Expressive, high-contrast, scroll-stopping thumbnails tailored to trigger massive click-through rates.",
    detailedDescription: "A thumbnail is 90% of why a viewer clicks. We design high-contrast Photoshop compositions tailored for high-CTR. Incorporating premium subject cutouts, thick glowing stroke outlines, textured 3D typography, and custom light leak backdrops to guarantee your videos stand out.",
    icon: Layers,
    features: [
      "Surgical subject extraction and custom drop-shadows",
      "Thick high-contrast neon borders around focal elements",
      "Angled, styled bold 3D text layers that read instantly",
      "Contrast mapping & highlight enhancements for human expressions",
      "Heatmap preview testing representing desktop/mobile boxes"
    ],
    workflow: [
      "01. Composition Draft: Mapping the rule of thirds so focus guides smoothly.",
      "02. Face Isolation: Raising brightness, detail definitions, and expressions.",
      "03. Background Lighting: Constructing high-impact glow overlays & light beams.",
      "04. Text Detailing: Carving large high-impact custom typography with border drops."
    ],
    software: ["Adobe Photoshop CC", "Midjourney (AI Composites)", "Blender"],
    deliveryTime: "12 - 24 Hours",
    portfolio: [
      {
        title: "Gaming Setup Composite",
        subtitle: "15.2% CTR Overlays",
        videoUrl: "",
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&fit=crop",
        ctr: "15.2% CTR"
      },
      {
        title: "Coffee Art Minimalist Design",
        subtitle: "12.8% CTR Layout",
        videoUrl: "",
        thumbnailUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&fit=crop",
        ctr: "12.8% CTR"
      }
    ],
    beforeAfterImage: {
      before: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&fit=crop",
      after: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&fit=crop",
      labelBefore: "RAW CAPTURE",
      labelAfter: "CLICK-ENHANCED OUTLINE",
      isThumbnail: true
    }
  }
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("918890534383");
  const [ownerEmail, setOwnerEmail] = useState("montykumawatmk@gmail.com");

  useEffect(() => {
    fetchGlobalSettingsFromFirestore()
      .then((data) => {
        if (data) {
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (data.email) setOwnerEmail(data.email);
        }
      })
      .catch((err) => console.log("Failed to load settings in Services module:", err));
  }, []);

  const triggerHireMe = (serviceKey: string) => {
    // Dispatch custom event to select target option inside the consultation form
    window.dispatchEvent(new CustomEvent("set-selected-service", { detail: serviceKey }));
    
    // Close modal if open
    setSelectedService(null);
    setIsPlayingLocal(false);

    // Scroll smoothly to contact area
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // Try focusing name field
        const nameInput = document.getElementById("form-input-name");
        if (nameInput) nameInput.focus();
      }
    }, 150);
  };

  const openPortfolioModal = (service: ServiceData) => {
    setSelectedService(service);
    setActiveMediaIndex(0);
    setIsPlayingLocal(false);
  };

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const getWaUrl = (serviceTitle: string) => {
    const textMsg = `Hi Monty 👋\n\nI just visited your services gallery and I'm interested in hiring you for ${serviceTitle}.\n\nCould we discuss custom packages?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`;
  };

  return (
    <section id="services" className="py-24 bg-[#0b0b0b] px-6 border-t border-white/10 relative">
      {/* Background elegant glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-amber-500/5 to-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-xs font-semibold tracking-wider uppercase mb-3 justify-center bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Briefcase className="w-3.5 h-3.5" />
            FREELANCE SERVICES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            CRAFTED EDITING SYSTEMS
          </h2>
          <p className="text-white/60 mt-4 text-sm sm:text-base font-light">
            Convert prospects and engage viewers with ultra-premium video structures. Choose a service below to explore interactive case-studies, workflows, and portfolio timelines.
          </p>
        </div>

        {/* Clickable Bento Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => openPortfolioModal(service)}
                className={`relative p-8 rounded-2xl bg-[#111] hover:bg-[#151515] border border-white/5 hover:border-amber-500/40 cursor-pointer group flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(212,175,55,0.08)]`}
                id={`service-card-${service.id}`}
              >
                {/* Popular Special Badge tag */}
                {service.badge && (
                  <span className="absolute top-4 right-4 py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold tracking-wider uppercase text-amber-400">
                    {service.badge}
                  </span>
                )}

                <div>
                  {/* Icon Block */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center text-gray-300 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all duration-300 mb-6">
                    <IconComponent className="w-6 h-6 stroke-[1.8px]" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold font-display text-white group-hover:text-amber-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-3 leading-relaxed font-light mb-6">
                    {service.description}
                  </p>

                  <hr className="border-white/5" />

                  {/* Highlights overview */}
                  <ul className="space-y-2.5 mt-5">
                    {service.features.slice(0, 3).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-[11px] text-gray-400 font-mono">
                        <div className="p-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Action buttons (propagates stop click to handle separately) */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPortfolioModal(service);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-mono uppercase tracking-wider transition-all hover:text-amber-400 hover:border-amber-400/30 flex items-center justify-center gap-1.5"
                  >
                    Portfolio
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHireMe(service.key);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all"
                  >
                    Hire Me
                  </button>
                </div>

                {/* Bottom line accent */}
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-400 to-amber-600 rounded absolute bottom-0 left-0 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>



        {/* Upgraded Premium Services Modal Popup */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
              {/* Backdrop closer */}
              <div className="absolute inset-0 cursor-default" onClick={() => { setSelectedService(null); setIsPlayingLocal(false); }} />

              {/* Floating Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative w-full max-w-5xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] max-h-[90vh] flex flex-col text-left"
              >
                {/* Header navbar toolbar */}
                <div className="flex items-center justify-between p-5 px-6 border-b border-white/10 bg-black/50 text-left">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-xs">
                      {React.createElement(selectedService.icon, { className: "w-4 h-4" })}
                    </div>
                    <span className="text-white text-xs font-mono uppercase tracking-widest font-bold">
                      Interactive Showcase / {selectedService.title}
                    </span>
                  </div>
                  <button
                    onClick={() => { setSelectedService(null); setIsPlayingLocal(false); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal scroll area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-h-[calc(90vh-140px)]">
                  
                  {/* Grid Layout splits content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Media display / Before Afters */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Media Display Block */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold font-mono tracking-wider uppercase text-amber-400">
                          Primary Showcase Asset:
                        </h4>

                        {/* Interactive conditional switcher (Before After slider vs Video player) */}
                        {selectedService.beforeAfterImage ? (
                          <BeforeAfterSlider 
                            beforeUrl={selectedService.beforeAfterImage.before}
                            afterUrl={selectedService.beforeAfterImage.after}
                            labelBefore={selectedService.beforeAfterImage.labelBefore}
                            labelAfter={selectedService.beforeAfterImage.labelAfter}
                            isThumbnail={selectedService.beforeAfterImage.isThumbnail}
                          />
                        ) : (
                          <div className="relative aspect-video w-full bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                            {/* If local play is triggered, load player */}
                            {isPlayingLocal && selectedService.portfolio[activeMediaIndex]?.videoUrl ? (
                              <video 
                                src={selectedService.portfolio[activeMediaIndex].videoUrl} 
                                className="w-full h-full object-cover"
                                controls 
                                autoPlay 
                                playsInline 
                              />
                            ) : (
                              // Beautiful placeholder
                              <div className="absolute inset-0 flex flex-col justify-between p-6 bg-cover bg-center" style={{ backgroundImage: `url(${selectedService.portfolio[activeMediaIndex]?.thumbnailUrl})` }}>
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all" />
                                
                                {selectedService.portfolio[activeMediaIndex]?.ctr && (
                                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-black rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-600 shadow-md">
                                    <Zap className="w-3 h-3 fill-black text-black" />
                                    {selectedService.portfolio[activeMediaIndex].ctr} verified
                                  </span>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center">
                                  <button 
                                    onClick={() => setIsPlayingLocal(true)}
                                    className="p-5 rounded-full bg-amber-500 hover:bg-amber-400 hover:scale-105 border-2 border-black/40 text-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                                  >
                                    <Play className="w-6 h-6 fill-black" />
                                  </button>
                                </div>

                                <div className="absolute bottom-4 left-4 z-10 pr-10">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                                    {selectedService.portfolio[activeMediaIndex]?.subtitle}
                                  </span>
                                  <h5 className="text-base font-extrabold text-white leading-tight font-display">
                                    {selectedService.portfolio[activeMediaIndex]?.title}
                                  </h5>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Video Switcher items */}
                      {selectedService.portfolio.length > 1 && (
                        <div className="space-y-3">
                          <span className="block text-[11px] font-mono uppercase tracking-widest text-gray-500">
                            Available Cuts/Samples:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selectedService.portfolio.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveMediaIndex(idx);
                                  setIsPlayingLocal(false);
                                }}
                                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between bg-white/[0.02] cursor-pointer transition-all ${
                                  activeMediaIndex === idx 
                                    ? "border-amber-400/40 bg-amber-500/[0.03]" 
                                    : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                }`}
                              >
                                <span className="block text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                                  {idx + 1}. Demo Cut
                                </span>
                                <span className="block text-[10px] text-white font-bold truncate mt-1">
                                  {item.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hardware / Software Used */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5 font-mono">
                        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                          <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">SOFTWARE RUNTIME</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedService.software.map((sw, i) => (
                              <span key={i} className="text-[10px] px-2.5 py-1 rounded bg-[#222] text-[#B3B3B3] border border-white/5">
                                {sw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                          <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">TIMELINE SERVICE</span>
                          <div className="flex items-center gap-2 text-white">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold font-sans">{selectedService.deliveryTime} Delivery</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Detailed narrative & features */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Detailed narrative description */}
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold mb-1.5">SERVICE SUMMARY</h4>
                        <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight leading-none mb-3">
                          {selectedService.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed font-light">
                          {selectedService.detailedDescription}
                        </p>
                      </div>

                      <hr className="border-white/5" />

                      {/* Advanced features checklist */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">KEY CAPABILITIES Included:</h4>
                        <ul className="space-y-2">
                          {selectedService.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2 text-xs text-gray-300 font-mono">
                              <div className="p-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mt-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                              <span className="font-sans font-normal text-white/80">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <hr className="border-white/5" />

                      {/* Custom workflow steps */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">MY EDITING WORKFLOW:</h4>
                        <div className="space-y-3">
                          {selectedService.workflow.map((flow, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex gap-3 text-white/80">
                              <span className="text-amber-400 font-mono font-bold">0{idx + 1}</span>
                              <p className="font-sans tracking-wide leading-relaxed font-light text-gray-300">
                                {flow.split(':').slice(1).join(':') || flow}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom Sticky modal Hot CTA row */}
                <div className="p-5 px-6 border-t border-white/10 bg-black/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-gray-400">Ready to boost your metrics?</span>
                    <span className="block text-xs font-semibold text-white">Let's discuss raw files and custom packages</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
                    
                    {/* Direct Client-Side Contact Trigger */}
                    <button
                      onClick={() => triggerHireMe(selectedService.key)}
                      className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      Hire Me
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>

                    {/* Direct Social Links */}
                    <a
                      href={getWaUrl(selectedService.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 text-xs font-mono font-bold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`mailto:${ownerEmail}?subject=Inquiry%20regarding%20${encodeURIComponent(selectedService.title)}`}
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-xs font-mono font-bold"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>

                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
