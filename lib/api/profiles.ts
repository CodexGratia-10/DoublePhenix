// ═══════════════════════════════════════════
// PHENIX — API Profils (Supabase)
// Aligné avec la table `profiles` réelle
// ═══════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

/**
 * Récupère le profil de l'utilisateur connecté via auth.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[API] Erreur profil:", error.message);
    return null;
  }

  // Fallback to auth metadata if profile doesn't exist or is missing fields
  const fallbackProfile: Profile = {
    id: user.id,
    full_name: data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Utilisateur",
    avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || null,
    school: data?.school || user.user_metadata?.school || null,
    points: data?.points || 0,
    role: data?.role || "user",
    badges: data?.badges || [],
    email: data?.email || user.email || "",
    gender: data?.gender || null,
    title: data?.title || null,
    bio: data?.bio || null,
    website: data?.website || null,
    github: data?.github || null,
    linkedin: data?.linkedin || null,
    field_of_study: data?.field_of_study || null,
    promo_year: data?.promo_year || null,
    whatsapp: data?.whatsapp || null,
    allow_whatsapp: data?.allow_whatsapp || false,
    is_mentor: data?.is_mentor || false,
    is_talent: data?.is_talent || false,
    portfolio_url: data?.portfolio_url || null,
    expertise: data?.expertise || [],
    created_at: data?.created_at || new Date().toISOString(),
    updated_at: data?.updated_at || new Date().toISOString(),
  };

  return fallbackProfile;
}

/**
 * Récupère un profil public par son ID.
 */
export async function getPublicProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[API] Erreur profil public:", error.message);
    return null;
  }

  return data as Profile;
}
