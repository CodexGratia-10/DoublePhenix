"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MoreVertical,
  BadgeCheck,
  MessageCircle,
  Linkedin,
  BarChart3,
  FileText,
  Brain,
  Megaphone,
  Award,
  Medal,
  Loader2,
  ChevronRight,
  Calendar,
  UserX,
  Pin,
  Share2,
  MapPin,
} from "lucide-react";
import { getPublicProfile } from "@/lib/api/profiles";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Document, Announcement } from "@/lib/types/database";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// Helper — Default avatar
// ═══════════════════════════════════════════
function getDefaultAvatar(gender: "male" | "female" | null) {
  return gender === "female" ? "/female.png" : "/male.png";
}

// ═══════════════════════════════════════════
// Badge tier styles
// ═══════════════════════════════════════════
const BADGE_STYLES: Record<string, { bg: string; border: string; text: string; subtleText: string }> = {
  gold: {
    bg: "bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3]",
    border: "border-secondary",
    text: "text-secondary",
    subtleText: "text-secondary/60",
  },
  silver: {
    bg: "bg-gradient-to-br from-[#e6e9f0] to-[#eef1f5]",
    border: "border-slate-400",
    text: "text-slate-600",
    subtleText: "text-slate-400",
  },
  bronze: {
    bg: "bg-gradient-to-br from-[#f5e6d3] to-[#e8d5c4]",
    border: "border-amber-700",
    text: "text-amber-800",
    subtleText: "text-amber-600/60",
  },
};

