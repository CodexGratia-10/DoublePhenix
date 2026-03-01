"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, BookText, Users, ArrowRight, BadgeCheck, Award, Upload, Play, Eye, BookOpen, MessageSquare, GraduationCap, Sparkles, Star } from "lucide-react";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";

// API Supabase
import { getCurrentProfile } from "@/lib/api/profiles";
import { getRecommendedDocuments } from "@/lib/api/documents";
import { getMatchingAnnouncements } from "@/lib/api/announcements";
import { getImpactStats, getRecentActivities } from "@/lib/api/stats";

// Types
import type { Profile, Document, Announcement, ImpactStat, RecentActivity } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Couleurs par type d'annonce Nexus
// ═══════════════════════════════════════════
const NEXUS_COLORS: Record<string, { border: string; bg: string; text: string; bubble: string }> = {
  projet: { border: "border-l-primary", bg: "bg-[#F1F4F1]", text: "text-primary", bubble: "bg-primary/5" },
  debat:  { border: "border-l-secondary", bg: "bg-orange-50", text: "text-secondary", bubble: "bg-secondary/5" },
  event:  { border: "border-l-accent", bg: "bg-green-50", text: "text-accent", bubble: "bg-accent/5" },
  offre:  { border: "border-l-indigo-500", bg: "bg-indigo-50", text: "text-indigo-600", bubble: "bg-indigo-50" },
};

// Couleurs pour les cartes mémoires (rotation)
const CARD_GRADIENTS = [
  "from-primary to-[#0F4A3A]",
  "from-accent to-[#82AD88]",
  "from-secondary to-[#D4A76A]",
  "from-slate-800 to-slate-700",
];

