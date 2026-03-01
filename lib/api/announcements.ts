// ═══════════════════════════════════════════
// PHENIX — API Annonces Nexus (Supabase)
// Aligné avec la table `announcements` réelle
// ═══════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/lib/types/database";

const PAGE_SIZE = 10;

/**
 * Récupère les annonces avec pagination et filtres.
 */
export async function getAnnouncements(options?: {
  page?: number;
  pageSize?: number;
  school?: string;
  collab_type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ data: Announcement[]; count: number }> {
  const supabase = createClient();
  const {
    page = 0,
    pageSize = PAGE_SIZE,
    school,
    collab_type,
    search,
    dateFrom,
    dateTo,
  } = options || {};

  let query = supabase
    .from("announcements")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (school) {
    query = query.eq("target_school", school);
  }

  if (collab_type) {
    query = query.eq("collab_type", collab_type);
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("created_at", endDate.toISOString());
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[API] Erreur annonces:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data as Announcement[]) || [], count: count || 0 };
}

/**
 * Récupère une annonce par son ID.
 */
export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[API] Erreur annonce detail:", error.message);
    return null;
  }

  return data as Announcement;
}

/**
 * Crée une nouvelle annonce Nexus.
 */
export async function createAnnouncement(payload: {
  title: string;
  description: string;
  target_school: string;
  collab_type: string;
  tags: string[];
  contact_whatsapp?: boolean;
  contact_linkedin?: boolean;
}): Promise<Announcement | null> {
  try {
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("[API] Erreur création annonce:", errorBody?.error || response.statusText);
      return null;
    }

    const body = await response.json();
    return (body?.data as Announcement) || null;
  } catch (error) {
    console.error("[API] Erreur création annonce:", error);
    return null;
  }
}

/**
 * Matching Pilier C' (MVP): annonces ciblées pour une école + annonces globales.
 */
export async function getMatchingAnnouncements(options?: {
  school?: string | null;
  pageSize?: number;
}): Promise<Announcement[]> {
  const { pageSize = 4 } = options || {};

  try {
    const response = await fetch(`/api/announcements/matching?limit=${pageSize}`);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("[API] Erreur matching annonces:", errorBody?.error || response.statusText);
      return [];
    }

    const body = await response.json();
    return (body?.data as Announcement[]) || [];
  } catch (error) {
    console.error("[API] Erreur matching annonces:", error);
    return [];
  }
}
