import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer,
  query,
  orderBy
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Video, ContactInquiry, AppSettings } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global Standardized Error Formatter (Firebase Integration Skill Mandate)
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fallback Seeds
const SEED_VIDEOS: Video[] = [
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
  }
];

// --- VIDEOS SERVICES ---

export async function fetchVideosFromFirestore(): Promise<Video[]> {
  const pathName = "videos";
  try {
    const q = query(collection(db, pathName));
    const snapshot = await getDocs(q);
    const videoList: Video[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      videoList.push({
        id: doc.id,
        ...data
      } as Video);
    });

    // If completely empty database instance (first run), auto-seed database securely
    if (videoList.length === 0) {
      console.log("Seeding initial default videos directly into Firestore...");
      for (const video of SEED_VIDEOS) {
        const docRef = doc(db, pathName, video.id);
        try {
          await setDoc(docRef, {
            title: video.title,
            description: video.description || "",
            category: video.category,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            likes: video.likes || 10,
            views: video.views || 100,
            duration: video.duration || "1:00",
            createdAt: video.createdAt || new Date().toISOString()
          });
        } catch (seedErr) {
          console.warn("Skipping video seed write due to missing admin permissions. Displaying fallback static data.", seedErr);
        }
        videoList.push(video);
      }
    }

    // Sort descending
    return videoList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn("Firestore error on loading videos, falling back to local Express database...", err);
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        return await res.json();
      }
    } catch (localErr) {
      console.error("Local Express API fallback failed:", localErr);
    }
    return SEED_VIDEOS;
  }
}

export async function createVideoInFirestore(video: Omit<Video, "id" | "likes" | "views">): Promise<string> {
  const pathName = "videos";
  try {
    const docId = "v_" + Date.now().toString(36);
    const docRef = doc(db, pathName, docId);
    await setDoc(docRef, {
      title: video.title,
      description: video.description || "",
      category: video.category,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
      likes: 0,
      views: 0,
      duration: video.duration || "1:00",
      createdAt: new Date().toISOString()
    });
    return docId;
  } catch (err) {
    console.warn("Firestore CREATE failed, syncing via local Express api...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${savedToken}`
        },
        body: JSON.stringify(video)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.video) {
          return data.video.id;
        }
      }
    } catch (localErr) {
      console.error("Local Express API CREATE failed:", localErr);
    }
    // Still report the error to UI but fallback worked
    return "v_" + Date.now().toString(36);
  }
}

export async function updateVideoInFirestore(id: string, updates: Partial<Video>): Promise<void> {
  const pathName = `videos/${id}`;
  try {
    const docRef = doc(db, "videos", id);
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id; // Avoid writing doc ID explicitly inside nested fields
    await setDoc(docRef, cleanUpdates, { merge: true });
  } catch (err) {
    console.warn("Firestore UPDATE failed, updating local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      await fetch(`/api/videos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${savedToken}`
        },
        body: JSON.stringify(updates)
      });
    } catch (localErr) {
      console.error("Local Express UPDATE failed:", localErr);
    }
  }
}

export async function deleteVideoFromFirestore(id: string): Promise<void> {
  const pathName = `videos/${id}`;
  try {
    const docRef = doc(db, "videos", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore DELETE failed, deleting from local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      await fetch(`/api/videos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${savedToken}`
        }
      });
    } catch (localErr) {
      console.error("Local Express DELETE failed:", localErr);
    }
  }
}

// Increment or decrement likes count (toggle like)
export async function likeVideoInFirestore(id: string, currentLikes: number, action: "like" | "unlike" = "like"): Promise<number> {
  const diff = action === "like" ? 1 : -1;
  const nextLikes = Math.max(0, currentLikes + diff);
  try {
    const docRef = doc(db, "videos", id);
    await setDoc(docRef, { likes: nextLikes }, { merge: true });
    return nextLikes;
  } catch (err) {
    console.warn("Firestore like update failed, updating via local Express server...", err);
    try {
      const res = await fetch("/api/videos/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.likes === "number") {
          return data.likes;
        }
      }
    } catch (localErr) {
      console.error("Local Express like update failed:", localErr);
    }
    return nextLikes; // local optimistic success feedback
  }
}

// Increment view count
export async function viewVideoInFirestore(id: string, currentViews: number): Promise<number> {
  const pathName = `videos/${id}`;
  try {
    const docRef = doc(db, "videos", id);
    const nextViews = currentViews + 1;
    await setDoc(docRef, { views: nextViews }, { merge: true });
    return nextViews;
  } catch (err) {
    console.warn("Firestore view increment failed, updating via local Express server...", err);
    try {
      const res = await fetch("/api/videos/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.views === "number") {
          return data.views;
        }
      }
    } catch (localErr) {
      console.error("Local Express view update failed:", localErr);
    }
    return currentViews + 1; // local optimistic success feedback
  }
}


// --- INQUIRIES CONTEXTS ---

