"use client";

import { useCallback } from "react";
import type { ChatMessage as ChatMessageType, ChatSource } from "@/lib/types/chat";
import { Bot } from "lucide-react";

// ═══════════════════════════════════════════
// ChatMessage — Bulle de message (user / IA)
// Gère les avatars, citations [n], et cartes sources
// ═══════════════════════════════════════════

interface ChatMessageProps {
  message: ChatMessageType;
  /** Callback quand l'utilisateur clique sur un badge source [n] */
  onSourceClick?: (source: ChatSource) => void;
}

export function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Séparateur de date (rôle "system")
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
          <span className="text-xs font-bold text-gray-500">U</span>
        </div>
      ) : (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Contenu */}
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : ""} ${
          isUser ? "max-w-[85%]" : "max-w-[90%]"
        }`}
      >
        {/* Label expéditeur */}
        <span
          className={`text-xs font-medium text-gray-400 ${
            isUser ? "mr-1" : "ml-1"
          }`}
        >
          {isUser ? "Vous" : "PHENIX"}
        </span>

        {/* Bulle */}
        <div
          className={`p-4 shadow-sm text-sm leading-relaxed ${
            isUser
              ? "bg-accent text-white rounded-2xl rounded-tr-none"
              : "bg-white border border-primary/20 rounded-2xl rounded-tl-none text-gray-800"
          }`}
        >
          <MessageContent
            content={message.content}
            sources={message.sources}
            onSourceClick={onSourceClick}
          />
        </div>

        {/* Heure (utilisateur) */}
        {isUser && (
          <span className="text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>
        )}

        {/* Cartes sources (IA uniquement) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-1 ml-2 flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {message.sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onSourceClick?.(source)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm min-w-max cursor-pointer hover:border-secondary/50 transition-colors active:scale-[0.98]"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded bg-secondary/10 text-secondary text-[10px] font-bold">
                  [{source.label}]
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-semibold text-gray-700">
                    {source.title}
                  </span>
                  <span className="text-[9px] text-gray-400 truncate max-w-[120px]">
                    {source.subtitle}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// MessageContent — Rendu du texte + badges [n]
// ───────────────────────────────────────────

function MessageContent({
  content,
  sources,
  onSourceClick,
}: {
  content: string;
  sources?: ChatSource[];
  onSourceClick?: (source: ChatSource) => void;
}) {
  const handleBadgeClick = useCallback(
    (label: number) => {
      const source = sources?.find((s) => s.label === label);
      if (source) onSourceClick?.(source);
    },
    [sources, onSourceClick]
  );

  // Remplacer les marqueurs [n] par des badges cliquables
  // Et gérer le markdown basique (**bold**, listes •)
  const parts = content.split(/(\[(\d+)\])/g);

  return (
    <div className="space-y-2">
      {content.split("\n\n").map((paragraph, pIdx) => (
        <p key={pIdx}>
          {paragraph.split("\n").map((line, lIdx) => {
            // Ligne à puces •
            if (line.startsWith("• ") || line.startsWith("- ")) {
              const bulletContent = line.slice(2);
              return (
                <span key={lIdx} className="flex items-start gap-1.5 ml-1 mb-1">
                  <span className="text-secondary mt-0.5">•</span>
                  <span>
                    <InlineContent
                      text={bulletContent}
                      sources={sources}
                      onBadgeClick={handleBadgeClick}
                    />
                  </span>
                </span>
              );
            }

            return (
              <span key={lIdx}>
                {lIdx > 0 && <br />}
                <InlineContent
                  text={line}
                  sources={sources}
                  onBadgeClick={handleBadgeClick}
                />
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────
// InlineContent — Rendu inline (bold + badges)
// ───────────────────────────────────────────

function InlineContent({
  text,
  sources,
  onBadgeClick,
}: {
  text: string;
  sources?: ChatSource[];
  onBadgeClick: (label: number) => void;
}) {
  // Split par **bold** et [n] badges
  const regex = /(\*\*[^*]+\*\*|\[\d+\])/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        // Badge [n]
        const badgeMatch = part.match(/^\[(\d+)\]$/);
        if (badgeMatch && sources?.find((s) => s.label === parseInt(badgeMatch[1]))) {
          const label = parseInt(badgeMatch[1]);
          return (
            <button
              key={i}
              onClick={() => onBadgeClick(label)}
              className="inline-flex items-center justify-center align-middle h-5 min-w-[1.25rem] px-1 rounded text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 hover:bg-secondary hover:text-white transition-colors cursor-pointer ml-0.5"
              title="Voir la source"
            >
              [{label}]
            </button>
          );
        }

        // **Bold**
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return (
            <strong key={i} className="font-semibold">
              {boldMatch[1]}
            </strong>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ───────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
