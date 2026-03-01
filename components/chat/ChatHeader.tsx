"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { History, MoreVertical, Plus, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// ChatHeader — Header du chat avec menu 3 points
// Actions: Nouveau chat, Effacer conversation, Partager
// ═══════════════════════════════════════════

interface ChatHeaderProps {
  title?: string;
  isOnline?: boolean;
  onNewChat?: () => void;
  onClearChat?: () => void;
  onShareChat?: () => void;
}

export function ChatHeader({
  title = "L'IA Contextuelle",
  isOnline = true,
  onNewChat,
  onClearChat,
  onShareChat,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10 sticky top-0">
      {/* Historique */}
      <Link
        href="/chat/history"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-primary"
      >
        <History className="w-6 h-6" />
      </Link>

      {/* Titre + Statut */}
      <div className="flex flex-col items-center">
        <h1 className="text-lg font-bold text-primary tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-1.5">
          {isOnline && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {isOnline ? "En ligne" : "Hors ligne"}
          </span>
        </div>
      </div>

      {/* Menu 3 points */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-primary cursor-pointer"
        >
          <MoreVertical className="w-6 h-6" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in overflow-hidden">

            {/* 1. Nouveau chat */}
            <button
              onClick={() => {
                onNewChat?.();
                setMenuOpen(false);
                toast.success("Nouvelle conversation créée");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm">Nouveau chat</span>
                <span className="text-[10px] text-gray-400">Démarrer une conversation</span>
              </div>
            </button>

            {/* 2. Effacer conversation */}
            <button
              onClick={() => {
                onClearChat?.();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm">Effacer la conversation</span>
                <span className="text-[10px] text-gray-400">Supprimer tous les messages</span>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1 mx-4" />

            {/* 3. Partager */}
            <button
              onClick={() => {
                onShareChat?.();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm">Partager</span>
                <span className="text-[10px] text-gray-400">Copier le lien</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
