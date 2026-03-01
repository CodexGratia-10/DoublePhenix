"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SourceSheet } from "@/components/chat/SourceSheet";
import type { ChatMessage as ChatMessageType, ChatSource } from "@/lib/types/chat";
import {
  getWelcomeMessage,
  getMessages,
  createConversation,
  saveExchange,
  clearConversationMessages,
  searchRelevantDocuments,
} from "@/lib/api/chat";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// Page Chat — Interface de conversation IA
// /chat ou /chat?id=conv-123
// Streame les réponses via Groq, sauvegarde dans Supabase
// ═══════════════════════════════════════════

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("id") || "new";

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ChatSource | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(
    conversationId !== "new" ? conversationId : null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Load messages ───
  useEffect(() => {
    async function loadMessages() {
      const dateSeparator: ChatMessageType = {
        id: "date-today",
        role: "system",
        content: "Aujourd'hui",
        createdAt: new Date(),
      };

      if (conversationId === "new") {
        setMessages([dateSeparator, getWelcomeMessage()]);
        setCurrentConvId(null);
      } else {
        const existingMessages = await getMessages(conversationId);
        if (existingMessages.length > 0) {
          setMessages([dateSeparator, ...existingMessages]);
        } else {
          setMessages([dateSeparator, getWelcomeMessage()]);
        }
        setCurrentConvId(conversationId);
      }
    }
    loadMessages();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send message with streaming ───
  const handleSend = useCallback(
    async (content: string) => {
      // 1. Add user message immediately
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 2. Create conversation if new
      let activeConvId = currentConvId;
      if (!activeConvId) {
        const newConv = await createConversation(content.slice(0, 60));
        if (newConv) {
          activeConvId = newConv.id;
          setCurrentConvId(newConv.id);
          // Update URL without full redirect
          window.history.replaceState(null, "", `/chat?id=${newConv.id}`);
        }
      }

      // 3. Create empty AI message for streaming
      const aiMessageId = `ai-${Date.now()}`;
      const aiMessage: ChatMessageType = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 4. Search relevant documents for source enrichment
      const relevantDocs = await searchRelevantDocuments(content);
      const sources: ChatSource[] = relevantDocs.map((doc, idx) => ({
        id: doc.id,
        label: idx + 1,
        title: doc.title,
        subtitle: doc.school,
        author: doc.author_name || undefined,
        date: `${doc.promo_year}`,
        excerpt: `Document académique de ${doc.school}`,
        type: "interne" as const,
        documentUrl: `/document/${doc.id}`,
        pageRef: undefined,
      }));

      try {
        // 5. Build chat history for API
        const chatHistory = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        chatHistory.push({ role: "user", content });

        // 6. Call streaming API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatHistory,
            conversationId: activeConvId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur serveur");
        }

        // 7. Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Pas de stream disponible");

        let fullContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: fullContent, sources: sources.length > 0 ? sources : undefined }
                      : m
                  )
                );
              }
            } catch {
              // Ignore invalid lines
            }
          }
        }

        // 8. Save exchange to Supabase
        if (activeConvId) {
          await saveExchange(
            activeConvId,
            content,
            fullContent,
            sources.length > 0 ? sources : undefined
          );
        }

        // 9. Final update with sources
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: fullContent, sources: sources.length > 0 ? sources : undefined }
              : m
          )
        );
      } catch (error) {
        console.error("[Chat] Erreur:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? {
                  ...m,
                  content:
                    m.content ||
                    "Désolé, une erreur s'est produite. Vérifiez que votre clé GROQ_API_KEY est correctement configurée dans `.env.local`.",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentConvId, messages]
  );

  // ─── Source click ───
  const handleSourceClick = useCallback((source: ChatSource) => {
    setSelectedSource(source);
  }, []);

  // ─── Menu actions ───
  const handleNewChat = useCallback(() => {
    router.push("/chat");
    setCurrentConvId(null);
    setMessages([
      {
        id: "date-today",
        role: "system",
        content: "Aujourd'hui",
        createdAt: new Date(),
      },
      getWelcomeMessage(),
    ]);
  }, [router]);

  const handleClearChat = useCallback(async () => {
    if (currentConvId) {
      const success = await clearConversationMessages(currentConvId);
      if (success) {
        toast.success("Conversation effacée");
      }
    }
    setMessages([
      {
        id: "date-today",
        role: "system",
        content: "Aujourd'hui",
        createdAt: new Date(),
      },
      getWelcomeMessage(),
    ]);
  }, [currentConvId]);

  const handleShareChat = useCallback(async () => {
    try {
      const url = currentConvId ? `${window.location.origin}/chat?id=${currentConvId}` : window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: "Conversation PHENIX",
          text: "Regarde cette conversation sur PHENIX !",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié !");
      }
    } catch {
      // User cancelled
    }
  }, [currentConvId]);

  return (
    <>
      <ChatHeader
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onShareChat={handleShareChat}
      />

      <main className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32 bg-[#fbfaf9]">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSourceClick={handleSourceClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <ChatInput onSend={handleSend} disabled={isLoading} />

      <SourceSheet
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center min-h-dvh bg-[#fbfaf9]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