// ═══════════════════════════════════════════
// Dashboard Page — Supabase-Connected
// ═══════════════════════════════════════════
export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ImpactStat | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Fetch all data from Supabase ───
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [profileData, statsData, docsData, matchedAnnouncements, activitiesData] = await Promise.all([
          getCurrentProfile(),
          getImpactStats(),
          getRecommendedDocuments(4),
          getMatchingAnnouncements({ pageSize: 4 }),
          getRecentActivities(3),
        ]);

        setProfile(profileData);
        setStats(statsData);
        setDocuments(docsData);
        setAnnouncements(matchedAnnouncements || []);
        setActivities(activitiesData);
      } catch (err) {
        console.error("[Dashboard] Erreur chargement:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // ─── Loading skeleton ───
  if (isLoading) {
    return (
      <div className="relative flex min-h-dvh w-full flex-col bg-[#fafafa] pb-28 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 animate-pulse" />
          <div className="h-4 w-40 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // ─── Fallback values ───
  const firstName = profile?.full_name?.split(" ")[0] || "Utilisateur";
  const avatarUrl = profile?.avatar_url || (profile?.gender === "female" ? "/female.png" : "/male.png");
  const badges = profile?.badges || [];
  const totalViews = stats?.totalViews || 0;
  const totalCitations = stats?.totalCitations || 0;
  const totalClicks = stats?.totalClicks || 0;



  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#fafafa] pb-28">

      {/* ─── Background Animé ─── */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-slate-100 to-transparent opacity-80" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full shape-blob blur-md animate-float opacity-70 mix-blend-multiply" />
        <div className="absolute top-10 -right-20 w-64 h-64 rounded-full bg-linear-to-br from-secondary/10 to-transparent blur-2xl animate-float-delayed" />
        <div className="absolute top-32 left-4 w-16 h-16 rounded-2xl shape-cube transform rotate-12 animate-float-slow" />
        <div className="absolute top-24 right-10 w-24 h-24 rounded-full bg-linear-to-tr from-accent/20 to-white/40 shadow-lg backdrop-blur-sm animate-float z-0 border border-white/30" />
        <div className="absolute top-0 left-1/3 w-full h-full opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M45.7,-76.3C58.9,-69.3,69.1,-55.6,76.1,-41.2C83.1,-26.8,86.9,-11.7,84.4,2.5C81.9,16.7,73.1,30,63.1,41.2C53.1,52.4,41.9,61.5,29.4,68.4C16.9,75.3,3.1,80,-10.2,79.1C-23.5,78.2,-36.3,71.7,-48.4,63.1C-60.5,54.5,-71.9,43.8,-79.3,30.5C-86.7,17.2,-90.1,1.3,-86.3,-12.9C-82.5,-27.1,-71.5,-39.6,-59.4,-47.5C-47.3,-55.4,-34.1,-58.7,-21.5,-66.1C-8.9,-73.5,3.1,-85,16.7,-86.4C30.3,-87.8,45.5,-79.1,45.7,-76.3Z" fill="#0C3B2E" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* ─── 1. HEADER PROFIL ─── */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="glass-panel rounded-3xl p-5 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none z-20" />

          <div className="relative shrink-0 z-20">
            <div className="avatar-ring p-[3px] rounded-full shadow-lg relative">
              <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-sm" />
              <div className="size-16 rounded-full overflow-hidden border-2 border-white bg-white relative z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" priority />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 size-5 rounded-full bg-accent border-2 border-white shadow-[0_0_8px_rgba(109,151,115,0.6)] z-20 flex items-center justify-center">
              <div className="size-1.5 bg-white rounded-full" />
            </div>
          </div>

          <div className="flex flex-col justify-center grow z-20">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient-premium drop-shadow-sm mb-2">
              Bonjour, {firstName}
            </h1>
            <div className="flex flex-wrap gap-2">
              {profile?.is_mentor && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-white text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(187,138,82,0.4)]">
                   <Star className="w-3 h-3 fill-white" /> Mentor
                </div>
              )}
              {profile?.is_talent && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(12,59,46,0.3)]">
                   <Flame className="w-3 h-3 fill-white" /> Talent
                </div>
              )}
              {badges.map((badge) => (
                <div key={badge.label} className={`relative overflow-hidden rounded-lg p-px shadow-sm transition-transform duration-300 hover:scale-105 cursor-default ${badge.tier === "gold" ? "bg-metallic-gold" : "bg-metallic-silver"}`}>
                  <div className={`flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 backdrop-blur-sm ${badge.tier === "gold" ? "bg-[#FFF8F0]/90" : "bg-[#F8FAFC]/90"}`}>
                    {badge.tier === "gold" ? <BadgeCheck className="w-3.5 h-3.5 text-[#9E7039]" /> : <Award className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider ${badge.tier === "gold" ? "text-[#7c5629]" : "text-slate-600"}`}>{badge.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── CONTENU PRINCIPAL ─── */}
      <main className="flex-1 overflow-y-auto no-scrollbar space-y-6 relative z-10 pb-4">

        {/* ─── 2. MON IMPACT ─── */}
        <section className="px-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md p-5 card-shadow ring-1 ring-white/60 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-accent/10 to-transparent rounded-bl-3xl pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 relative z-10">Mon Impact</p>
            
            <div className="flex gap-4 relative z-10">
              {/* Le graphe */}
              <div className="h-32 w-1/2 min-w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Vues', value: totalViews, color: '#0C3B2E' },
                    { name: 'Cits', value: totalCitations, color: '#BB8A52' },
                    { name: 'Clics', value: totalClicks, color: '#6D9773' },
                  ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} itemStyle={{color: '#0C3B2E', fontWeight: 'bold'}} labelStyle={{display: 'none'}} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {
                        [
                          { name: 'Vues', value: totalViews, color: '#0C3B2E' },
                          { name: 'Cits', value: totalCitations, color: '#BB8A52' },
                          { name: 'Clics', value: totalClicks, color: '#6D9773' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Les stats en texte */}
              <div className="flex flex-col justify-center gap-2.5 w-1/2">
                <div className="flex items-center justify-between bg-primary/5 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-primary uppercase line-clamp-1">Vues</p>
                  <span className="text-sm font-black text-primary">{totalViews}</span>
                </div>
                <div className="flex items-center justify-between bg-secondary/10 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-secondary uppercase line-clamp-1">Citations</p>
                  <span className="text-sm font-black text-secondary">{totalCitations}</span>
                </div>
                <div className="flex items-center justify-between bg-accent/10 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-accent uppercase line-clamp-1">Clics</p>
                  <span className="text-sm font-black text-accent">{totalClicks}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. CTA UPLOADER ─── */}
        <section className="px-6">
          <Link href="/upload" className="w-full block rounded-2xl bg-linear-to-r from-secondary to-[#FFBA00] p-[2px] shadow-lg shadow-orange-900/5 overflow-hidden transform transition active:scale-[0.98] group">
            <div className="flex items-center justify-between bg-white/95 px-4 py-3.5 backdrop-blur-sm rounded-[14px] group-hover:bg-white/90 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-secondary to-[#D4A76A] p-2 rounded-xl shadow-inner text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-slate-800">Uploader un Mémoire</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Partagez vos connaissances</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-full p-1 group-hover:bg-orange-50 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-secondary" />
              </div>
            </div>
          </Link>
        </section>

        {/* ─── 4. MÉMOIRES (VOTRE ÉCOLE) — Horizontal Scroll ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-primary">Mémoires {profile?.school ? `(${profile.school})` : "(Votre École)"}</h2>
            </div>
            <Link href="/library" className="text-[10px] font-bold text-accent hover:text-primary transition-colors uppercase">Tout voir</Link>
          </div>

          <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-6 no-scrollbar pb-4 pt-1">
            {documents.length === 0 ? (
              <div className="snap-center min-w-[160px] w-[160px] shrink-0 flex flex-col rounded-2xl bg-white border border-slate-100 card-shadow p-5 items-center justify-center text-center h-[180px]">
                <BookText className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Aucun mémoire disponible</p>
              </div>
            ) : (
              documents.map((doc, i) => (
                <Link key={doc.id} href={`/document/${doc.id}`} className="snap-center min-w-[160px] w-[160px] shrink-0 flex flex-col rounded-2xl bg-white border border-slate-100 card-shadow overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className={`h-24 w-full bg-linear-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} relative overflow-hidden p-3 flex flex-col justify-between`}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <Sparkles className="absolute right-2 bottom-[-4px] w-12 h-12 text-white/20 transform rotate-12" />
                    <div className="self-end rounded-md bg-black/20 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-white uppercase relative z-10 border border-white/10">
                      {doc.promo_year}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight h-8 group-hover:text-primary transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Par {doc.author_name || "Anonyme"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* ─── 5. ON A BESOIN DE TOI — Horizontal Scroll ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              <h2 className="text-base font-bold text-primary">On a besoin de toi</h2>
            </div>
            <Link href="/nexus" className="text-[10px] font-bold text-accent hover:text-primary transition-colors uppercase">Communauté</Link>
          </div>

          <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-6 no-scrollbar pb-4 pt-1">
            {announcements.length === 0 ? (
              <div className="snap-center min-w-[240px] w-[240px] shrink-0 flex flex-col rounded-2xl bg-white p-5 border border-slate-100 card-shadow items-center justify-center text-center h-[140px]">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Aucune annonce</p>
              </div>
            ) : (
              announcements.map((ann) => {
                const colors = NEXUS_COLORS[ann.collab_type || "projet"] || NEXUS_COLORS.projet;
                const timeAgo = getTimeAgo(ann.created_at);
                return (
                  <Link key={ann.id} href={`/nexus/${ann.id}`} className={`snap-center min-w-[240px] w-[240px] shrink-0 flex flex-col rounded-2xl bg-white p-5 border-l-[6px] ${colors.border} card-shadow border-y border-r border-slate-50 relative overflow-hidden`}>
                    <div className={`absolute right-0 top-0 size-20 ${colors.bubble} rounded-bl-full pointer-events-none`} />
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text} uppercase border border-current/10`}>
                        {ann.collab_type || "projet"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">{timeAgo}</span>
                    </div>
                    <h3 className="text-sm font-bold text-primary mb-2">{ann.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ann.description}</p>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* ─── 6. RÉCENT — Horizontal Scroll ─── */}
        <section className="space-y-3 px-6 pb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-primary">Récent</h2>
          </div>

          <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto -mx-6 px-6 no-scrollbar pb-4 pt-1">
            {activities.length === 0 ? (
              <div className="snap-center min-w-[280px] w-[280px] shrink-0 flex flex-col rounded-2xl bg-white p-5 border border-slate-100 card-shadow items-center justify-center text-center h-[160px]">
                <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Aucune activité récente</p>
              </div>
            ) : (
              activities.map((activity) => {
                const activityConfig = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.lecture;
                return (
                  <div key={activity.id} className="snap-center min-w-[280px] w-[280px] shrink-0 flex flex-col rounded-2xl bg-white p-5 border border-slate-100 card-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 ${activityConfig.iconBg} rounded-lg`}>
                          {activityConfig.icon}
                        </div>
                        <span className={`text-[10px] font-bold ${activityConfig.labelColor} uppercase`}>{activityConfig.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{getTimeAgo(activity.created_at)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{activity.title}</h3>
                    <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{activity.preview}</p>
                    <button className={`w-full rounded-xl ${activityConfig.btnBg} py-2.5 text-[11px] font-bold ${activityConfig.btnText} flex items-center justify-center gap-1 ${activityConfig.btnHover} transition-colors`}>
                      {activityConfig.btnLabel} {activityConfig.btnIcon}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

const ACTIVITY_STYLES: Record<string, {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  labelColor: string;
  btnBg: string;
  btnText: string;
  btnHover: string;
  btnLabel: string;
  btnIcon: React.ReactNode;
}> = {
  chat: {
    icon: <Sparkles className="w-[18px] h-[18px] text-accent" />,
    iconBg: "bg-accent/10",
    label: "IA Chat",
    labelColor: "text-accent",
    btnBg: "bg-[#F1F4F1]",
    btnText: "text-primary",
    btnHover: "hover:bg-accent hover:text-white",
    btnLabel: "Reprendre",
    btnIcon: <Play className="w-3.5 h-3.5" />,
  },
  nexus: {
    icon: <MessageSquare className="w-[18px] h-[18px] text-secondary" />,
    iconBg: "bg-secondary/10",
    label: "Nexus",
    labelColor: "text-secondary",
    btnBg: "bg-secondary/10",
    btnText: "text-secondary",
    btnHover: "hover:bg-secondary hover:text-white",
    btnLabel: "Voir",
    btnIcon: <Eye className="w-3.5 h-3.5" />,
  },
  lecture: {
    icon: <BookOpen className="w-[18px] h-[18px] text-slate-500" />,
    iconBg: "bg-slate-100",
    label: "Lecture",
    labelColor: "text-slate-500",
    btnBg: "bg-slate-100",
    btnText: "text-slate-600",
    btnHover: "hover:bg-slate-200",
    btnLabel: "Continuer",
    btnIcon: <ArrowRight className="w-3.5 h-3.5" />,
  },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `${diffMin}min`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD === 1) return "Hier";
  if (diffD < 7) return `${diffD}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
