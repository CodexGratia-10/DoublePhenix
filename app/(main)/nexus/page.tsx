"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  PlusCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  Building2,
  Briefcase,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { getAnnouncements } from "@/lib/api/announcements";
import type { Announcement } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Universités & Écoles (même source que Library)
// ═══════════════════════════════════════════
const UNIVERSITIES: { name: string; short: string; schools: string[] }[] = [
  {
    name: "Université d'Abomey-Calavi",
    short: "UAC",
    schools: ["IFRI", "FAST", "FSS", "FSA", "FASEG", "FADESP", "FLASH", "EPAC", "ENAM", "FSH", "INJEPS", "IMSP", "IRSP", "ENEAM", "INE", "ESP"],
  },
  {
    name: "Université de Parakou",
    short: "UP",
    schools: ["FA", "FM", "FDSE", "FLSH", "IUT", "ENSI", "FASHS", "FaSG"],
  },
  {
    name: "UNSTIM",
    short: "UNSTIM",
    schools: ["ENSTA", "ENSI-F", "ENSTIC", "IUT-L", "ENSA", "ENSPM"],
  },
  {
    name: "Université Nationale d'Agriculture",
    short: "UNA",
    schools: ["FA-Kétou", "FA-Sakété", "EPAC-A", "LAMS"],
  },
  { name: "UCAO", short: "UCAO", schools: ["ISM", "ISDA", "ISS-Cotonou"] },
  { name: "Institut Cerco", short: "CERCO", schools: ["Informatique", "Télécoms", "Gestion"] },
  { name: "Pigier Bénin", short: "PIGIER", schools: ["Gestion", "Informatique", "Commerce"] },
  { name: "ESTEM Bénin", short: "ESTEM", schools: ["Ingénierie", "Sciences de Gestion"] },
  { name: "HECI Bénin", short: "HECI", schools: ["Gestion", "Marketing", "Finance"] },
  { name: "ISM Adonaï", short: "ISM-A", schools: ["Management", "Comptabilité"] },
];

// Types de missions
const MISSION_TYPES: { value: string; label: string; color: string }[] = [
  { value: "projet", label: "Projet", color: "bg-blue-100 text-blue-700" },
  { value: "debat", label: "Débat", color: "bg-purple-100 text-purple-700" },
  { value: "event", label: "Événement", color: "bg-pink-100 text-pink-700" },
  { value: "offre", label: "Offre", color: "bg-green-100 text-green-700" },
  { value: "éducatif", label: "Éducatif", color: "bg-yellow-100 text-yellow-700" },
  { value: "freelance", label: "Freelance", color: "bg-orange-100 text-orange-700" },
  { value: "pro", label: "Pro", color: "bg-red-100 text-red-700" },
];

// Badge colors for school chips
const SCHOOL_COLORS: Record<string, string> = {
  FSS: "bg-blue-50 text-blue-600 border-blue-200",
  IFRI: "bg-purple-50 text-purple-600 border-purple-200",
  ENEAM: "bg-green-50 text-green-600 border-green-200",
  FSA: "bg-orange-50 text-orange-600 border-orange-200",
  FAST: "bg-teal-50 text-teal-600 border-teal-200",
  EPAC: "bg-rose-50 text-rose-600 border-rose-200",
  FLASH: "bg-cyan-50 text-cyan-600 border-cyan-200",
  FASEG: "bg-amber-50 text-amber-600 border-amber-200",
};

const PAGE_SIZE = 10;

