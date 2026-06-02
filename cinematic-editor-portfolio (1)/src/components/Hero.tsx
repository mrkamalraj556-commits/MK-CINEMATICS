import React from "react";
import { motion } from "motion/react";
import { Play, Sparkles, Send, Film } from "lucide-react";
import { Video } from "../types";

interface HeroProps {
  videos?: Video[];
}

export default function Hero({ videos = [] }: HeroProps) {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Actual projects count based strictly on the videos list
  const totalProjectsCombined = videos.length;

  // Actual views count calculated by summing the views of all videos inside the database
  const totalViewsCombined = videos.reduce((acc, v) => acc + (v.views || 0), 0);

  const formatViewsCount = (num: number) => {
    if (num >= 1000000) {
      const formatted = (num / 1000000).toFixed(2);
      return formatted.endsWith(".00") ? formatted.substring(0, formatted.length - 3) + "M" : formatted + "M";
    }
    if (num >= 1000) {
      const formatted = (num / 1000).toFixed(1);
      return formatted.endsWith(".0") ? formatted.substring(0, formatted.length - 2) + "K" : formatted + "K";
    }
    return num.toString();
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#0b0b0b] px-6"
    >
      {/* Cinematic Background + Dark Linear Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/95 to-[#0b0b0b]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-[#0b0b0b]" />
      </div>

      {/* Decorative Light Rays / Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[30vw] h-[30vw] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Overlay Line Decorations for Tech/Studio Atmosphere */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[11px] font-mono font-semibold tracking-wider uppercase mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          AVAILABLE FOR FREELANCE & CONTRACTS
        </motion.div>

        {/* Cinematic Main Display Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white font-display leading-[0.95] mb-8 uppercase"
        >
          CINEMATIC <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">VIDEO EDITOR</span>
        </motion.h1>

        {/* Dynamic Tagline Describing core products */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed mb-12 font-light"
        >
          At MK Cinematics, every frame is designed with purpose. Combining storytelling, motion, sound, and visual aesthetics to craft content that looks stunning and delivers results.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Main Showcase Showcase Button as a premium white-to-cyan capsule */}
          <button
            onClick={() => handleScroll("showcase")}
            className="group flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-cyan-400 cursor-pointer w-full sm:w-60 shadow-lg"
            id="hero-primary-cta"
          >
            <Play className="w-4 h-4 fill-black" />
            Watch Showreel
          </button>

          {/* Secondary Contact CTA button */}
          <button
            onClick={() => handleScroll("contact")}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer w-full sm:w-60"
            id="hero-secondary-cta"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Let's Collaborate
          </button>
        </motion.div>

        {/* Stats bento row for additional premium layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-3 gap-6 md:gap-12 mt-16 pt-10 border-t border-white/10 w-full max-w-2xl text-center font-mono"
        >
          <div>
            <span className="block text-xl md:text-3xl font-bold text-white font-display">{totalProjectsCombined}</span>
            <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">PROJECTS CUT</span>
          </div>
          <div>
            <span className="block text-xl md:text-3xl font-bold text-white font-display">{formatViewsCount(totalViewsCombined)}</span>
            <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">VIEWS SECURED</span>
          </div>
          <div>
            <span className="block text-xl md:text-3xl font-bold text-white font-display">100%</span>
            <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">CLIENT SATISFACTION</span>
          </div>
        </motion.div>

      </div>



    </section>
  );
}
