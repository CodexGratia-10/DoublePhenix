// ═══════════════════════════════════════════
// PHENIX — API Documents / Mémoires (Supabase)
// Aligné avec la table `documents` réelle
// ═══════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types/database";

/**
 * Récupère les documents de la bibliothèque (paginé).
 * Utilisé par la page Library avec scroll infini.
 */
export async function getDocuments(options: {
  page?: number;
  pageSize?: number;
  school?: string;
  search?: string;
  level?: string;
  promo_year?: number;
}): Promise<{ data: Document[]; count: number }> {
  const supabase = createClient();
  const { page = 0, pageSize = 10, school, search, level, promo_year } = options;

  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (school) {
    query = query.eq("school", school);
  }

  if (level) {
    query = query.eq("level", level);
  }

  if (promo_year) {
    query = query.eq("promo_year", promo_year);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[API] Erreur documents:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data as Document[]) || [], count: count || 0 };
}

/**
 * Récupère un document par son ID.
 * Utilisé par /document/[id].
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[API] Erreur document:", error.message);
    return null;
  }

  return data as Document;
}

/**
 * Récupère les documents recommandés pour le dashboard.
 */
export async function getRecommendedDocuments(limit = 4, school?: string): Promise<Document[]> {
  const supabase = createClient();

  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (school) {
    query = query.eq("school", school);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[API] Erreur recommandations:", error.message);
    return [];
  }

  return (data as Document[]) || [];
}

/**
 * Upload un nouveau document (insert dans la table documents).
 */
export async function uploadDocument(payload: {
  title: string;
  author_name: string;
  school: string;
  level?: string;
  promo_year?: number;
  keywords?: string[];
  abstract?: string;
  file_path?: string;
  file_size?: number;
}): Promise<Document | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      ...payload,
      user_id: user?.id || null,
      status: "PENDING",
      is_scanned: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[API] Erreur upload document:", error.message);
    return null;
  }

  return data as Document;
}

/**
 * Toggle le bookmark d'un document pour l'utilisateur courant.
 * Note: la table `bookmarks` n'existe pas encore en DB.
 */
export async function toggleBookmark(documentId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Vérifier si le bookmark existe
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .single();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, document_id: documentId });
    return true;
  }
}

/**
 * Récupère les IDs des documents bookmarkés par l'utilisateur.
 * Note: la table `bookmarks` n'existe pas encore en DB.
 */
export async function getUserBookmarks(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("document_id")
    .eq("user_id", user.id);

  if (error) {
    // Table may not exist yet — silently return empty
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return [];
    }
    console.error("[API] Erreur bookmarks:", error.message);
    return [];
  }

  return (data || []).map((b) => b.document_id);
}
