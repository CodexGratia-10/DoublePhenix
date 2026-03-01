"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Send, LockKeyhole, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("L'email est requis");
      toast.error("Veuillez entrer votre adresse email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email invalide");
      toast.error("Veuillez entrer un email valide.");
      return;
    }

    setIsSending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/callback?type=recovery",
      });

      if (resetError) {
        toast.error(resetError.message || "Erreur lors de l'envoi.");
        setIsSending(false);
        return;
      }

      toast.success("Lien de réinitialisation envoyé !");
      router.push("/verification?type=reset&email=" + encodeURIComponent(email));
    } catch {
      toast.error("Une erreur est survenue.");
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-primary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 flex items-center z-10">
        <Link
          href="/login"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-8 z-10 justify-center pb-20">
        {/* Icon illustration */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <LockKeyhole className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#121716] mb-3 font-display">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 text-base leading-relaxed font-body">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1 font-body" htmlFor="reset-email">
              Adresse Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="reset-email"
                type="email"
                placeholder="ex: jean.dupont@etudiant.bj"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`block w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 border text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder-gray-400 text-sm outline-none font-body ${
                  error ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1 font-body">
                <AlertCircle className="w-3 h-3" />{error}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-primary hover:bg-[#0a2f25] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transform transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>Envoyer le lien</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back to login */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </main>

      {/* Footer */}
      <div className="p-6 text-center z-10">
        <p className="text-xs text-gray-400 font-body">PHENIX — Plateforme académique</p>
      </div>
    </div>
  );
}
