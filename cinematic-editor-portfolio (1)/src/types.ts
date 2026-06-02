export interface Video {
  id: string;
  title: string;
  description: string;
  category: 'reels' | 'youtube' | 'gaming' | 'cinematic' | 'color-grading' | 'thumbnail' | 'photo-editing';
  videoUrl: string; // can be YouTube, Vimeo, direct MP4 URL, or uploaded /uploads/... file
  thumbnailUrl: string; // fallback thumbnail image or uploaded image
  likes: number;
  views: number;
  duration?: string; // e.g. "0:58"
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon identifier
  features: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number; // 1-5
  text: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
  createdAt: string;
}

export interface DashboardStats {
  totalVideos: number;
  totalLikes: number;
  totalViews: number;
  totalInquiries: number;
}

export interface AppSettings {
  whatsappNumber: string;
  email: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpEnabled?: boolean;
}

