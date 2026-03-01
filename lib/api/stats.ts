// ═══════════════════════════════════════════
// PHENIX — API Stats & Activités (Supabase)
// Stats calculées depuis documents + announcements
// ═══════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";
import type { ImpactStat, RecentActivity } from "@/lib/types/database";

/**
 * Calcule les stats d'impact depuis les documents et annonces de l'utilisateur.
 * - totalViews = somme des view_count de tous ses documents
 * - totalCitations = somme des citation_count de tous ses documents
 * - totalClicks = somme des click_count de toutes ses annonces
 */
export async function getImpactStats(): Promise<ImpactStat | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch documents stats
    const { data: docs } = await supabase
      .from("documents")
      .select("view_count, citation_count")
      .eq("user_id", user.id);

    const totalViews = (docs || []).reduce((sum, d) => sum + (d.view_count || 0), 0);
    const totalCitations = (docs || []).reduce((sum, d) => sum + (d.citation_count || 0), 0);

    // Fetch announcements stats
    const { data: anns } = await supabase
      .from("announcements")
      .select("click_count")
      .eq("user_id", user.id);

    const totalClicks = (anns || []).reduce((sum, a) => sum + (a.click_count || 0), 0);

    return { totalViews, totalCitations, totalClicks };
  } catch {
    return null;
  }
}

/**
 * Récupère les activités récentes de l'utilisateur.
 */
export async function getRecentActivities(limit = 5): Promise<RecentActivity[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("recent_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data as RecentActivity[]) || [];
  } catch {
    return [];
  }
}
