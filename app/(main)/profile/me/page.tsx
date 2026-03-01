"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  BadgeCheck,
  GraduationCap,
  ChevronRight,
  FileText,
  Eye,
  Plus,
  Globe,
  LinkIcon,
  Megaphone,
  MoreVertical,
  Lock,
  LogOut,
  Trash2,
  Award,
  Camera,
  Loader2,
  AlertTriangle,
  UserCircle,
  Languages,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import { getCurrentProfile } from "@/lib/api/profiles";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { Profile, Document, Announcement } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Helper — Default avatar based on gender
// ═══════════════════════════════════════════
function getDefaultAvatar(gender: "male" | "female" | null) {
  if (gender === "female") return "/female.png";
  return "/male.png";
}

// ═══════════════════════════════════════════
// Toggle Switch Component
// ═══════════════════════════════════════════
function Toggle({ checked, onChange, size = "md" }: { checked: boolean; onChange: () => void; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-gray-300"
      } ${size === "sm" ? "w-9 h-5" : "w-11 h-6"}`}
    >
      <span
        className={`inline-block bg-white rounded-full shadow transition-transform duration-200 ${
          size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5"
        } ${checked ? (size === "sm" ? "translate-x-[18px]" : "translate-x-[22px]") : "translate-x-[3px]"}`}
        style={{ width: size === "sm" ? 14 : 18, height: size === "sm" ? 14 : 18 }}
      />
    </button>
  );
}

// ═══════════════════════════════════════════
// Page Profil Privé — /profile/me
// ═══════════════════════════════════════════
export default function MyProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { locale, setLocale, t } = useI18n();

  // Data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [visibleOnNexus, setVisibleOnNexus] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [showLinkedin, setShowLinkedin] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Load
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const supabase = createClient();
      const profileData = await getCurrentProfile();
      setProfile(profileData);
      if (profileData?.avatar_url) setAvatarPreview(profileData.avatar_url);

      const userId = profileData?.id;
      if (!userId) { setIsLoading(false); return; }

      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      setDocuments((docsData as Document[]) || []);

      const { data: annsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      setAnnouncements((annsData as Announcement[]) || []);

      setIsLoading(false);
    }
    load();
  }, []);

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté. Utilisez une image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    toast.success("Photo de profil mise à jour !");
  };

  // Gender change
  const handleGenderChange = (g: "male" | "female") => {
    setGender(g);
    if (!avatarPreview || avatarPreview.includes("avatar-male") || avatarPreview.includes("avatar-female")) {
      setAvatarPreview(null); // Reset to default so it uses the new gender
    }
    toast.success(`Genre défini : ${g === "male" ? "Masculin" : "Féminin"}`);
  };

  const fullName = profile?.full_name || "Mon Profil";
  const hasMentorBadge = profile?.is_mentor ?? false;
  const hasTalentBadge = profile?.is_talent ?? false;
  const displayAvatar = avatarPreview || getDefaultAvatar(gender);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#F9F9F7] items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        <p className="text-sm text-accent/60 font-body">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden selection:bg-secondary/20 pb-28">

      {/* ═══ DELETE MODAL ═══ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-red-100 animate-scale-in">
            <div className="p-6 pb-3 text-center">
              <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2 font-display">Supprimer votre compte ?</h3>
              <p className="text-sm text-primary/70 leading-relaxed font-body">
                Cette action est irréversible. Toutes vos données, mémoires et annonces seront définitivement supprimés.
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="block text-xs font-bold text-primary/60 uppercase mb-2 ml-1 font-body">
                Confirmation de sécurité
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-primary/40" />
                </div>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="block w-full pl-10 pr-3 py-3.5 border border-primary/10 rounded-2xl bg-[#F9F9F7] text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition font-body"
                />
              </div>
            </div>
            <div className="bg-[#F9F9F7]/50 px-6 py-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!deletePassword) { toast.error("Entrez votre mot de passe."); return; }
                  toast.success("Demande de suppression envoyée.");
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors active:scale-[0.98] font-body"
              >
                Supprimer définitivement
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                className="w-full py-3.5 bg-white border border-primary/10 text-primary text-sm font-bold rounded-2xl hover:bg-gray-50 transition-colors font-body"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* ─── HEADER ─── */}
      <header className="bg-white border-b border-primary/5 pt-6 pb-6 px-6 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full hover:bg-primary/5 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-primary font-display">Tableau de Bord</h1>
          <div className="w-10 h-10" />
        </div>

        {/* Avatar + edit */}
        <div className="flex flex-col items-center">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-secondary/20 p-0.5 mb-3 shadow-lg shadow-secondary/10 overflow-hidden">
              <Image
                src={displayAvatar}
                alt={fullName}
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-3 right-0 bg-primary text-white p-2 rounded-full border-2 border-white group-hover:bg-secondary transition-colors shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center mb-3">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-primary font-display">{fullName}</h2>
          <p className="text-accent font-medium text-sm font-body">
            {profile?.school || "—"} {profile?.promo_year ? `• Promo ${profile.promo_year}` : ""} • <span className="text-secondary">Membre</span>
          </p>
          {profile?.email && (
            <p className="text-xs text-primary/40 font-body mt-1">{profile.email}</p>
          )}
        </div>
      </header>

      <main className="p-4 pb-8 space-y-5 max-w-lg mx-auto w-full">

        {/* ═══ BADGES STATUS ═══ */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-3 px-2 font-display">
            Statut Badges
          </h3>
          <div className="space-y-3">
            {/* Mentor */}
            <div className={`bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
              hasMentorBadge ? "border border-secondary/30 shadow-secondary/5" : "border border-primary/5"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasMentorBadge ? "bg-secondary/10" : "bg-[#F1F4F1]"}`}>
                  <BadgeCheck className={`w-7 h-7 ${hasMentorBadge ? "text-secondary" : "text-accent/30"}`} />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary font-display">Badge MENTOR</p>
                  <p className={`text-xs font-semibold uppercase tracking-wide font-body ${hasMentorBadge ? "text-secondary" : "text-accent/40"}`}>
                    {hasMentorBadge ? "Actif" : "Inactif"}
                  </p>
                </div>
              </div>
              <Award className={`w-6 h-6 ${hasMentorBadge ? "text-secondary" : "text-accent/15"}`} />
            </div>

            {/* Talent */}
            <div className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F1F4F1] flex items-center justify-center">
                  <GraduationCap className={`w-7 h-7 ${hasTalentBadge ? "text-accent" : "text-accent/30"}`} />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary font-display">Badge TALENT</p>
                  <p className="text-accent text-xs font-body">{hasTalentBadge ? "Actif" : "Remplir le formulaire"}</p>
                </div>
              </div>
              <Link href="/profile/become-talent" className="bg-accent/10 hover:bg-accent/20 text-accent p-2.5 rounded-xl transition-colors active:scale-95">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ GENRE ═══ */}
        <section className="bg-white p-5 rounded-2xl border border-primary/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold text-primary font-display">Genre</h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer" onClick={() => handleGenderChange("male")}>
                <span className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  gender === "male" ? "border-primary" : "border-primary/20"
                }`} style={{ width: 18, height: 18 }}>
                  {gender === "male" && <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ width: 10, height: 10 }} />}
                </span>
                <span className={`text-sm font-medium font-body ${gender === "male" ? "text-primary" : "text-primary/50"}`}>Masculin</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer" onClick={() => handleGenderChange("female")}>
                <span className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  gender === "female" ? "border-secondary" : "border-primary/20"
                }`} style={{ width: 18, height: 18 }}>
                  {gender === "female" && <span className="w-2.5 h-2.5 rounded-full bg-secondary" style={{ width: 10, height: 10 }} />}
                </span>
                <span className={`text-sm font-medium font-body ${gender === "female" ? "text-secondary" : "text-primary/50"}`}>Féminin</span>
              </label>
            </div>
          </div>
        </section>

        {/* ═══ MES MÉMOIRES ═══ */}
        <section className="bg-white p-5 rounded-2xl border border-primary/5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-primary font-display">
            <FileText className="w-4 h-4 text-secondary" />
            Mes Mémoires Partagés
          </h3>
          <div className="space-y-2">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className="flex items-center justify-between p-3.5 bg-[#F9F9F7] rounded-xl hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-secondary shrink-0" />
                    <span className="text-sm font-medium text-primary truncate font-body">{doc.title}</span>
                  </div>
                  <Eye className="w-4 h-4 text-accent/30 group-hover:text-accent transition-colors shrink-0" />
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-accent/20 mx-auto mb-2" />
                <p className="text-sm text-accent/40 font-body">Aucun document partagé</p>
              </div>
            )}
            <Link
              href="/upload"
              className="w-full text-center text-xs font-bold text-accent py-3 border border-dashed border-accent/30 rounded-xl hover:bg-accent/5 hover:border-accent/50 transition-all flex items-center justify-center gap-2 font-body"
            >
              <Plus className="w-4 h-4" />
              Ajouter un document
            </Link>
          </div>
        </section>

        {/* ═══ VISIBILITÉ NEXUS ═══ */}
        <section className="bg-white p-5 rounded-2xl border border-primary/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm text-primary font-display">Mode Visible sur Nexus</p>
                <p className="text-xs text-primary/60 font-body">Être visible par la communauté</p>
              </div>
            </div>
            <Toggle checked={visibleOnNexus} onChange={() => setVisibleOnNexus(!visibleOnNexus)} />
          </div>
        </section>

        {/* ═══ PARAMÈTRES DE CONTACT — Visibilité profil public ═══ */}
        <section className="bg-white p-5 rounded-2xl border border-primary/5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-primary font-display">
            <Eye className="w-4 h-4 text-accent" />
            Contacts sur le profil public
          </h3>
          <p className="text-xs text-primary/50 font-body -mt-2">Choisissez quels contacts sont visibles par les autres.</p>

          {/* WhatsApp input + toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-primary/50 uppercase ml-1 font-body">Numéro WhatsApp</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-primary/40 font-body">{showWhatsapp ? "Visible" : "Masqué"}</span>
                <Toggle checked={showWhatsapp} onChange={() => setShowWhatsapp(!showWhatsapp)} size="sm" />
              </div>
            </div>
            <div className="flex items-center border border-primary/10 rounded-xl bg-[#F9F9F7] px-3 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="text-sm font-bold border-r border-primary/10 pr-3 mr-3 text-primary font-body">+229</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="XX XX XX XX"
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium w-full text-primary outline-none font-body placeholder-primary/30"
              />
            </div>
          </div>

          {/* LinkedIn input + toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-primary/50 uppercase ml-1 font-body">Lien LinkedIn</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-primary/40 font-body">{showLinkedin ? "Visible" : "Masqué"}</span>
                <Toggle checked={showLinkedin} onChange={() => setShowLinkedin(!showLinkedin)} size="sm" />
              </div>
            </div>
            <div className="flex items-center border border-primary/10 rounded-xl bg-[#F9F9F7] px-3 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <LinkIcon className="w-4 h-4 text-primary/40 mr-3 shrink-0" />
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium w-full text-primary outline-none font-body placeholder-primary/30"
              />
            </div>
          </div>
        </section>

        {/* ═══ MES ANNONCES ═══ */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 font-display">Mes Annonces</h3>
            <Link href="/nexus" className="text-xs font-bold text-accent font-body">
              Voir tout ({announcements.length})
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={
                        ann.status === "OPEN" ? "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 font-body bg-accent/10 text-accent" : "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 font-body bg-primary/10 text-primary/50"
                      }>
                        {ann.status === "OPEN" ? "OUVERT" : ann.status?.toUpperCase() || "OUVERT"}
                      </span>
                      {ann.expires_at && (
                        <p className="text-[10px] text-primary/40 font-body">Expire le {new Date(ann.expires_at).toLocaleDateString("fr-FR")}</p>
                      )}
                      <h4 className="font-bold text-sm leading-tight text-primary font-display">{ann.title}</h4>
                    </div>
                    <button className="text-primary/20 hover:text-primary transition-colors p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toast.success("Annonce marquée comme pourvue.")}
                      className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] font-body"
                    >
                      Marquer comme POURVU
                    </button>
                    <button
                      onClick={() => toast.info("Annonce archivée.")}
                      className="flex-1 bg-white text-primary text-xs font-bold py-2.5 rounded-xl border border-primary/10 hover:bg-gray-50 transition-all font-body"
                    >
                      Archiver
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm text-center">
                <Megaphone className="w-8 h-8 text-accent/20 mx-auto mb-3" />
                <p className="text-sm text-accent/40 font-body mb-2">Aucune annonce publiée</p>
                <Link href="/nexus/create" className="text-xs font-bold text-secondary inline-block font-body hover:underline">
                  Créer une annonce →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ═══ SÉCURITÉ & COMPTE ═══ */}
        <section className="bg-white rounded-2xl border border-primary/5 divide-y divide-primary/5 shadow-sm overflow-hidden">
          {/* Security header + change password */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-primary/60" />
              <span className="font-bold text-sm text-primary font-display">Sécurité du compte</span>
            </div>
            <div className="pl-8">
              <button
                onClick={async () => {
                  const sb = createClient();
                  const { data: { user } } = await sb.auth.getUser();
                  if (!user?.email) {
                    toast.error("Impossible de récupérer votre email.");
                    return;
                  }
                  toast.info("Envoi du lien en cours...");
                  const redirectUrl = window.location.origin + "/auth/callback?type=recovery";
                  const { error } = await sb.auth.resetPasswordForEmail(user.email, {
                    redirectTo: redirectUrl,
                  });
                  if (error) {
                    toast.error(error.message || "Erreur lors de l'envoi.");
                    return;
                  }
                  toast.success("Lien envoyé !");
                  const verifyUrl = "/verification?type=reset&email=" + encodeURIComponent(user.email);
                  router.push(verifyUrl);
                }}
                className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center justify-between w-full p-3 bg-[#F9F9F7] rounded-xl font-body"
              >
                <span>Changer le mot de passe</span>
                <ChevronRight className="w-4 h-4 text-primary/30" />
              </button>
            </div>
          </div>

          {/* Paramètres généraux — expandable */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-5 h-5 text-primary/60" />
              <span className="font-bold text-sm text-primary font-display">{t("profile_general_settings")}</span>
            </div>
            
              {/* Language picker */}
              {/* Terms link */}
              <Link
                href="/conditions"
                className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center justify-between w-full p-3 bg-[#F9F9F7] rounded-xl font-body"
              >
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-primary/40" />
                  <span>{t("profile_terms")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-primary/30" />
              </Link>
            
          </div>

          {/* WhatsApp support */}
          <a
            href="https://wa.me/22997000000"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 flex items-center justify-between hover:bg-[#F9F9F7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                <span className="text-green-600 text-xs font-black font-body">W</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm text-primary font-body">Contacter l&apos;assistance</span>
                <span className="text-xs text-primary/40 font-body">+229 XX XX XX XX</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-primary/30" />
          </a>

          {/* Logout */}
          <button
            onClick={() => { toast.info("Déconnexion..."); router.push("/login"); }}
            className="p-4 flex items-center gap-3 w-full hover:bg-[#F9F9F7] transition-colors"
          >
            <LogOut className="w-5 h-5 text-secondary" />
            <span className="font-medium text-sm text-secondary font-body">Se déconnecter</span>
          </button>

          {/* Delete */}
          <div className="p-4 border-t-2 border-red-50">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-left flex items-center gap-3 group"
            >
              <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
              <span className="font-medium text-sm text-red-500 group-hover:text-red-600 transition-colors font-body">
                Supprimer mon compte
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}