import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, X, Eye, EyeOff, ShieldAlert, Sparkles, KeyRound, Mail, LogIn, UserPlus } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
  standalone?: boolean;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess, standalone = false }: AdminLoginModalProps) {
  const [email, setEmail] = useState("montykumawatmk@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Secure Multi-Stage 2FA OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSentEmail, setOtpSentEmail] = useState("");
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState("");

  if (!isOpen && !standalone) return null;

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userEmail = user.email?.trim().toLowerCase();
      
      if (userEmail === "montykumawatmk@gmail.com") {
        const token = await user.getIdToken();
        setSuccessMsg("Welcome Back, Owner! Sign-In Successful.");
        setTimeout(() => {
          onLoginSuccess(token);
          if (!standalone) onClose();
        }, 1000);
      } else {
        await auth.signOut();
        setErrorMsg(`Access Denied: Only authorized owners are permitted. Logged in as ${user.email}`);
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      let translateMsg = "Google authentication failed inside sandbox iframe. Please open the App in a New Tab to complete setup!";
      if (err.code === "auth/popup-blocked") {
        translateMsg = "Login popup blocked by your browser! Please enable popups, or open the App in a New Tab.";
      } else if (err.code === "auth/popup-closed-by-user") {
        translateMsg = "Authentication popup was closed before completion. Please retry.";
      } else if (err.message) {
        translateMsg = `${err.message} (Try opening the app in a New Tab)`;
      }
      setErrorMsg(translateMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isOwnerEmail = cleanEmail === "montykumawatmk@gmail.com";
    if (!isOwnerEmail) {
      setErrorMsg("Access Denied: Only montykumawatmk@gmail.com is authorized to access the Admin Panel.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isRegisterMode) {
        // Register the one-and-only allowed admin account in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const token = await userCredential.user.getIdToken();
        setSuccessMsg("Admin account registered successfully! Access granted.");
        setTimeout(() => {
          onLoginSuccess(token);
          if (!standalone) onClose();
        }, 1000);
      } else {
        // Prioritize local server API login for flawless 2FA / OTP verification operation!
        try {
          if (!otpStep) {
            // STEP 1: Verify password and request/send security OTP
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              if (data.otpRequired) {
                setOtpStep(true);
                setOtpSentEmail(data.targetEmail || email);
                setIsRealEmailSent(!!data.emailSent);
                setDevOtpCode(data.devOtp || "");
                setSuccessMsg(`Security OTP code generated! Sent securely to ${data.targetEmail || email}.`);
                setSubmitting(false);
              } else {
                setSuccessMsg("Welcome Back, Owner! Secure console unlocked.");
                setTimeout(() => {
                  onLoginSuccess(data.token);
                  if (!standalone) onClose();
                }, 600);
              }
              return;
            } else {
              setErrorMsg(data.error || "Incorrect admin password. Please try again.");
              setSubmitting(false);
              return;
            }
          } else {
            // STEP 2: Verify the security OTP code
            const res = await fetch("/api/admin/login-verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ password, otp: otpCode })
            });
            const data = await res.json();
            if (res.ok && data.success && data.token) {
              setSuccessMsg("OTP Verified! Connecting to Secure Console...");
              setTimeout(() => {
                onLoginSuccess(data.token);
                if (!standalone) onClose();
              }, 600);
              return;
            } else {
              setErrorMsg(data.error || "Invalid OTP code. Please check your inbox or server terminal and try again.");
              setSubmitting(false);
              return;
            }
          }
        } catch (localErr) {
          console.warn("Local authenticating server unreachable, falling back to basic direct credentials...", localErr);
        }

        // Standard direct fallback check if server isn't answering
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const token = await userCredential.user.getIdToken();
        onLoginSuccess(token);
        if (!standalone) onClose();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let translateMsg = "Authentication failed.";
      
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        translateMsg = "Incorrect admin credentials. Please verification your keys.";
      } else if (err.code === "auth/user-not-found") {
        translateMsg = `Admin authentication user not found. Toggle First-Time Setup below to register ${email} in Firebase Auth.`;
      } else if (err.code === "auth/email-already-in-use") {
        translateMsg = "This admin email is already registered. Please login instead.";
      } else if (err.code === "auth/weak-password") {
        translateMsg = "Password is too weak. Must contain at least 6 characters.";
      } else {
        translateMsg = err.message || translateMsg;
      }
      
      setErrorMsg(translateMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const cardContent = (
    <motion.div
      initial={standalone ? { scale: 1, opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.25 }}
      className={`relative w-full max-w-md ${
        standalone ? "bg-[#151515] hover:border-[#D4AF37]/30" : "glass-panel-heavy"
      } p-8 rounded-2xl border border-white/5 shadow-2xl z-10 transition-all duration-300`}
      id="admin-login-dialog"
    >
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20 glow-amber animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
              Secure 2FA Protection
            </span>
            <h3 className="text-lg font-bold font-display text-white">
              {isRegisterMode ? "Register Owner Portal" : otpStep ? "Security Verification" : "Admin Security Portal"}
            </h3>
          </div>
        </div>
        {!standalone && (
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-all"
            id="close-login-btn"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        
        {/* Google Sign-In (Hide during OTP mode for visual focus) */}
        {!otpStep && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-4.5 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)] border border-white/25 active:scale-[0.98]"
              id="google-signin-btn"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35 11.1H12v2.7h5.38C16.88 15.22 14.77 16.5 12 16.5c-3.03 0-5.6-2.05-6.52-4.82C5.3 11.12 5.2 10.57 5.2 10s.1-1.12.28-1.68c.92-2.77 3.49-4.82 6.52-4.82 1.64 0 3.13.57 4.3 1.68l2.02-2.02C16.3 1.5 14.3.5 12 .5 7.36.5 3.31 3.46 1.75 7.68c-.53 1.45-.83 3-.83 4.62s.3 3.17.83 4.62c1.56 4.22 5.61 7.18 10.25 7.18 4.64 0 8.44-3.12 9.67-7.42.21-.7.33-1.44.33-2.76 0-.61-.32-1.66-.65-2.74z" fill="#ea4335" />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="flex items-center py-2">
              <div className="flex-1 border-t border-white/5"></div>
              <span className="px-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">or use email login</span>
              <div className="flex-1 border-t border-white/5"></div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field - Hidden during OTP mode or editable during register mode */}
        {!otpStep && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B3B3B3]">
              Owner Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                readOnly={!isRegisterMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs outline-none ${
                  isRegisterMode ? "text-white focus:border-[#D4AF37]/50" : "text-gray-500"
                }`}
                id="login-email-field"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <span className="block text-[10px] font-mono text-gray-500 italic">
              Configured owner constraint. Access locked to this email authority.
            </span>
          </div>
        )}

        {/* Portal Password - Hidden during OTP mode */}
        {!otpStep && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B3B3B3]">
              Portal Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#D4AF37]/50 text-white placeholder-gray-600 text-xs outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                id="login-password-field"
                autoFocus
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* OTP Input Step Form - Dynamic 2FA UI */}
        {otpStep && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease] border border-[#D4AF37]/10 p-4.5 rounded-xl bg-amber-500/[0.02]">
            <div className="text-center space-y-2 mb-2">
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                A 6-digit confirmation code has been generated and sent to:
              </p>
              <div className="inline-block px-3 py-1 bg-white/5 rounded text-xs font-mono text-[#D4AF37] border border-white/5">
                {otpSentEmail}
              </div>
              <p className="text-[10.5px] text-gray-500 italic">
                {isRealEmailSent 
                  ? "Real email delivered! Check your inbox (or spam folder)." 
                  : "SMTP settings are not configured. We've printed your code below for verification!"}
              </p>
            </div>

            {devOtpCode && (
              <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-center shadow-[0_4px_12px_rgba(212,175,55,0.05)] animate-pulse">
                <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-none">Security Bypass Demo Code</span>
                <span className="block text-2xl font-bold font-mono tracking-[4px] text-[#D4AF37] mt-1.5">{devOtpCode}</span>
                <p className="text-[9px] text-gray-400 mt-1.5 leading-normal max-w-[280px] mx-auto">
                  Log in with this code. You can configure real SMTP SMTP settings inside the Admin Panel under the Settings Tab!
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">
                One-Time Password (OTP) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] border border-[#D4AF37]/30 focus:border-[#D4AF37] text-white text-center font-mono text-lg tracking-[8px] placeholder-gray-600 outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                  id="login-otp-field"
                  autoFocus
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono mt-1 text-gray-500">
                <span>Code expires in 10 mins</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtpCode("");
                    setErrorMsg("");
                    setSuccessMsg("Enter your password to send a fresh OTP.");
                  }}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer underline"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-normal flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#f4e098] text-xs leading-normal flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#b89228] text-black font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] border border-[#e5c758]/20"
          id="login-submit-btn"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Checking Security Credentials...</span>
            </>
          ) : isRegisterMode ? (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register Admin Credentials</span>
            </>
          ) : otpStep ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>Verify & Unlock Console</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Request Login OTP Code</span>
            </>
          )}
        </button>

        {/* Switch mode - Hide when completing OTP 2FA for visual safety */}
        {!otpStep && (
          <div className="pt-2 text-center border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-xs text-gray-500 hover:text-[#D4AF37] transition-all"
            >
              {isRegisterMode ? (
                <span>Already configured? Switch to traditional Sign-In</span>
              ) : (
                <span>First time running this App? Launch First-Time Setup</span>
              )}
            </button>
          </div>
        )}

      </form>
    </div>
  </motion.div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 relative overflow-hidden" id="standalone-login-route">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-amber-600/5 rounded-full blur-[80px] pointer-events-none" />
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />
      {cardContent}
    </div>
  );
}
