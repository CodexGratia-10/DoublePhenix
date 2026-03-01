"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  Linkedin,
  BadgeCheck,
  Loader2,
  Share2,
  Briefcase,
} from "lucide-react";
import { getAnnouncementById } from "@/lib/api/announcements";
import { getPublicProfile } from "@/lib/api/profiles";
import type { Announcement } from "@/lib/types/database";
import type { Profile } from "@/lib/types/database";
import { toast } from "sonner";

// Type de mission → couleurs
const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  projet: { bg: "bg-blue-50", text: "text-blue-700", label: "Projet" },
  debat: { bg: "bg-purple-50", text: "text-purple-700", label: "Débat" },
  event: { bg: "bg-pink-50", text: "text-pink-700", label: "Événement" },
  offre: { bg: "bg-green-50", text: "text-green-700", label: "Offre" },
  éducatif: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Éducatif" },
  freelance: { bg: "bg-orange-50", text: "text-orange-700", label: "Freelance" },
  pro: { bg: "bg-red-50", text: "text-red-700", label: "Pro" },
};

// ═══════════════════════════════════════════
// Page détails d'une annonce Nexus — /nexus/[id]
// ═══════════════════════════════════════════
export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getAnnouncementById(id);
      setAnnouncement(data);

      if (data?.user_id) {
        const profile = await getPublicProfile(data.user_id);
        setAuthor(profile);
      }

      setIsLoading(false);
    }
    load();
  }, [id]);

  // Stable timestamp for relative time computation
  const [now] = useState(() => Date.now());

  // Relative time
  const formatRelTime = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  // Freshness badge
  const isNew = (dateStr: string) => {
    return now - new Date(dateStr).getTime() < 3 * 86400000; // < 3 days
  };

  // Type info
  const getTypeInfo = (type: string) => TYPE_COLORS[type] || { bg: "bg-gray-50", text: "text-gray-600", label: type };

  // Share
  const handleShare = async () => {
    const url = `${window.location.origin}/nexus/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: announcement?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié !");
      }
    } catch {
      // cancelled
    }
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#F9F9F7] items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        <p className="text-sm text-accent/60 font-body">Chargement...</p>
      </div>
    );
  }

  // ─── Not found ───
  if (!announcement) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#F9F9F7] items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-primary/30" />
        </div>
        <h2 className="text-lg font-bold text-primary font-display">Annonce introuvable</h2>
        <p className="text-sm text-accent/60 font-body">Cette annonce n&apos;existe pas ou a été supprimée.</p>
        <button
          onClick={() => router.push("/nexus")}
          className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold font-body"
        >
          Retour au Nexus
        </button>
      </div>
    );
  }

  const typeInfo = getTypeInfo(announcement.collab_type || "projet");
  const authorName = author?.full_name || "Anonyme";
  const authorFirstName = authorName.split(" ")[0] || "Bonjour";

  const normalizedPhone = author?.whatsapp?.replace(/\D/g, "") || "";
  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
        `Bonjour ${authorFirstName}, je suis intéressé(e) par votre annonce "${announcement.title}" sur PHENIX.`
      )}`
    : null;

  const linkedinUrl = author?.linkedin
    ? author.linkedin.startsWith("http")
      ? author.linkedin
      : `https://linkedin.com/in/${author.linkedin}`
    : null;

  const canUseWhatsapp = Boolean(
    announcement.contact_whatsapp && author?.allow_whatsapp && whatsappUrl
  );
  const canUseLinkedin = Boolean(
    announcement.contact_linkedin && linkedinUrl
  );

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden selection:bg-secondary/20">

      {/* ─── HEADER STICKY ─── */}
      <header className="sticky top-0 z-10 bg-[#F9F9F7]/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-primary font-display">Détails du Projet</h1>
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors"
          >
            <Share2 className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 overflow-y-auto pb-32">

        {/* ═══ HERO ═══ */}
        <div className="px-6 pt-8 pb-6">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            {isNew(announcement.created_at) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20">
                NOUVEAU
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${typeInfo.bg} ${typeInfo.text}`}>
              {typeInfo.label}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight text-primary mb-4 font-display">
            {announcement.title}
          </h2>

          {/* Metadata icons */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-accent font-medium font-body">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Posté {formatRelTime(announcement.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{announcement.target_school}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Collaboration {typeInfo.label}</span>
            </div>
          </div>

          {/* Tags */}
          {announcement.tags && announcement.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {announcement.tags.map((tag) => (
                <span key={tag} className="text-xs bg-[#F1F4F1] text-primary/70 px-3 py-1 rounded-full font-medium font-body">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ═══ DESCRIPTION ═══ */}
        <section className="px-6 py-4">
          <div className="p-6 bg-white rounded-2xl border border-accent/20 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest font-bold text-accent mb-4 font-display">
              Description du Projet
            </h3>
            <div className="space-y-4 text-sm leading-relaxed text-primary/80 font-body">
              {announcement.description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AUTHOR ═══ */}
        <section className="px-6 py-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-accent mb-4 px-1 font-display">
            Annonceur
          </h3>
          <Link
            href={`/u/${announcement.user_id}`}
            className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 hover:bg-primary/10 transition-all active:scale-[0.98]"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Image
                src={author?.avatar_url || "/male.png"}
                alt={authorName}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-0.5 border-2 border-white">
                <BadgeCheck className="w-3 h-3" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-primary text-lg leading-tight font-display">{authorName}</h4>
              <p className="text-accent text-sm font-medium font-body">{author?.school || announcement.target_school}</p>
              {author?.expertise && author.expertise.length > 0 && (
                <p className="text-primary/60 text-xs mt-1 font-body">{author.expertise[0]}</p>
              )}
            </div>

            {/* Arrow */}
            <ChevronLeft className="w-5 h-5 text-accent/30 rotate-180 shrink-0" />
          </Link>
        </section>

        {/* ═══ ACTION BUTTONS ═══ */}
        <section className="px-6 py-6 space-y-3">
          {canUseWhatsapp && whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform font-body"
            >
              <MessageCircle className="w-5 h-5" />
              Contacter via WhatsApp
            </a>
          )}

          {canUseLinkedin && linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform font-body"
            >
              <Linkedin className="w-5 h-5" />
              Contacter via LinkedIn
            </a>
          )}

          {!canUseWhatsapp && !canUseLinkedin && (
            <Link
              href={`/u/${announcement.user_id}`}
              className="w-full bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform font-body"
            >
              <Linkedin className="w-5 h-5" />
              Voir le profil complet
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}