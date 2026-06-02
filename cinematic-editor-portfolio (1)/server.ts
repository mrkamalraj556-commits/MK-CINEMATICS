import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Set up directory paths
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial/default database structure
const DEFAULT_VIDEOS = [
  {
    id: "v1",
    title: "Urban Street Neon - Kinetic Reel",
    description: "Highlight reel showcasing seamless kinetic transitions, audio beat sync, speed ramps, and stylized cyberpunk color grading styled for an urban streetwear brand.",
    category: "reels",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-dancing-woman-in-the-city-at-night-42283-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
    likes: 247,
    views: 1840,
    duration: "0:30",
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: "v2",
    title: "The Art of Coffee Crafting",
    description: "Mini-documentary focusing on Foley sound design (ASMR), close-up macro cinematography, and warm, moody lofi color spaces for an artisanal roastery.",
    category: "youtube",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-machine-dripping-fresh-beverage-42224-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
    likes: 412,
    views: 3200,
    duration: "2:45",
    createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString()
  },
  {
    id: "v3",
    title: "Cyberpunk Action Sequence Montage",
    description: "High-tempo gaming montage highlighting perfect beat synchronization, vibrant screen shakes, and custom speed curves paired with twitch tracking zooms.",
    category: "gaming",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-on-a-glowing-neon-gaming-keyboard-51167-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    likes: 189,
    views: 1110,
    duration: "1:15",
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
  },
  {
    id: "v4",
    title: "Alpine Adrenaline - Travel Promo",
    description: "Brand campaign featuring epic heavy slow-motion landscape clips, sound stage echoes, and dynamic speed gradients capturing extreme winter sports.",
    category: "cinematic",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-slopes-under-a-clear-blue-sky-41481-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    likes: 532,
    views: 4560,
    duration: "1:45",
    createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString()
  },
  {
    id: "v5",
    title: "Moody Cinematic Forest Breakdown",
    description: "Color grading masterclass showing raw Log sensor footage converting into lush cinematic forest tones, split-toned shadow curves, and selective masks.",
    category: "color-grading",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-filtering-through-active-pine-trees-42514-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop",
    likes: 318,
    views: 2010,
    duration: "1:02",
    createdAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString()
  },
  {
    id: "v6",
    title: "Custom High-CTR Comic Thumbnails",
    description: "An animated showcase of strategic YouTube thumbnails. Incorporating 3D visual cuts, glowing edges, high-contrast readable typefaces, and eye-tracking layouts.",
    category: "thumbnail",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-top-shot-of-a-person-sketching-comics-41589-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop",
    likes: 167,
    views: 1245,
    duration: "0:45",
    createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
  },
  {
    id: "v7",
    title: "Premium Cinematic Portrait Edit (& MK Custom Backdrop)",
    description: "Sleek professional color correction, raw skin tone optimization, selective masking, and custom red-gradient backdrop composition. Handled with pristine detail without distracting watermarks or overlay symbols.",
    category: "photo-editing",
    videoUrl: "",
    thumbnailUrl: "/src/assets/images/full_sitting_mk_1780128294916.png",
    likes: 425,
    views: 2580,
    duration: "Edited Image",
    createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
  }
];

const DEFAULT_TESTIMONIALS = [
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

const DEFAULT_INQUIRIES = [
  {
    id: "i1",
    name: "John Doe",
    email: "john@example.com",
    service: "reels",
    message: "Hi, I have a batch of raw shorts from a recent podcast show and need them cut down with energetic typography. Please get in touch!",
    status: "new",
    createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
  }
];

// Load or initialize DB
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data);
      // Ensure settings exist and merge them
      if (!db.settings) {
        db.settings = {
          whatsappNumber: "918890534383",
          email: "montykumawatmk@gmail.com",
          smtpHost: "smtp.gmail.com",
          smtpPort: "587",
          smtpUser: "",
          smtpPass: "",
          smtpEnabled: false
        };
        saveDatabase(db);
      }
      return db;
    }
  } catch (error) {
    console.error("Database read failed, falling back to defaults", error);
  }

  const initialDB = {
    videos: DEFAULT_VIDEOS,
    testimonials: DEFAULT_TESTIMONIALS,
    inquiries: DEFAULT_INQUIRIES,
    settings: {
      whatsappNumber: "918890534383",
      email: "montykumawatmk@gmail.com",
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUser: "",
      smtpPass: "",
      smtpEnabled: false
    }
  };
  saveDatabase(initialDB);
  return initialDB;
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Database save failed", error);
  }
}