// ═══════════════════════════════════════════
// Page Nexus — Marché des compétences
// ═══════════════════════════════════════════
export default function NexusPage() {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter selections
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // University accordion
  const [expandedUni, setExpandedUni] = useState<string | null>(null);

  // Data
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(0);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Has active filters
  const hasFilters = !!selectedSchool || !!selectedType || !!dateFrom || !!dateTo;

  // ─── Load initial data ───
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, count } = await getAnnouncements({
        page: 0,
        pageSize: PAGE_SIZE,
        school: selectedSchool || undefined,
        collab_type: selectedType || undefined,
        search: searchQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setAnnouncements(data);
      setTotalCount(count);
      setPage(0);
    } catch (err) {
      console.error("[Nexus] Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reload when filters change ───
  useEffect(() => {
    if (!isLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchool, selectedType, dateFrom, dateTo]);

  // ─── Debounced search ───
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadData();
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ─── Infinite scroll ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && announcements.length < totalCount) {
          loadNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, announcements.length, totalCount]);

  const loadNextPage = async () => {
    setIsFetching(true);
    const nextPage = page + 1;
    try {
      const { data } = await getAnnouncements({
        page: nextPage,
        pageSize: PAGE_SIZE,
        school: selectedSchool || undefined,
        collab_type: selectedType || undefined,
        search: searchQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setAnnouncements((prev) => [...prev, ...data]);
      setPage(nextPage);
    } catch (err) {
      console.error("[Nexus] Erreur next page:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // ─── Select school from filter ───
  const handleSelectSchool = (school: string) => {
    setSelectedSchool(school);
    setIsFilterOpen(false);
  };

  // ─── Clear all filters ───
  const clearFilters = () => {
    setSelectedSchool(null);
    setSelectedUniversity(null);
    setSelectedType(null);
    setDateFrom("");
    setDateTo("");
    setExpandedUni(null);
    setIsFilterOpen(false);
  };

  // ─── Get type info ───
  const getTypeInfo = (type: string) => {
    return MISSION_TYPES.find((t) => t.value === type) || { label: type, color: "bg-gray-100 text-gray-600" };
  };

  // ─── Relative time ───
  const formatRelTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#F9F9F7] pb-28 selection:bg-secondary/20">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 bg-[#F9F9F7]/95 backdrop-blur-sm px-6 py-5 border-b border-accent/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary font-display">Nexus</h1>
            <p className="text-[11px] text-accent/60 font-medium font-body">Marché des compétences</p>
          </div>
          <Link
            href="/profile/me"
            className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center border border-accent/10"
          >
            <GraduationCap className="w-4 h-4 text-primary" />
          </Link>
        </div>

        {/* Search bar with filter icon inside (like Library) */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-secondary group-focus-within:text-secondary/80 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un projet..."
            className="block w-full rounded-2xl border border-accent/10 bg-white py-4 pl-12 pr-12 text-primary shadow-sm placeholder:text-accent/60 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all font-body outline-none"
          />
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isFilterOpen ? "text-secondary" : "text-accent hover:text-secondary"}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* "Publier annonce" — text-only, no background */}
        <Link
          href="/nexus/create"
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-secondary/40 text-secondary text-sm font-bold font-body hover:border-secondary hover:bg-secondary/5 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Publier annonce
        </Link>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {selectedSchool && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                <GraduationCap className="w-3.5 h-3.5" />
                {selectedSchool}{selectedUniversity ? ` (${selectedUniversity})` : ""}
                <button onClick={() => { setSelectedSchool(null); setSelectedUniversity(null); }} className="ml-0.5 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {selectedType && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeInfo(selectedType).color}`}>
                {getTypeInfo(selectedType).label}
                <button onClick={() => setSelectedType(null)} className="ml-0.5 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {(dateFrom || dateTo) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <Calendar className="w-3 h-3" />
                {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom || `→ ${dateTo}`}
                <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="ml-0.5 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ═══ FILTER PANEL ═══ */}
      {isFilterOpen && (
        <div className="px-6 pb-4 animate-fade-in-up z-20 relative" style={{ animationDuration: "200ms" }}>
          <div className="rounded-2xl bg-white border border-accent/10 shadow-lg overflow-hidden max-h-[65vh] overflow-y-auto no-scrollbar">

            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-primary">Filtres de recherche</h3>
              </div>
              <button onClick={clearFilters} className="text-[10px] font-bold text-secondary uppercase tracking-wider hover:text-secondary/70 transition-colors">
                Réinitialiser
              </button>
            </div>

            {/* ─── TYPE DE MISSION ─── */}
            <div className="px-5 py-4 border-b border-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Type de mission</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    !selectedType ? "bg-primary text-white shadow-sm" : "bg-[#F1F4F1] text-primary border border-accent/10"
                  }`}
                >
                  Tout
                </button>
                {MISSION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(selectedType === type.value ? null : type.value)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      selectedType === type.value
                        ? `${type.color} shadow-sm border`
                        : "bg-[#F1F4F1] text-primary border border-accent/10 hover:border-primary/30"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── DATE RANGE ─── */}
            <div className="px-5 py-4 border-b border-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Période</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-accent/60 mb-1 block">Du</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                    className="w-full rounded-lg border border-accent/10 bg-[#F9F9F7] px-3 py-2.5 text-xs font-semibold text-primary outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20"
                  />
                </div>
                <div className="mt-5 text-accent/30 font-bold text-xs">→</div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-accent/60 mb-1 block">Au</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                    className="w-full rounded-lg border border-accent/10 bg-[#F9F9F7] px-3 py-2.5 text-xs font-semibold text-primary outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20"
                  />
                </div>
              </div>
              {/* Quick date presets */}
              <div className="flex gap-2 mt-3">
                {[
                  { label: "7 derniers jours", days: 7 },
                  { label: "30 jours", days: 30 },
                  { label: "3 mois", days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => {
                      const to = new Date();
                      const from = new Date(to.getTime() - preset.days * 86400000);
                      setDateFrom(from.toISOString().split("T")[0]);
                      setDateTo(to.toISOString().split("T")[0]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#F1F4F1] text-primary border border-accent/10 hover:border-secondary/30 hover:text-secondary transition-all active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── ÉCOLES & UNIVERSITÉS ─── */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">École</h4>
              </div>
            </div>
            <div className="divide-y divide-accent/5">
              {UNIVERSITIES.map((uni) => (
                <div key={uni.short}>
                  <button
                    onClick={() => setExpandedUni(expandedUni === uni.short ? null : uni.short)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#F9F9F7] transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-primary">{uni.short}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-primary">{uni.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-accent/40 transition-transform duration-200 shrink-0 ${expandedUni === uni.short ? "rotate-180" : ""}`} />
                  </button>
                  {expandedUni === uni.short && (
                    <div className="bg-[#F9F9F7]/50 px-5 pb-3 pt-1">
                      <div className="flex flex-wrap gap-2">
                        {uni.schools.map((school) => (
                          <button
                            key={school}
                            onClick={() => {
                              setSelectedUniversity(uni.short);
                              handleSelectSchool(school);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                              selectedSchool === school
                                ? "bg-secondary text-white shadow-sm"
                                : "bg-white text-primary border border-accent/10 hover:border-secondary/30"
                            }`}
                          >
                            {school}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Apply button */}
            <div className="sticky bottom-0 bg-white p-4 border-t border-accent/10">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-sm shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANNONCES FEED ═══ */}
      <main className="px-6 pt-4 space-y-3">

        {/* Result count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-accent/60 font-medium">
              {totalCount} annonce{totalCount !== 1 ? "s" : ""}{hasFilters ? " trouvée" + (totalCount !== 1 ? "s" : "") : ""}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors">
                Tout afficher
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-accent/5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="w-12 h-5 bg-slate-100 rounded-full" />
                  <div className="w-16 h-5 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-50 rounded w-full mb-1" />
                <div className="h-3 bg-slate-50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-primary/30" />
            </div>
            <h3 className="text-base font-bold text-primary">Aucune annonce</h3>
            <p className="text-xs text-accent/60 max-w-[220px]">
              {hasFilters ? "Aucune annonce ne correspond à vos filtres." : "Soyez le premier à publier !"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {announcements.map((annonce) => {
              const typeInfo = getTypeInfo(annonce.collab_type || "");
              const schoolColor = SCHOOL_COLORS[annonce.target_school] || "bg-slate-50 text-slate-600 border-slate-200";
              return (
                <Link
                  key={annonce.id}
                  href={`/nexus/${annonce.id}`}
                  className="block bg-white rounded-2xl p-5 border border-accent/5 shadow-sm hover:shadow-md hover:border-accent/15 transition-all active:scale-[0.99]"
                >
                  {/* Top row: school + type + time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${schoolColor}`}>
                        {annonce.target_school}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent/40 font-medium">{formatRelTime(annonce.created_at)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-primary mb-2 leading-snug">{annonce.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-accent/60 leading-relaxed line-clamp-2 mb-3">{annonce.description}</p>

                  {/* Tags */}
                  {annonce.tags && annonce.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {annonce.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-[#F1F4F1] text-primary/70 px-2.5 py-0.5 rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-secondary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      voir les détails
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="py-6 flex items-center justify-center">
              {isFetching && <Loader2 className="w-6 h-6 text-secondary animate-spin" />}
              {!isFetching && announcements.length >= totalCount && announcements.length > 0 && (
                <p className="text-xs text-accent/40">Fin des annonces</p>
              )}
            </div>
          </>
        )}
      </main>

    </div>
  );
}