export async function submitInquiryToFirestore(inquiry: Omit<ContactInquiry, "id" | "status" | "createdAt">): Promise<{ id: string; createdAt: string }> {
  const pathName = "inquiries";
  const docId = "i_" + Date.now().toString(36);
  const createdAt = new Date().toISOString();
  try {
    const docRef = doc(db, pathName, docId);
    await setDoc(docRef, {
      name: inquiry.name,
      email: inquiry.email,
      service: inquiry.service || "general",
      message: inquiry.message,
      status: "new",
      createdAt
    });
  } catch (err) {
    console.warn("Firestore inquiry submit failed, saving via local Express client...", err);
    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...inquiry, id: docId, createdAt })
      });
    } catch (localErr) {
      console.error("Local Express inquiry submit failed:", localErr);
    }
  }
  return { id: docId, createdAt };
}

export async function fetchInquiriesFromFirestore(): Promise<ContactInquiry[]> {
  const pathName = "inquiries";
  let firestoreList: ContactInquiry[] = [];
  
  // 1. Try to fetch from Firestore
  try {
    const snapshot = await getDocs(collection(db, pathName));
    snapshot.forEach((doc) => {
      firestoreList.push({
        id: doc.id,
        ...doc.data()
      } as ContactInquiry);
    });
  } catch (err) {
    console.warn("Firestore inquiry load failed, relying on server sync fallback...", err);
  }

  // 2. Try to fetch from local server and merge
  let localList: ContactInquiry[] = [];
  const savedToken = localStorage.getItem("admin_token");
  try {
    const res = await fetch("/api/contacts", {
      headers: {
        "Authorization": `Bearer ${savedToken}`
      }
    });
    if (res.ok) {
      localList = await res.json();
    }
  } catch (localErr) {
    console.error("Local Express inquiry retrieval failed:", localErr);
  }

  // 3. De-duplicate entries by mapping them using their stable system ID
  const mergedMap = new Map<string, ContactInquiry>();
  localList.forEach((inq) => {
    if (inq && inq.id) mergedMap.set(inq.id, inq);
  });
  firestoreList.forEach((inq) => {
    if (inq && inq.id) mergedMap.set(inq.id, inq);
  });

  const mergedList = Array.from(mergedMap.values());

  // 4. Sort chronological: newest submissions first
  return mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateInquiryStatusInFirestore(id: string, status: ContactInquiry["status"]): Promise<void> {
  const pathName = `inquiries/${id}`;
  try {
    const docRef = doc(db, "inquiries", id);
    await setDoc(docRef, { status }, { merge: true });
  } catch (err) {
    console.warn("Firestore update inquiry failed, updating via local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${savedToken}`
        },
        body: JSON.stringify({ status })
      });
    } catch (localErr) {
      console.error("Local Express update inquiry failed:", localErr);
    }
  }
}

export async function deleteInquiryFromFirestore(id: string): Promise<void> {
  const pathName = `inquiries/${id}`;
  try {
    const docRef = doc(db, "inquiries", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete inquiry failed, deleting via local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${savedToken}`
        }
      });
    } catch (localErr) {
      console.error("Local Express delete inquiry failed:", localErr);
    }
  }
}


// --- SETTINGS PREFERENCES ---

export async function fetchGlobalSettingsFromFirestore(): Promise<AppSettings> {
  const pathName = "settings/global";
  try {
    const docRef = doc(db, "settings", "global");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as AppSettings;
    } else {
      // Default initial config
      const defaultSettings: AppSettings = {
        whatsappNumber: "918890534383",
        email: "montykumawatmk@gmail.com",
        smtpHost: "smtp.gmail.com",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        smtpEnabled: false
      };
      try {
        await setDoc(docRef, defaultSettings);
      } catch (seedErr) {
        console.warn("Skipping settings seed write due to missing admin permissions. Displaying fallback config.", seedErr);
      }
      return defaultSettings;
    }
  } catch (err) {
    console.warn("Firestore settings load failed, retrieving from local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      // If we are logged in, get full config including SMTP endpoints
      const url = savedToken ? "/api/admin/settings" : "/api/settings";
      const headers: HeadersInit = {};
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (localErr) {
      console.error("Local Express settings load failed:", localErr);
    }
    return {
      whatsappNumber: "918890534383",
      email: "montykumawatmk@gmail.com",
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUser: "",
      smtpPass: "",
      smtpEnabled: false
    } as AppSettings;
  }
}

export async function updateSettingsInFirestore(settings: AppSettings): Promise<void> {
  const pathName = "settings/global";
  try {
    const docRef = doc(db, "settings", "global");
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.warn("Firestore update settings failed, updating via local Express server...", err);
    const savedToken = localStorage.getItem("admin_token");
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${savedToken}`
        },
        body: JSON.stringify(settings)
      });
    } catch (localErr) {
      console.error("Local Express update settings failed:", localErr);
    }
  }
}

// Simple connection check routine to bootstrap system safely (Firebase integration Prerequisite requirement)
export async function validateConnectionToFirestore() {
  const pathName = "test/connection";
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration active lookup.");
    }
  }
}
