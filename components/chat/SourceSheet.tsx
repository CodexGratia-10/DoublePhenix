"use client";

import { useEffect, useRef } from "react";
import type { ChatSource } from "@/lib/types/chat";
import { ExternalLink, ArrowRight, X } from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════
// SourceSheet — Bottom sheet pour afficher un source
// S'affiche au clic sur un badge [n] dans le chat
// ═══════════════════════════════════════════

interface SourceSheetProps {
  /** Source à afficher (null = fermé) */
  source: ChatSource | null;
  /** Callback pour fermer le sheet */
  onClose: () => void;
}

export function SourceSheet({ source, onClose }: SourceSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fermer en cliquant sur le backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fermer avec Escape
  useEffect(() => {
    if (!source) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [source, onClose]);

  if (!source) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] flex flex-col justify-end animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="bg-white rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-white/20 max-h-[45vh] overflow-hidden flex flex-col pb-20 animate-slide-in-bottom"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-white text-xs font-bold shadow-sm">
                [{source.label}]
              </span>
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Source {source.type === "interne" ? "Interne" : "Externe"}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {source.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {source.author && `Auteur: ${source.author}`}
              {source.date && ` • ${source.date}`}
            </p>
          </div>

          {/* Bouton fermer / ouvrir */}
          <div className="flex gap-1">
            {source.documentUrl && (
              <Link
                href={source.documentUrl}
                className="p-2 -mr-2 text-gray-400 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu — Extrait */}
        <div className="p-6 overflow-y-auto bg-gray-50/50">
          <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-secondary pl-4 italic">
            &ldquo;{source.excerpt}&rdquo;
          </p>

          {/* Ref page */}
          {source.pageRef && (
            <p className="text-[10px] text-gray-400 mt-2 pl-4">
              {source.pageRef}
            </p>
          )}

          {/* Lien vers document complet */}
          {source.documentUrl && (
            <div className="mt-4 flex gap-2">
              <Link
                href={source.documentUrl}
                className="text-xs font-medium text-secondary hover:underline flex items-center gap-1"
              >
                Lire le document complet
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