// Ensure database file is ready on start
readDatabase();

// Middleware
app.use(express.json());

// Serve static uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// Google Search Console Site Verification route (dynamic fallback)
app.get("/google:id.html", (req, res) => {
  const { id } = req.params;
  res.type("html").send(`google-site-verification: google${id}.html`);
});

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
  fileFilter: (req, file, cb) => {
    // Check types
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Error: Only standard images or video formats are allowed!"));
    }
  }
});

// Admin Session State (In-Memory for simplicity)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "monti152004kamal";
let activeTokens = new Set<string>();

// Dynamic OTP State for 2FA Admin Login
let activeOtp: string | null = null;
let activeOtpExpiry: number = 0;

// Helper authentication check
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (activeTokens.has(token)) {
      return next();
    }
  }
  return res.status(401).json({ error: "Unauthorized access: Please authenticate as Admin" });
}

// API Routes

// 1. Admin Login (Step 1: Password Check + Send OTP)
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: "Password was not provided" });
  }
  
  const cleanPassword = password.trim();
  const lowerPassword = cleanPassword.toLowerCase();
  
  const isMatch = 
    cleanPassword === ADMIN_PASSWORD || 
    lowerPassword === "monti152004kamalraj" || 
    lowerPassword === "monti152004kamal" ||
    lowerPassword === ADMIN_PASSWORD.toLowerCase();

  if (isMatch) {
    // Generate a secure 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtp = generatedOtp;
    activeOtpExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

    // Read configured email or default to user email
    const db = readDatabase();
    const settings = db.settings || {};
    const destinationEmail = settings.email || "montykumawatmk@gmail.com";

    // Print OTP in console explicitly for robust development/iframe checks
    console.log("\n==============================================");
    console.log("🔒🔑 [ADMIN SECURITY 2FA LOGIN REQUEST]");
    console.log(`🎯 TARGET: ${destinationEmail}`);
    console.log(`🎟️ SECURITY OTP VERIFICATION CODE: ${generatedOtp}`);
    console.log(`⏱️ VALID FOR: 10 Minutes (Expires at: ${new Date(activeOtpExpiry).toLocaleTimeString()})`);
    console.log("==============================================\n");

    let emailSentStatus = false;
    let emailSendError = "";

    // Send Real SMTP email if enabled & configured
    if (settings.smtpEnabled && settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort),
          secure: settings.smtpPort === "465",
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass
          }
        });

        await transporter.sendMail({
          from: `"Admin Security Portal" <${settings.smtpUser}>`,
          to: destinationEmail,
          subject: `🔑 ${generatedOtp} is your Admin Login OTP`,
          text: `Your One-Time Password (OTP) for Admin Panel access is: ${generatedOtp}. It is valid for 10 minutes.`,
          html: `<div style="font-family: sans-serif; padding: 32px; background-color: #0b0b0b; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; max-width: 500px; margin: 0 auto; color: #ffffff; text-align: center;">
            <div style="margin-bottom: 24px;">
              <h1 style="color: #D4AF37; margin: 8px 0 0 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">Cinematic Cuts</h1>
              <p style="color: #888888; font-size: 10px; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Secure Admin Authorization</p>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 24px 0; margin: 20px 0;">
              <p style="color: #b3b3b3; font-size: 14px; margin-top: 0;">Use the following One-Time Password (OTP) to unlock your admin session:</p>
              <div style="background-color: rgba(212, 175, 55, 0.1); border: 1px dashed #D4AF37; border-radius: 8px; padding: 16px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4AF37; margin: 20px 0; display: inline-block; padding-left: 24px;">${generatedOtp}</div>
              <p style="color: #666666; font-size: 11px; margin-bottom: 0;">Valid for 10 minutes. If you did not request this, please change your credentials immediately.</p>
            </div>
            <p style="color: #888888; font-size: 11px; margin-top: 20px;">© 2026 Cinematic Cuts Portfolio. Secured with 2FA OTP.</p>
          </div>`
        });
        emailSentStatus = true;
      } catch (err: any) {
        console.error("Failed to send OTP email via SMTP:", err);
        emailSendError = err.message || "Failed to establish SMTP connection.";
      }
    }

    return res.json({ 
      success: true, 
      otpRequired: true, 
      emailSent: emailSentStatus,
      targetEmail: destinationEmail,
      devOtp: !emailSentStatus ? generatedOtp : undefined,
      error: emailSendError ? `SMTP delivery failed (${emailSendError}), but OTP is generated.` : undefined
    });
  } else {
    return res.status(401).json({ success: false, error: "Incorrect admin password" });
  }
});

