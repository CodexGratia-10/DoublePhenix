"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// ChatInput — Barre de saisie du chat
// Textarea auto-resize | Attacher fichier | Envoyer
// Fichiers acceptés : images + PDF, max 2 Mo
// ═══════════════════════════════════════════

interface ChatInputProps {
  /** Callback à l'envoi du message */
  onSend: (content: string, file?: File) => void;
  /** Désactiver l'input (pendant le streaming) */
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize du textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "44px";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachedFile) || disabled) return;
    onSend(trimmed, attachedFile || undefined);
    setValue("");
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Format non supporté", {
        description: "Seuls les fichiers PDF et images (JPG, PNG, GIF, WebP) sont acceptés.",
      });
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux", {
        description: `La taille maximale est de 2 Mo. Votre fichier fait ${(file.size / (1024 * 1024)).toFixed(1)} Mo.`,
      });
      return;
    }

    setAttachedFile(file);
    toast.success(`${file.name} attaché`);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const isImage = attachedFile?.type.startsWith("image/");

  return (
    <div className="fixed bottom-[64px] left-0 right-0 px-4 py-2 z-20 pointer-events-none">
      <div className="max-w-md mx-auto flex flex-col gap-2 pointer-events-auto">

        {/* Attached file preview */}
        {attachedFile && (
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-200 animate-fade-in">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isImage ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"}`}>
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{attachedFile.name}</p>
              <p className="text-[10px] text-gray-400">{(attachedFile.size / 1024).toFixed(0)} Ko • {isImage ? "Image" : "PDF"}</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Attach file button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 mb-[2px] rounded-full bg-white text-gray-400 hover:bg-gray-50 hover:text-secondary transition-colors flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer"
            title="Joindre un fichier (PDF ou image, max 2Mo)"
          >
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Textarea */}
          <div className="flex-1 relative shadow-sm">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Posez votre question..."
              rows={1}
              className="w-full bg-white border border-gray-200 rounded-3xl pl-4 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none overflow-hidden max-h-32 text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
              style={{ minHeight: 44 }}
            />
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (!value.trim() && !attachedFile)}
            className="flex-shrink-0 w-10 h-10 mb-[2px] rounded-full bg-secondary text-white hover:bg-secondary/90 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