// ═══════════════════════════════════════════
// Page Profil Public — /u/[id]
// ═══════════════════════════════════════════
export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const supabase = createClient();

      const profileData = await getPublicProfile(userId);
      setProfile(profileData);

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
        .limit(3);
      setAnnouncements((annsData as Announcement[]) || []);

      setIsLoading(false);
    }
    load();
  }, [userId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${userId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Profil PHENIX", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien du profil copié !");
      }
    } catch { /* cancelled */ }
  };

  const [now] = useState(() => Date.now());

  const formatRelTime = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#F9F9F7] items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        <p className="text-sm text-accent/60 font-body">Chargement du profil...</p>
      </div>
    );
  }

  // ─── Not found ───
  if (!profile) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#F9F9F7] items-center justify-center gap-4 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
          <UserX className="w-10 h-10 text-primary/20" />
        </div>
        <h2 className="text-xl font-bold text-primary font-display">Profil introuvable</h2>
        <p className="text-sm text-accent/60 font-body max-w-xs">Cet utilisateur n&apos;existe pas ou a supprimé son profil.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold font-body active:scale-95 transition-transform"
        >
          Retour
        </button>
      </div>
    );
  }

  const fullName = profile.full_name || "Utilisateur";
  const badges = profile.badges || [];
  const hasBadges = badges.length > 0;
  const displayAvatar = profile.avatar_url || getDefaultAvatar(profile.gender);

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden selection:bg-secondary/20 pb-28">

      {/* ─── HEADER ─── */}
      <header className="flex items-center bg-white/90 sticky top-0 z-30 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/5 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-primary font-display">Profil PHENIX</h2>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-primary" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-accent/10 py-1.5 z-50">
                <button
                  onClick={() => { handleShare(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-[#F9F9F7] transition-colors font-body flex items-center gap-3"
                >
                  <Share2 className="w-4 h-4 text-accent" />
                  Partager le profil
                </button>
                <button
                  onClick={() => { toast.info("Signalement envoyé."); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-body flex items-center gap-3"
                >
                  <span className="text-red-400">⚠</span>
                  Signaler
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6 w-full">

        {/* ═══ PROFILE HERO ═══ */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-secondary p-0.5 bg-white shadow-xl overflow-hidden">
              <Image
                src={displayAvatar}
                alt={fullName}
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-secondary text-white rounded-full p-1.5 border-2 border-white shadow-md">
              <BadgeCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Name */}
          <div>
            <h1 className="text-2xl font-bold text-primary font-display">{fullName}</h1>
            <p className="text-accent font-medium font-body flex items-center justify-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.school || "—"}
              {profile.field_of_study && (
                <> | <span className="text-primary/60">{profile.field_of_study}</span></>
              )}
              {profile.expertise && profile.expertise.length > 0 && (
                <> | <span className="text-secondary font-semibold">{profile.expertise[0]}</span></>
              )}
              {profile.promo_year && (
                <> • <span className="text-primary/50">Promo {profile.promo_year}</span></>
              )}
            </p>
            {profile.bio && (
              <p className="text-primary/50 text-sm mt-1.5 font-body max-w-xs mx-auto line-clamp-1">{profile.bio.split("\n")[0]}</p>
            )}
          </div>

          {/* Online */}

        </div>

        {/* ═══ BADGES ═══ */}
        {hasBadges && (
          <div className={`grid gap-3 ${badges.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {badges.map((badge, idx: number) => {
              const style = BADGE_STYLES[badge.tier] || BADGE_STYLES.bronze;
              const IconComponent = badge.tier === "gold" ? Award : Medal;
              return (
                <div
                  key={idx}
                  className={`${style.bg} border ${style.border} rounded-2xl p-5 flex flex-col items-center justify-center shadow-md relative overflow-hidden group`}
                >
                  <div className="absolute -top-3 -right-3 opacity-[0.08] group-hover:scale-110 transition-transform">
                    <IconComponent className={`w-20 h-20 ${style.text}`} />
                  </div>
                  <IconComponent className={`w-7 h-7 ${style.text} mb-1.5`} />
                  <span className={`${style.text} font-bold text-sm font-display`}>{badge.label}</span>
                  <span className={`${style.subtleText} text-[10px] font-bold uppercase tracking-widest mt-0.5 font-body`}>
                    Niveau {badge.tier === "gold" ? "Gold" : badge.tier === "silver" ? "Silver" : "Bronze"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ CONTACT BUTTONS ═══ */}
        <div className="flex flex-col gap-3">
          {profile.whatsapp && profile.allow_whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${fullName.split(" ")[0]}, je vous contacte depuis PHENIX.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/15 hover:shadow-xl active:scale-[0.98] transition-all font-body"
            >
              <MessageCircle className="w-5 h-5" />
              Contacter via WhatsApp
            </a>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-secondary/15 hover:shadow-xl active:scale-[0.98] transition-all font-body"
            >
              <Linkedin className="w-5 h-5" />
              Profil LinkedIn
            </a>
          )}
          {!profile.whatsapp && !profile.linkedin && (
            <p className="text-center text-sm text-primary/40 font-body py-2">Pas de contact public renseigné</p>
          )}
        </div>

        {/* ═══ MENTOR STATS ═══ */}
        <div className="bg-accent/5 rounded-2xl p-5 border border-accent/15">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-primary uppercase text-xs tracking-widest font-display">Statistiques Mentor</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm text-center">
              <p className="text-3xl font-bold text-secondary font-display">{documents.length}</p>
              <p className="text-xs text-primary/60 font-body mt-1">Mémoires publiés</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm text-center">
              <p className="text-3xl font-bold text-secondary font-display">{announcements.length}</p>
              <p className="text-xs text-primary/60 font-body mt-1">Collaborations</p>
            </div>
          </div>
        </div>

        {/* ═══ PUBLISHED WORKS ═══ */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-primary flex items-center gap-2 font-display">
                <FileText className="w-5 h-5 text-secondary" />
                Travaux publiés
              </h3>
              {documents.length > 3 && (
                <span className="text-secondary text-xs font-bold font-body cursor-pointer hover:underline">Voir tout</span>
              )}
            </div>
            <div className="space-y-2">
              {documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className="bg-white p-4 rounded-2xl border border-primary/5 flex justify-between items-center group cursor-pointer hover:border-secondary/30 transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary line-clamp-1 text-sm font-display">{doc.title}</p>
                    <p className="text-xs text-accent mt-1 font-body">{doc.level || "—"} • {doc.school}</p>
                  </div>
                  <span className="ml-3 px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-lg shrink-0">
                    {doc.promo_year}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══ EXPERTISE & BIO ═══ */}
        {profile.bio && (
          <div className="bg-white p-5 rounded-2xl border border-primary/5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-secondary" />
              <h3 className="font-bold text-primary font-display">Expertise & Bio</h3>
            </div>
            <p className="text-sm text-primary/75 leading-relaxed font-body">
              {profile.bio}
            </p>
            {profile.expertise && profile.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill) => (
                  <span key={skill.trim()} className="px-3 py-1.5 bg-accent/8 text-accent rounded-full text-xs font-bold font-body border border-accent/10">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ANNOUNCEMENTS ═══ */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-primary flex items-center gap-2 px-1 font-display">
              <Megaphone className="w-5 h-5 text-secondary" />
              Annonces de collaboration
            </h3>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Link
                  key={ann.id}
                  href={`/nexus/${ann.id}`}
                  className="block bg-linear-to-r from-primary to-primary/85 p-5 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-body">
                      Actif
                    </span>
                    <Pin className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="font-bold text-sm font-display leading-tight">{ann.title}</p>
                  <p className="text-xs text-white/60 mt-2.5 flex items-center gap-1.5 font-body">
                    <Calendar className="w-3 h-3" />
                    Posté {formatRelTime(ann.created_at)}
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5 font-body">
                      Voir <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