// 1.5. Admin Login Verification (Step 2: Check OTP + Create Token)
app.post("/api/admin/login-verify", (req, res) => {
  const { password, otp } = req.body;
  if (!password || !otp) {
    return res.status(400).json({ success: false, error: "Password and OTP are both required." });
  }

  // Double check password safety lock
  const cleanPassword = password.trim();
  const lowerPassword = cleanPassword.toLowerCase();
  
  const isMatch = 
    cleanPassword === ADMIN_PASSWORD || 
    lowerPassword === "monti152004kamalraj" || 
    lowerPassword === "monti152004kamal" ||
    lowerPassword === ADMIN_PASSWORD.toLowerCase();

  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Incorrect admin password" });
  }

  // Validate OTP key details
  if (!activeOtp || Date.now() > activeOtpExpiry) {
    return res.status(401).json({ success: false, error: "OTP has expired or wasn't requested. Please submit your password again." });
  }

  if (otp.trim() === activeOtp) {
    // Authenticated! Clean OTP and create session
    const token = "token_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    activeTokens.add(token);
    
    // Clear dynamic session properties
    activeOtp = null;
    activeOtpExpiry = 0;

    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, error: "Invalid OTP verification code. Please check your email inbox (or server console) and try again." });
  }
});

// Admin Logout
app.post("/api/admin/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeTokens.delete(token);
  }
  res.json({ success: true });
});

// Verify login session
app.get("/api/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (activeTokens.has(token)) {
      return res.json({ valid: true });
    }
  }
  return res.json({ valid: false });
});

// 2. Fetch all videos
app.get("/api/videos", (req, res) => {
  const db = readDatabase();
  // Sort reverse chronological
  const sortedVideos = [...db.videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sortedVideos);
});

// Like or unlike a video (toggle)
app.post("/api/videos/like", (req, res) => {
  const { id, action } = req.body;
  const db = readDatabase();
  const video = db.videos.find((v: any) => v.id === id);
  if (video) {
    const diff = action === "unlike" ? -1 : 1;
    video.likes = Math.max(0, (video.likes || 0) + diff);
    saveDatabase(db);
    return res.json({ success: true, likes: video.likes });
  }
  return res.status(404).json({ error: "Video not found" });
});

// Lock video views increment
app.post("/api/videos/view", (req, res) => {
  const { id } = req.body;
  const db = readDatabase();
  const video = db.videos.find((v: any) => v.id === id);
  if (video) {
    video.views = (video.views || 0) + 1;
    saveDatabase(db);
    return res.json({ success: true, views: video.views });
  }
  return res.status(404).json({ error: "Video not found" });
});

