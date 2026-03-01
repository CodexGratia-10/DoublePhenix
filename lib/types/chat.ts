// ═══════════════════════════════════════════
// PHENIX Chat — Types
// Aligné avec la table `chat_sessions` Supabase
// ═══════════════════════════════════════════

/** Source citée dans une réponse IA */
export interface ChatSource {
  id: string;
  /** Numéro affiché dans le badge [1], [2]... */
  label: number;
  /** Titre du document source */
  title: string;
  /** Sous-titre / organisme */
  subtitle: string;
  /** Auteur du document */
  author?: string;
  /** Date de mise à jour */
  date?: string;
  /** Extrait cité du document */
  excerpt: string;
  /** Type de source : interne (mémoire UAC) ou externe */
  type: "interne" | "externe";
  /** URL vers le document complet dans la bibliothèque */
  documentUrl?: string;
  /** Page / chapitre référencé */
  pageRef?: string;
}

/** Rôle de l'expéditeur du message */
export type MessageRole = "user" | "assistant" | "system";

/** Un message dans une conversation (JSONB dans chat_sessions.messages) */
export interface ChatMessage {
  id: string;
  /** Rôle : utilisateur, assistant IA, ou système */
  role: MessageRole;
  /** Contenu texte du message */
  content: string;
  /** Sources citées dans ce message (uniquement pour les réponses IA) */
  sources?: ChatSource[];
  /** Timestamp du message */
  createdAt: Date;
}

/** Icône de la conversation */
export type ConversationIcon =
  | "bot"
  | "bar-chart-2"
  | "shield"
  | "file-text"
  | "leaf"
  | "brain"
  | "graduation-cap"
  | "book-open"
  | "microscope"
  | "code";

/** Une conversation (mapped from chat_sessions) */
export interface ChatConversation {
  id: string;
  /** Titre résumé de la conversation */
  title: string;
  /** Aperçu du dernier message */
  preview: string;
  /** Date de création */
  createdAt: Date;
  /** Date du dernier message */
  updatedAt: Date;
  /** Nombre total de messages */
  messageCount: number;
  /** Icône optionnelle pour la conversation */
  icon?: ConversationIcon;
}

/** Groupe de conversations par période */
export interface ConversationGroup {
  label: string; // "Aujourd'hui", "Hier", "Semaine dernière"
  conversations: ChatConversation[];
}

/** État du streaming de la réponse IA */
export interface StreamingState {
  isStreaming: boolean;
  partialContent: string;
}
