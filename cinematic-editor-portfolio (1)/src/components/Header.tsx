import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, LogOut, Menu, X, Shield, Film } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  showAdminTriggers: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  activeSection: string;
}

export default function Header({ isAdmin, showAdminTriggers, onLoginClick, onLogout, activeSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "showcase", label: "Showcase" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-transparent backdrop-blur-md border-b border-white/10 h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); handleNavClick("hero"); }}
            className="flex items-center gap-3 group cursor-pointer"
            id="site-logo"
          >
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <Film className="w-5 h-5 text-black stroke-[2.5px]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                MK <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CINEMATICS</span>
              </span>
              <span className="block text-[10px] tracking-widest text-white/40 font-mono uppercase">
                Director & Editor
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm tracking-wide font-medium relative py-2 transition-colors duration-300 cursor-pointer ${
                  activeSection === item.id 
                    ? "text-cyan-400 font-semibold" 
                    : "text-white/60 hover:text-white"
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Action Button & Admin Indicator */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick("admin-dashboard")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium transition-colors hover:bg-cyan-500/20 cursor-pointer"
                  id="dashboard-indicator"
                  title="Go to Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  ADMIN PANEL
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 text-sm font-medium transition-all duration-300 cursor-pointer"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : showAdminTriggers ? (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 text-sm font-medium transition-all duration-300 cursor-pointer"
                id="login-trigger-btn"
              >
                <Lock className="w-4 h-4" />
                Admin portal
              </button>
            ) : null}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-3">
            {isAdmin && (
              <span className="p-1 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                ADMIN
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile nav sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 w-full glass-panel-heavy z-40 border-b border-white/10 shadow-2xl py-6 px-6 block md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left text-base font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ${
                    activeSection === item.id 
                      ? "text-cyan-400 bg-cyan-400/10 font-bold" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  id={`mobile-nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
              
              <hr className="border-white/5 my-2" />

              {isAdmin ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNavClick("admin-dashboard"); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-sm font-semibold hover:bg-cyan-500/20"
                    id="mobile-dashboard-btn"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel Dashboard
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20"
                    id="mobile-logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : showAdminTriggers ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white/5 text-gray-300 border border-white/10 text-sm font-semibold hover:bg-cyan-500/10 hover:text-cyan-400"
                  id="mobile-login-btn"
                >
                  <Lock className="w-4 h-4" />
                  Admin Login Portal
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
