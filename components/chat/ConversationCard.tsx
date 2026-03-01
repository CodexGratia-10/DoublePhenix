"use client";

import Link from "next/link";
import type { ChatConversation, ConversationIcon } from "@/lib/types/chat";
import {
  Bot,
  BarChart2,
  Shield,
  FileText,
  Leaf,
  Brain,
  GraduationCap,
  BookOpen,
  Microscope,
  Code,
  ChevronRight,
} from "lucide-react";

// ═══════════════════════════════════════════
// ConversationCard — Carte de conversation
// Pour la page historique
// ═══════════════════════════════════════════

interface ConversationCardProps {
  conversation: ChatConversation;
  /** Si cette conversation est actuellement active */
  isActive?: boolean;
}

/** Map icône nom → composant Lucide */
const ICON_MAP: Record<ConversationIcon, React.ElementType> = {
  bot: Bot,
  "bar-chart-2": BarChart2,
  shield: Shield,
  "file-text": FileText,
  leaf: Leaf,
  brain: Brain,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  microscope: Microscope,
  code: Code,
};

export function ConversationCard({
  conversation,
  isActive = false,
}: ConversationCardProps) {
  const Icon = conversation.icon ? ICON_MAP[conversation.icon] : Bot;

  return (
    <Link href={`/chat?id=${conversation.id}`}>
      <div
        className={`relative group flex items-center p-3 gap-3 rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
          isActive
            ? "bg-primary/10 border border-primary shadow-none"
            : "bg-white border border-transparent hover:border-primary/30 shadow-sm"
        }`}
      >
        {/* Indicateur actif (barre latérale) */}
        {isActive && (
          <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
        )}

        {/* Icône */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isActive
              ? "bg-white text-primary"
              : "bg-primary/5 text-primary"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Titre + Preview */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm truncate ${
              isActive ? "font-bold text-primary" : "font-semibold text-gray-800"
            }`}
          >
            {conversation.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {conversation.preview}
          </p>
        </div>

        {/* Heure + Chevron */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-medium ${
              isActive ? "font-bold text-primary" : "text-gray-400"
            }`}
          >
            {formatRelativeTime(conversation.updatedAt)}
          </span>
          <ChevronRight
            className={`w-4 h-4 ${
              isActive
                ? "text-primary"
                : "text-gray-300 group-hover:text-primary transition-colors"
            }`}
          />
        </div>
      </div>
    </Link>
  );
}

// ───────────────────────────────────────────
// Helper : temps relatif
// ───────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) {
    const minutes = Math.floor(diff / 60000);
    return minutes < 1 ? "à l'instant" : `${minutes}min`;
  }
  if (hours < 24) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Hier";
  if (days < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
