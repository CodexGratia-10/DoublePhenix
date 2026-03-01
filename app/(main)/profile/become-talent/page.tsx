"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Link2,
  Stars,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// Page Devenir un Talent — /profile/become-talent
// ═══════════════════════════════════════════
export default function BecomeTalentPage() {
  const router = useRouter();

  const [expertise, setExpertise] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bioMin = 140;
  const bioOk = bio.length >= bioMin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertise.trim()) { toast.error("Veuillez saisir votre expertise principale."); return; }
    if (!bioOk) { toast.error(`La bio doit contenir au moins ${bioMin} caractères.`); return; }
    if (!q1.trim() || !q2.trim() || !q3.trim()) { toast.error("Veuillez répondre à toutes les questions."); return; }

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Vous devez être connecté."); return; }

      const expertiseArray = expertise.split(",").map((e) => e.trim()).filter(Boolean);
      const { error } = await supabase
        .from("profiles")
        .update({
          expertise: expertiseArray,
          portfolio_url: portfolio.trim() || null,
          bio: bio.trim(),
          is_talent: true,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Candidature envoyée ! Votre profil a été mis à jour.");
      router.push("/profile/me");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden pb-28">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-10 bg-[#F9F9F7]/80 backdrop-blur-md border-b border-primary/10 px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push("/profile/me")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-primary font-display">Devenir un Talent</h1>
        <div className="w-10" />
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">

        {/* ═══ BADGE HERO ═══ */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-5">
            {/* Glow */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
            {/* Badge */}
            <div className="relative bg-gradient-to-br from-slate-200 to-slate-400 p-7 rounded-full shadow-lg border-4 border-white/50">
              <ShieldCheck className="w-14 h-14 text-slate-100" strokeWidth={1.5} />
            </div>
            {/* Tier label */}
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm font-body">
              Argent
            </div>
          </div>
          <h2 className="text-xl font-bold text-primary mb-2 font-display">Badge Argent</h2>
          <p className="text-sm text-primary/70 leading-relaxed font-body max-w-xs">
            Postulez pour obtenir votre Badge Argent et débloquer des opportunités exclusives au sein de l&apos;écosystème PHENIX.
          </p>
        </div>

        {/* ═══ FORM ═══ */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Expertise */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary px-1 font-display">
              Expertise Principale <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Saisissez votre expertise (ex: Marketing Digital)"
              className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3.5 text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body placeholder-primary/30"
            />
          </div>

          {/* Portfolio */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary px-1 font-display">
              Lien Portfolio / GitHub
            </label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://github.com/votre-nom"
                className="w-full bg-white border border-primary/10 rounded-xl pl-12 pr-4 py-3.5 text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body placeholder-primary/30"
              />
            </div>
          </div>

          {/* Questionnaire */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary px-1 font-display">
              Questionnaire de Compétences
            </label>
            <div className="space-y-4 mt-3">
              {/* Q1 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primary/70 px-1 font-body">
                  Quelles sont vos motivations pour aider d&apos;autres étudiants ?
                </label>
                <textarea
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={3}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none font-body placeholder-primary/30"
                />
              </div>
              {/* Q2 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primary/70 px-1 font-body">
                  Décrivez une expérience où vous avez partagé vos connaissances.
                </label>
                <textarea
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={3}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none font-body placeholder-primary/30"
                />
              </div>
              {/* Q3 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primary/70 px-1 font-body">
                  Comment organisez-vous votre temps pour collaborer sur des projets ?
                </label>
                <textarea
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={3}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none font-body placeholder-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Bio / Pitch */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary px-1 font-display flex justify-between items-center">
              <span>Bio / Pitch</span>
              <span className="text-[10px] text-primary/40 font-normal font-body">Min. {bioMin} caractères</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez votre parcours et vos ambitions en quelques mots..."
              rows={4}
              className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3.5 text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none font-body placeholder-primary/30"
            />
            <div className="flex justify-end px-1">
              <span className={`text-[10px] font-bold font-body transition-colors ${bioOk ? "text-accent" : "text-secondary"}`}>
                {bio.length} / {bioMin}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mt-8 disabled:opacity-60 disabled:active:scale-100 font-body"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Stars className="w-5 h-5" />
                Obtenir mon Badge Argent
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}