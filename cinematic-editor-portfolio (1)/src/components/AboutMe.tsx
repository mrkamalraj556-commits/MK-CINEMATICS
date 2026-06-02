import React from "react";
import { motion } from "motion/react";
import { Film, Star, Award, Compass, Zap, HelpCircle } from "lucide-react";

export default function AboutMe() {
  const SKILLS = [
    { name: "Adobe Premiere Pro (Primary NLE & Assembly)", level: 96 },
    { name: "Adobe After Effects (Kinetic typography & VFX)", level: 88 },
    { name: "DaVinci Resolve (Color Grading & Node Correction)", level: 92 },
    { name: "Sound Design & Foley (Audition & SFX Sync)", level: 85 },
  ];

  return (
    <section id="about" className="py-24 bg-[#0b0b0b] px-6 border-t border-white/10 relative overflow-hidden">
      {/* Dynamic light sources */}
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Centered layout for Biography details and Progress Levels */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center flex flex-col items-center">
            
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase mb-4">
              <Compass className="w-4 h-4 animate-spin-slow" />
              THE STORY BEHIND THE EDITOR
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              SCULPTING STORIES SEAM-BY-SEAM
            </h2>

            <p className="text-white/80 mt-6 text-base sm:text-lg leading-relaxed font-light font-display">
              At MK Cinematics, every frame is designed with purpose. I combine storytelling, motion, sound, and visual aesthetics to create content that not only looks stunning but also delivers results. Whether you're a creator, influencer, or brand, I help bring your vision to life through premium editing.
            </p>
            
            <p className="text-white/40 mt-4 text-sm leading-relaxed font-light">
              For me, editing is not simply clicking together clips. It is dynamic pacing, auditory feedback, color mood lookup profiles, and typographical hooks. It's about designing an experience that triggers dopamine and keeps viewers attached until the final frame.
            </p>
          </div>

          <div className="mt-8 p-3 w-fit mx-auto bg-white/5 rounded-lg border border-white/10 text-white font-mono text-xs">
            2+ YRS EXP
          </div>

          {/* Editing tool skillset progressions */}
          <div className="mt-12 space-y-5 bg-white/[0.01] p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-emerald-500/20 backdrop-blur-sm transition-colors duration-300">
            <h3 className="text-sm font-mono uppercase tracking-wider text-emerald-400 font-bold text-center mb-2">
              INDUSTRY SPEC TOKENS
            </h3>
            {SKILLS.map((skill, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300 font-light">{skill.name}</span>
                  <span className="text-emerald-400 font-semibold">{skill.level}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