// 3. Multi-file upload endpoints (Handles separate thumbnails and videos)
app.post(
  "/api/upload",
  authenticateAdmin,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: { videoPath?: string; thumbnailPath?: string } = {};

    if (files && files.video && files.video[0]) {
      result.videoPath = "/uploads/" + files.video[0].filename;
    }
    if (files && files.thumbnail && files.thumbnail[0]) {
      result.thumbnailPath = "/uploads/" + files.thumbnail[0].filename;
    }

    res.json({ success: true, paths: result });
  }
);

// 4. Create Video (Admin Protected)
app.post("/api/videos", authenticateAdmin, (req, res) => {
  const { title, description, category, videoUrl, thumbnailUrl, duration } = req.body;
  if (!title || !category || !videoUrl) {
    return res.status(400).json({ error: "Title, category, and Video Url are required fields." });
  }

  const db = readDatabase();
  const newVideo = {
    id: "v_" + Date.now().toString(36),
    title,
    description: description || "",
    category,
    videoUrl,
    thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop",
    likes: 0,
    views: 0,
    duration: duration || "1:00",
    createdAt: new Date().toISOString()
  };

  db.videos.push(newVideo);
  saveDatabase(db);

  res.json({ success: true, video: newVideo });
});

// Update Video (Admin Protected)
app.put("/api/videos/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, category, videoUrl, thumbnailUrl, duration } = req.body;

  const db = readDatabase();
  const index = db.videos.findIndex((v: any) => v.id === id);

  if (index !== -1) {
    db.videos[index] = {
      ...db.videos[index],
      title: title || db.videos[index].title,
      description: description !== undefined ? description : db.videos[index].description,
      category: category || db.videos[index].category,
      videoUrl: videoUrl || db.videos[index].videoUrl,
      thumbnailUrl: thumbnailUrl || db.videos[index].thumbnailUrl,
      duration: duration || db.videos[index].duration
    };
    saveDatabase(db);
    return res.json({ success: true, video: db.videos[index] });
  }

  res.status(404).json({ error: "Video code not found" });
});

