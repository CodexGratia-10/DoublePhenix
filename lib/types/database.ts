// ═══════════════════════════════════════════
// PHENIX — Types de Base de Données (Supabase)
// Correspondance directe avec les tables Supabase
// ═══════════════════════════════════════════

/** Badge tier type */
export type BadgeTier = "gold" | "silver" | "bronze";

/** Badge affiché sur le profil */
export interface ProfileBadge {
  label: string;
  tier: BadgeTier;
}

/** Profil utilisateur — table `profiles` */
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  school: string | null;
  field_of_study: string | null;
  promo_year: number | null;
  gender: "male" | "female" | null;
  whatsapp: string | null;
  linkedin: string | null;
  allow_whatsapp: boolean;
  bio: string | null;
  expertise: string[];
  portfolio_url: string | null;
  is_mentor: boolean;
  is_talent: boolean;
  badges: ProfileBadge[];
  role: "student" | "admin";
  points: number;
  github: string | null;
  website: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/** Document / Mémoire — table `documents` */
export interface Document {
  id: string;
  user_id: string | null;
  title: string;
  author_name: string;
  school: string;
  level: string | null;
  promo_year: number | null;
  keywords: string[];
  abstract: string | null;
  file_path: string | null;
  file_size: number | null;
  is_scanned: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  view_count: number;
  citation_count: number;
  created_at: string;
  approved_at: string | null;
}

/** Annonce Nexus — table `announcements` */
export interface Announcement {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  target_school: string;
  collab_type: string | null;
  tags: string[];
  contact_whatsapp: boolean;
  contact_linkedin: boolean;
  status: string;
  click_count: number;
  expires_at: string | null;
  created_at: string;
}

/** Message de chat (stocké en JSONB dans chat_sessions.messages) */
export interface ChatSessionMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: { title: string; school: string; author: string }[];
}

/** Session de chat — table `chat_sessions` */
export interface ChatSession {
  id: string;
  user_id: string | null;
  title: string;
  messages: ChatSessionMessage[];
  created_at: string;
  updated_at: string;
}

/** Chunks de documents — table `document_chunks` */
export interface DocumentChunk {
  id: string;
  document_id: string | null;
  content: string;
  chunk_index: number | null;
  page_number: number | null;
  created_at: string;
}

/** Statistique d'impact (calculée depuis documents + announcements) */
export interface ImpactStat {
  totalViews: number;
  totalCitations: number;
  totalClicks: number;
}

/** Activité récente (vue ou table `recent_activities`, si elle existe) */
export interface RecentActivity {
  id: string;
  user_id: string;
  type: "chat" | "nexus" | "lecture";
  title: string;
  preview: string;
  reference_id: string | null;
  created_at: string;
}
