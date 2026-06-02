import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Send, MessageCircle, Instagram, Mail, Sparkles, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { submitInquiryToFirestore, fetchGlobalSettingsFromFirestore } from "../lib/firestoreUtil";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "reels",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("918890534383");

  useEffect(() => {
    fetchGlobalSettingsFromFirestore()
      .then((data) => {
        if (data && data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
      })
      .catch((err) => console.log("Failed to load settings from Firestore:", err));
  }, []);

  useEffect(() => {
    const handleSetService = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setFormData((prev) => ({ ...prev, service: customEvent.detail }));
      }
    };
    window.addEventListener("set-selected-service", handleSetService);
    return () => window.removeEventListener("set-selected-service", handleSetService);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setStatusMsg("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      // 1. Durably save to cloud Firestore database securely and get stable ID info
      const { id, createdAt } = await submitInquiryToFirestore(formData);

      // 2. Safely trigger backend SMTP email notification relay in parallel background using stable ID
      try {
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id, createdAt }),
        });
      } catch (childErr) {
        // Child notification fails in the background, but DB save already succeeded
        console.warn("Background notification fail ignored:", childErr);
      }

      setStatus("success");
      setStatusMsg("Your inquiry was submitted successfully! I will review and reply within 24 hours.");
      setFormData({
        name: "",
        email: "",
        service: "reels",
        message: "",
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setStatusMsg("Failed to synchronize with database. Please try again or reach out on socials.");
    } finally {
      setLoading(false);
    }
  };

  // Preformatted WhatsApp message strings
  const cleanedPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent("Hi Monty 👋\n\nI just visited your portfolio and I'm interested in working with you.\n\nCould we discuss my video editing project?")}`;
  const instagramUrl = "https://www.instagram.com/mohitcreates786?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

  return (
    <section id="contact" className="py-24 bg-[#0b0b0b] px-6 border-t border-white/10 relative">
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Socials, WhatsApp Hot CTA banner, Core Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase mb-3">
                <Mail className="w-4 h-4" />
                GET IN TOUCH
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
                LET'S EDIT YOUR <br />
                NEXT MASTERS
              </h2>

              <p className="text-white/60 mt-6 text-sm sm:text-base leading-relaxed max-w-md font-light">
                Have raw files that need professional storytelling? Want to scale your average view durations? Submit the console inquiry form, or click any direct hotpath link below to talk immediately on socials!
              </p>

              {/* Direct Instant Action Buttons */}
              <div className="mt-10 space-y-4 max-w-sm">
                
                {/* WhatsApp Hotpath */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-cyan-500/[0.03] border border-white/10 hover:border-cyan-500/40 text-cyan-500 transition-all duration-300 group shadow-md"
                  id="hotpath-whatsapp"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-300">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold font-display text-white group-hover:text-cyan-400 transition-colors">Message on WhatsApp</span>
                      <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 group-hover:text-cyan-400/80 transition-colors">Response time: &lt; 30 mins</span>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-300" />
                </a>

                {/* Instagram Direct */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-cyan-500/[0.03] border border-white/10 hover:border-cyan-500/40 text-cyan-500 transition-all duration-300 group shadow-md"
                  id="hotpath-instagram"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-300">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold font-display text-white group-hover:text-cyan-400 transition-colors">Instagram DM</span>
                      <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 group-hover:text-cyan-400/80 transition-colors">Follow @mohitcreates786</span>
                    </div>
                  </div>
                  <Send className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-300" />
                </a>

              </div>
            </div>

            {/* Quote of custom editing model */}
            <div className="mt-12 lg:mt-0 p-6 rounded-xl bg-white/[0.02] border border-white/10 border-l-2 border-l-cyan-400 max-w-sm">
              <p className="text-white/60 text-xs italic leading-relaxed font-light">
                "Pacing is the heart. Grading is the skin. Foley design is the breath. Bring your files, we provide the soul."
              </p>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mt-2">
                — CinematicCuts Creed
              </span>
            </div>
          </div>

          {/* Right Column: Console Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-2xl glass-panel relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-bold font-display text-white mb-6">
                CONSOLE CONSULTATION INQUIRY
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6" id="consultation-form">
                
                {/* Name & Email Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-medium text-left">
                      Your Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Liam Ross"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:bg-white/10"
                      id="form-input-name"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-medium text-left">
                      Email Address <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. liam@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:bg-white/10"
                      id="form-input-email"
                    />
                  </div>
                </div>

                {/* Service Dropdown Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-medium text-left">
                    Requested Editing Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 focus:border-cyan-400/50 text-white text-sm outline-none transition-all duration-300"
                    id="form-input-service"
                  >
                    <option value="reels">Reel & Short Editing (Vertical Content)</option>
                    <option value="youtube">YouTube Video Editing (Documentaries/Vlogs)</option>
                    <option value="gaming">Esports & Gaming Montage</option>
                    <option value="cinematic">Cinematic Brand & Commercial Promo</option>
                    <option value="color-grading">Advanced Color Grading (Log Footage)</option>
                    <option value="thumbnail">YouTube Thumbnail & Banner Design</option>
                    <option value="other">General Consulting / Custom Package</option>
                  </select>
                </div>

                {/* Message Context area */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-medium text-left">
                    Message / Project Details <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your footage, average duration, target platform, reference edits or timelines..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:bg-white/10 resize-none text-left"
                    id="form-input-message"
                  />
                </div>

                {/* Status Banners inside box */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5"
                    id="form-status-success"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    <span>{statusMsg}</span>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5"
                    id="form-status-error"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <span>{statusMsg}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase cursor-pointer"
                  id="form-submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Transmitting logs...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 fill-black text-black z-10" />
                      <span>Transmit Consultation Request</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
