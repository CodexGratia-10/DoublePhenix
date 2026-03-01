"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, SquarePen, History as HistoryIcon, Trash2, Loader2 } from "lucide-react";
import { ConversationCard } from "@/components/chat/ConversationCard";
import { getConversations, searchConversations, deleteConversation } from "@/lib/api/chat";
import type { ConversationGroup, ChatConversation } from "@/lib/types/chat";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// Page Historique — Supabase-Connected
// /chat/history
// ═══════════════════════════════════════════

export default function ChatHistoryPage() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatConversation[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations from Supabase
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getConversations();
      setGroups(data);
      setIsLoading(false);
    }
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchConversations(searchQuery);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Delete a conversation
  const handleDelete = async (id: string) => {
    const success = await deleteConversation(id);
    if (success) {
      toast.success("Conversation supprimée");
      // Refresh list
      const data = await getConversations();
      setGroups(data);
      // Also update search results if active
      if (searchResults) {
        setSearchResults((prev) => prev?.filter((c) => c.id !== id) || null);
      }
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Total conversations count
  const totalConversations = groups.reduce(
    (acc, g) => acc + g.conversations.length,
    0
  );

  return (
    <div className="flex flex-col h-dvh bg-[#f8f9f8]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4 bg-[#f8f9f8] z-20 sticky top-0">
        <Link
          href="/chat"
          className="p-2 -ml-2 rounded-full hover:bg-primary/5 transition-colors text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-center flex-1">
          Historique
        </h1>
        <Link
          href="/chat"
          className="p-2 -mr-2 rounded-full hover:bg-primary/5 transition-colors text-primary"
          title="Nouveau chat"
        >
          <SquarePen className="w-5 h-5" />
        </Link>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-2 z-10 bg-[#f8f9f8]">
        <div className="relative flex items-center w-full h-12 rounded-full bg-white shadow-sm ring-1 ring-black/5 group focus-within:ring-2 focus-within:ring-secondary transition-all">
          <div className="grid place-items-center h-full w-12 text-secondary">
            <Search className="w-5 h-5" />
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-800 bg-transparent pr-4 placeholder:text-gray-400 font-light"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations list */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-24 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            <p className="text-sm text-gray-400">Chargement de l&apos;historique...</p>
          </div>
        ) : searchResults !== null ? (
          // Search results
          <section>
            <div className="flex items-center justify-between py-3">
              <h2 className="text-sm font-bold text-gray-800">
                Résultats ({searchResults.length})
              </h2>
            </div>
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Aucune conversation trouvée pour &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                searchResults.map((conv) => (
                  <div key={conv.id} className="relative group">
                    <ConversationCard conversation={conv} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(conv.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : totalConversations === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <HistoryIcon className="w-8 h-8 text-primary/30" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary mb-1">Aucune conversation</h3>
              <p className="text-xs text-gray-400 max-w-[200px]">
                Démarrez une nouvelle conversation avec PHENIX pour la voir apparaître ici.
              </p>
            </div>
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Nouveau chat
            </Link>
          </div>
        ) : (
          // Grouped conversations
          <>
            {groups.map((group) => (
              <section key={group.label}>
                <div className="flex items-center justify-between py-3">
                  <h2 className="text-sm font-bold text-gray-800">
                    {group.label}
                  </h2>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {group.conversations.length} conversation{group.conversations.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.conversations.map((conv, idx) => (
                    <div key={conv.id} className="relative group">
                      <ConversationCard
                        conversation={conv}
                        isActive={group.label === "Aujourd'hui" && idx === 0}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Footer */}
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
              <HistoryIcon className="w-10 h-10 text-primary/30 mb-2" />
              <p className="text-xs text-gray-400">
                Vous avez atteint le début de votre historique.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
