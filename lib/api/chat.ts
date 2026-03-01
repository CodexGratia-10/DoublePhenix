// ═══════════════════════════════════════════
// PHENIX Chat — API Layer (Supabase-Connected)
// Aligné avec la table `chat_sessions` (messages JSONB)
// ═══════════════════════════════════════════

import type {
  ChatMessage,
  ChatConversation,
  ConversationGroup,
} from "@/lib/types/chat";
import { createClient } from "@/lib/supabase/client";

// ───────────────────────────────────────────
// HELPERS — Auth
// ───────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ───────────────────────────────────────────
// CONVERSATIONS (chat_sessions)
// ───────────────────────────────────────────

/**
 * Récupère toutes les conversations de l'utilisateur, groupées par date.
 */
export async function getConversations(): Promise<ConversationGroup[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[Chat API] Erreur getConversations:", error.message);
    return [];
  }

  const conversations: ChatConversation[] = (data || []).map((row: Record<string, unknown>) => {
    const messages = (row.messages as Record<string, unknown>[] | null) || [];
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    return {
      id: row.id as string,
      title: (row.title as string) || "Nouvelle conversation",
      preview: lastMsg ? String((lastMsg as Record<string, unknown>).content || "").slice(0, 100) : "",
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      messageCount: messages.length,
    };
  });

  // Group by date
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: ConversationGroup[] = [];

  const todayConvs = conversations.filter((c) => c.updatedAt >= today);
  const yesterdayConvs = conversations.filter((c) => c.updatedAt >= yesterday && c.updatedAt < today);
  const weekConvs = conversations.filter((c) => c.updatedAt >= weekAgo && c.updatedAt < yesterday);
  const olderConvs = conversations.filter((c) => c.updatedAt < weekAgo);

  if (todayConvs.length) groups.push({ label: "Aujourd'hui", conversations: todayConvs });
  if (yesterdayConvs.length) groups.push({ label: "Hier", conversations: yesterdayConvs });
  if (weekConvs.length) groups.push({ label: "Semaine dernière", conversations: weekConvs });
  if (olderConvs.length) groups.push({ label: "Plus ancien", conversations: olderConvs });

  return groups;
}

/**
 * Crée une nouvelle conversation et retourne son objet.
 */
export async function createConversation(title?: string): Promise<ChatConversation | null> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title: title || "Nouvelle conversation",
      messages: [],
    })
    .select()
    .single();

  if (error) {
    console.error("[Chat API] Erreur createConversation:", error.message);
    return null;
  }

  return {
    id: data.id,
    title: data.title || "Nouvelle conversation",
    preview: "",
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    messageCount: 0,
  };
}

/**
 * Met à jour le titre d'une conversation.
 */
export async function updateConversation(
  id: string,
  updates: { title?: string }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[Chat API] Erreur updateConversation:", error.message);
  }
}

/**
 * Supprime une conversation.
 */
export async function deleteConversation(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) {
    console.error("[Chat API] Erreur deleteConversation:", error.message);
    return false;
  }
  return true;
}

/**
 * Recherche dans les conversations.
 */
export async function searchConversations(query: string): Promise<ChatConversation[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .ilike("title", `%${query}%`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[Chat API] Erreur searchConversations:", error.message);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => {
    const messages = (row.messages as Record<string, unknown>[] | null) || [];
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    return {
      id: row.id as string,
      title: (row.title as string) || "Conversation",
      preview: lastMsg ? String((lastMsg as Record<string, unknown>).content || "").slice(0, 100) : "",
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      messageCount: messages.length,
    };
  });
}

// ───────────────────────────────────────────
// MESSAGES (JSONB dans chat_sessions.messages)
// ───────────────────────────────────────────

/**
 * Récupère les messages d'une conversation (depuis le champ JSONB).
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("messages")
    .eq("id", conversationId)
    .single();

  if (error) {
    console.error("[Chat API] Erreur getMessages:", error.message);
    return [];
  }

  const rawMessages = (data?.messages as Record<string, unknown>[] | null) || [];

  return rawMessages.map((msg, index) => ({
    id: `msg-${index}`,
    role: (msg.role as ChatMessage["role"]) || "user",
    content: (msg.content as string) || "",
    sources: msg.sources ? (msg.sources as ChatMessage["sources"]) : undefined,
    createdAt: msg.created_at ? new Date(msg.created_at as string) : new Date(),
  }));
}

/**
 * Sauvegarde un échange complet (user + assistant) dans le JSONB messages.
 */
export async function saveExchange(
  conversationId: string,
  userContent: string,
  assistantContent: string,
  sources?: unknown
): Promise<void> {
  const supabase = createClient();

  // Récupérer les messages existants
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("messages, title")
    .eq("id", conversationId)
    .single();

  const existingMessages = (session?.messages as Record<string, unknown>[] | null) || [];
  const now = new Date().toISOString();

  // Ajouter les 2 nouveaux messages
  const updatedMessages = [
    ...existingMessages,
    { role: "user", content: userContent, created_at: now },
    { role: "assistant", content: assistantContent, created_at: now, ...(sources ? { sources } : {}) },
  ];

  // Auto-title from first user message
  const updates: Record<string, unknown> = {
    messages: updatedMessages,
    updated_at: now,
  };

  if (session?.title === "👋 Nouvelle conversation" || session?.title === "Nouvelle conversation") {
    updates.title = userContent.slice(0, 60);
  }

  const { error } = await supabase
    .from("chat_sessions")
    .update(updates)
    .eq("id", conversationId);

  if (error) {
    console.error("[Chat API] Erreur saveExchange:", error.message);
  }
}

/**
 * Efface tous les messages d'une conversation (reset du JSONB).
 */
export async function clearConversationMessages(conversationId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ messages: [], updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    console.error("[Chat API] Erreur clearMessages:", error.message);
    return false;
  }

  return true;
}

// ───────────────────────────────────────────
// DOCUMENT SEARCH (pour les sources IA)
// ───────────────────────────────────────────

/**
 * Recherche des documents pertinents pour enrichir les réponses IA.
 */
export async function searchRelevantDocuments(query: string, limit: number = 3): Promise<{
  id: string;
  title: string;
  school: string;
  author_name: string;
  promo_year: number | null;
}[]> {
  const supabase = createClient();

  const keywords = query.split(" ").filter((w) => w.length > 3).slice(0, 3);
  if (keywords.length === 0) return [];

  const searchPattern = keywords.map((k) => `title.ilike.%${k}%`).join(",");

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, school, author_name, promo_year")
    .or(searchPattern)
    .eq("status", "APPROVED")
    .limit(limit);

  if (error) {
    console.error("[Chat API] Erreur searchDocuments:", error.message);
    return [];
  }

  return data || [];
}

// ───────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────

/**
 * Récupère le message de bienvenue initial pour un nouveau chat.
 */
export function getWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Bonjour ! Je suis **PHENIX**, votre assistant contextuel. Je peux vous aider avec vos recherches académiques en m'appuyant sur les mémoires et thèses disponibles. Que souhaitez-vous explorer ?",
    createdAt: new Date(),
  };
}