// Delete Video (Admin Protected)
app.delete("/api/videos/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialLength = db.videos.length;
  db.videos = db.videos.filter((v: any) => v.id !== id);

  if (db.videos.length < initialLength) {
    saveDatabase(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Video not found" });
});

// 5. Submit contact Inquiry
app.post("/api/contacts", async (req, res) => {
  const { id, name, email, service, message, createdAt, status } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  const db = readDatabase();
  const inquiryId = id || ("i_" + Date.now().toString(36));
  
  // Prevent duplicate insertion if the inquiry with this ID already exists
  const existingIndex = db.inquiries.findIndex((inq: any) => inq.id === inquiryId);
  let newInquiry: any;
  
  if (existingIndex !== -1) {
    newInquiry = db.inquiries[existingIndex];
  } else {
    newInquiry = {
      id: inquiryId,
      name,
      email,
      service: service || "general",
      message,
      status: status || "new",
      createdAt: createdAt || new Date().toISOString()
    };
    db.inquiries.push(newInquiry);
    saveDatabase(db);
  }

  // Send Email Notification if SMTP enabled
  const settings = db.settings || {};
  if (settings.smtpEnabled && settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass && settings.email) {
    try {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort),
        secure: settings.smtpPort === "465",
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });

      await transporter.sendMail({
        from: `"Cinematic Inquiry" <${settings.smtpUser}>`,
        to: settings.email,
        subject: `New Portfolio Inquiry from ${name}`,
        text: `You have received a new consultation inquiry from ${name}.\n\nName: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}\n\nPlease check your admin console to manage this client response.`,
        html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c29541; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Consultation Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #475569;">Client Name:</td>
              <td style="padding: 8px 0; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Client Email:</td>
              <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #c29541; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Requested Service:</td>
              <td style="padding: 8px 0; color: #0f172a; text-transform: uppercase; font-size: 13px; font-weight: 600;">${service}</td>
            </tr>
          </table>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 16px;">
            <p style="margin: 0; font-weight: bold; color: #475569; font-size: 12px; margin-bottom: 8px; text-transform: uppercase;">Message / Project Details:</p>
            <p style="margin: 0; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; font-family: monospace;">Submitted via Cinematic Editing Console</p>
        </div>`
      });
      console.log(`Successfully sent email notification to ${settings.email}`);
    } catch (err) {
      console.error("Nodemailer failed in submit contact background process:", err);
    }
  }

  res.json({ success: true, inquiry: newInquiry });
});

// Settings API endpoints
app.get("/api/settings", (req, res) => {
  const db = readDatabase();
  const settings = db.settings || {};
  res.json({
    whatsappNumber: settings.whatsappNumber || "918890534383",
    email: settings.email || "montykumawatmk@gmail.com"
  });
});

app.get("/api/admin/settings", authenticateAdmin, (req, res) => {
  const db = readDatabase();
  res.json(db.settings || {});
});

app.put("/api/admin/settings", authenticateAdmin, (req, res) => {
  const db = readDatabase();
  db.settings = {
    ...(db.settings || {}),
    ...req.body
  };
  saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

app.post("/api/admin/settings/test-email", authenticateAdmin, async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass, email } = req.body;
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !email) {
    return res.status(400).json({ error: "All SMTP fields (host, port, user, pass) and receiver email are required to test." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"CinematicCuts Test" <${smtpUser}>`,
      to: email,
      subject: "SMTP Email Connection Test",
      text: "Congratulations! Your email notification settings are working perfectly.",
      html: `<div style="font-family: sans-serif; padding: 24px; text-align: center; max-width: 500px; margin: 0 auto; border: 1px solid #e5bc6a; border-radius: 12px; background: #181512; color: #ffffff;">
        <h2 style="color: #e5bc6a; margin-top: 0;">SMTP Test Success!</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">Your portfolio website email notifications are now verified and running perfectly.</p>
        <div style="font-family: monospace; font-size: 11px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px; margin: 15px 0; color: #f4ebd0;">
          Host: ${smtpHost}:${smtpPort}<br>
          Authorized User: ${smtpUser}
        </div>
        <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">Sent automatically from Cinematic Admin Control Panel.</p>
      </div>`
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Test email failed:", error);
    res.status(500).json({ error: error.message || "Failed to transmit test email. Please check your credentials and App Passwords." });
  }
});

// Retrieve contact Inquiries (Admin Protected)
app.get("/api/contacts", authenticateAdmin, (req, res) => {
  const db = readDatabase();
  // Sort newest first
  const sorted = [...db.inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

// Mark/Update inquiry status (Admin Protected)
app.put("/api/contacts/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = readDatabase();
  const index = db.inquiries.findIndex((i: any) => i.id === id);

  if (index !== -1) {
    db.inquiries[index].status = status || db.inquiries[index].status;
    saveDatabase(db);
    return res.json({ success: true, inquiry: db.inquiries[index] });
  }

  res.status(404).json({ error: "Inquiry not found" });
});

// Delete contact Inquiry (Admin Protected)
app.delete("/api/contacts/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i: any) => i.id !== id);

  if (db.inquiries.length < initialLength) {
    saveDatabase(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Inquiry not found" });
});

// 6. Get Dashboard Stats (Admin Protected)
app.get("/api/stats", authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const totalVideos = db.videos.length;
  let totalLikes = 0;
  let totalViews = 0;

  db.videos.forEach((v: any) => {
    totalLikes += (v.likes || 0);
    totalViews += (v.views || 0);
  });

  const totalInquiries = db.inquiries.length;

  res.json({
    totalVideos,
    totalLikes,
    totalViews,
    totalInquiries
  });
});


// 7. Vite Integration Setup or static build production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve production static assets
    app.use(express.static(distPath));
    
    // SPA Fallback routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    console.log(`Port ${PORT} is fully map-routed! Default admin password is: ${ADMIN_PASSWORD}`);
  });
}

// Error handling middleware for multer / file sizes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Uploaded file is too large! Maximum limit is 50MB." });
  }
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

startServer();
