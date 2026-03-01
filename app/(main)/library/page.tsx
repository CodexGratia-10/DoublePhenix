"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, User, Calendar, ArrowRight, BadgeCheck, Star, Plus, Loader2, X, ChevronDown, GraduationCap, Building2, Upload } from "lucide-react";

// API Supabase
import { getDocuments, getUserBookmarks, toggleBookmark } from "@/lib/api/documents";
import type { Document } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Universités & Écoles/Facultés du Bénin
// ═══════════════════════════════════════════
const UNIVERSITIES: { name: string; short: string; schools: string[] }[] = [
  {
    name: "Université d'Abomey-Calavi",
    short: "UAC",
    schools: [
      "IFRI", "FAST", "FSS", "FSA", "FASEG", "FADESP", "FLASH", "EPAC", "ENAM",
      "FSH", "INJEPS", "IMSP", "IRSP", "ENEAM", "INE", "ESP",
    ],
  },
  {
    name: "Université de Parakou",
    short: "UP",
    schools: [
      "FA", "FM", "FDSE", "FLSH", "IUT", "ENSI", "FASHS", "FaSG",
    ],
  },
  {
    name: "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques",
    short: "UNSTIM",
    schools: [
      "ENSTA", "ENSI-F", "ENSTIC", "IUT-L", "ENSA", "ENSPM",
    ],
  },
  {
    name: "Université Nationale d'Agriculture",
    short: "UNA",
    schools: ["FA-Kétou", "FA-Sakété", "EPAC-A", "LAMS"],
  },
  {
    name: "Université de Lokossa (UNSTIM)",
    short: "UNSTIM-L",
    schools: ["ENSI-Lokossa", "IUT-Lokossa"],
  },
  {
    name: "Université Protestante de l'Afrique de l'Ouest",
    short: "UPAO",
    schools: ["Théologie", "Sciences Humaines"],
  },
  {
    name: "Université Catholique de l'Afrique de l'Ouest",
    short: "UCAO",
    schools: ["ISM", "ISDA", "ISS-Cotonou"],
  },
  {
    name: "Institut Cerco",
    short: "CERCO",
    schools: ["Informatique", "Télécoms", "Gestion"],
  },
  {
    name: "Pigier Bénin",
    short: "PIGIER",
    schools: ["Gestion", "Informatique", "Commerce"],
  },
  {
    name: "ESTEM Bénin",
    short: "ESTEM",
    schools: ["Ingénierie", "Sciences de Gestion"],
  },
  {
    name: "HECI Bénin",
    short: "HECI",
    schools: ["Gestion", "Marketing", "Finance"],
  },
  {
    name: "ISM Adonaï",
    short: "ISM-A",
    schools: ["Management", "Comptabilité"],
  },
];

// Années disponibles pour filtrage
const YEARS = Array.from({ length: 9 }, (_, i) => 2026 - i); // 2026..2018

// ═══════════════════════════════════════════
// Page Bibliothèque — Supabase-Connected
// ═══════════════════════════════════════════
export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Filter panel
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedUni, setExpandedUni] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Data from Supabase
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 6;

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Computed active filter for Supabase ───
  const activeSchoolFilter = selectedSchool || undefined;

  // ─── Load initial data ───
  useEffect(() => {
    loadInitialData();
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const { data, count } = await getDocuments({
        page: 0,
        pageSize: PAGE_SIZE,
        school: activeSchoolFilter,
        search: searchQuery,
        promo_year: selectedYear || undefined,
      });
      setDocuments(data);
      setTotalCount(count);
      setPage(0);
    } catch (err) {
      console.error("[Library] Erreur chargement:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookmarks = async () => {
    const bks = await getUserBookmarks();
    setBookmarks(bks);
  };

  // ─── Reload when filter changes ───
  useEffect(() => {
    if (!isLoading) {
      reloadDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchool, selectedYear]);

  // ─── Debounced search ───
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (!isLoading) {
        reloadDocuments();
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const reloadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, count } = await getDocuments({
        page: 0,
        pageSize: PAGE_SIZE,
        school: selectedSchool || undefined,
        search: searchQuery,
        promo_year: selectedYear || undefined,
      });
      setDocuments(data);
      setTotalCount(count);
      setPage(0);
    } catch (err) {
      console.error("[Library] Erreur rechargement:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Infinite scroll ───
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetching || isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && documents.length < totalCount) {
            loadNextPage();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFetching, isLoading, documents.length, totalCount]
  );

  const loadNextPage = async () => {
    setIsFetching(true);
    const nextPage = page + 1;
    try {
      const { data } = await getDocuments({
        page: nextPage,
        pageSize: PAGE_SIZE,
        school: selectedSchool || undefined,
        search: searchQuery,
        promo_year: selectedYear || undefined,
      });
      setDocuments((prev) => [...prev, ...data]);
      setPage(nextPage);
    } catch (err) {
      console.error("[Library] Erreur pagination:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // ─── Toggle bookmark ───
  const handleBookmark = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowBookmarked = await toggleBookmark(docId);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, docId] : prev.filter((b) => b !== docId)
    );
  };

  // ─── Select from filter panel ───
  const handleSelectSchool = (school: string) => {
    setSelectedSchool(school);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedSchool(null);
    setSelectedUniversity(null);
    setSelectedYear(null);
    setExpandedUni(null);
    setIsFilterOpen(false);
  };

  // Active filter labels
  const hasActiveFilters = !!selectedSchool || !!selectedYear;

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#F9F9F7] pb-28 selection:bg-accent selection:text-white">

      {/* ─── HEADER STICKY ─── */}
      <header className="sticky top-0 z-20 bg-[#F9F9F7]/95 backdrop-blur-sm px-6 py-5 flex items-center justify-between border-b border-accent/10 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary font-display">
          Bibliothèque
        </h1>
        <Link href="/upload" className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-secondary/90 shadow-sm transition-all active:scale-95 group">
          <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">Uploader</span>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 scroll-smooth">

        {/* ─── BARRE DE RECHERCHE ─── */}
        <div className="px-6 pt-6 pb-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-secondary group-focus-within:text-secondary/80 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un sujet, un auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-2xl border border-accent/10 bg-white py-4 pl-12 pr-12 text-primary shadow-sm placeholder:text-accent/60 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all font-body outline-none"
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isFilterOpen ? "text-secondary" : "text-accent hover:text-secondary"}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Active filter chips ─── */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {selectedSchool && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {selectedSchool}{selectedUniversity ? ` (${selectedUniversity})` : ""}
                  <button onClick={() => { setSelectedSchool(null); setSelectedUniversity(null); }} className="ml-1 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {selectedYear && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedYear}
                  <button onClick={() => setSelectedYear(null)} className="ml-1 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════
            PANEL FILTRES — Année + Universités & Écoles
            ═══════════════════════════════════════════ */}
        {isFilterOpen && (
          <div className="px-6 pb-4 animate-fade-in-up" style={{ animationDuration: "200ms" }}>
            <div className="rounded-2xl bg-white border border-accent/10 shadow-lg overflow-hidden max-h-[65vh] overflow-y-auto no-scrollbar">

              {/* Header du panel */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-accent/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-primary">Filtres</h3>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-secondary uppercase tracking-wider hover:text-secondary/70 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>

              {/* ─── FILTRE ANNÉE (scroll horizontal) ─── */}
              <div className="px-5 py-4 border-b border-accent/10">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Année</h4>
                </div>
                <div className="overflow-x-auto no-scrollbar flex gap-2 snap-x pb-1">
                  {YEARS.map((year) => {
                    const isActive = selectedYear === year;
                    return (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(isActive ? null : year)}
                        className={`snap-start shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "bg-[#F1F4F1] text-primary border border-accent/10 hover:border-primary/30"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── UNIVERSITÉS & ÉCOLES ─── */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Universités & Écoles</h4>
                </div>
              </div>
              <div className="divide-y divide-accent/5">
                {UNIVERSITIES.map((uni) => (
                  <div key={uni.short}>
                    {/* Université header */}
                    <button
                      onClick={() => setExpandedUni(expandedUni === uni.short ? null : uni.short)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F9F9F7] transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-primary">{uni.short}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-primary block leading-tight">{uni.name}</span>
                          <span className="text-[10px] text-accent/60 font-medium">{uni.schools.length} écoles/facultés</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-accent/40 transition-transform duration-200 ${expandedUni === uni.short ? "rotate-180" : ""}`} />
                    </button>

                    {/* Schools/Faculties list */}
                    {expandedUni === uni.short && (
                      <div className="bg-[#F9F9F7]/50 px-5 pb-3 pt-1">
                        <div className="flex flex-wrap gap-2">
                          {uni.schools.map((school) => {
                            const isSelected = selectedSchool === school;
                            return (
                              <button
                                key={school}
                                onClick={() => {
                                  setSelectedUniversity(uni.short);
                                  handleSelectSchool(school);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                                  isSelected
                                    ? "bg-secondary text-white shadow-sm"
                                    : "bg-white text-primary border border-accent/10 hover:border-secondary/30 hover:text-secondary"
                                }`}
                              >
                                {school}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TITRE SECTION ─── */}
        <div className="px-6 flex items-center justify-between mb-4 pt-2">
          <h2 className="text-lg md:text-xl font-bold text-primary font-display">Documents Récents</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              Tout afficher
            </button>
          )}
        </div>

        {/* ─── LOADING STATE ─── */}
        {isLoading ? (
          <div className="px-6 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-accent/10 animate-pulse">
                <div className="h-4 w-28 bg-slate-200 rounded-full mb-4" />
                <div className="h-5 w-full bg-slate-200 rounded mb-2" />
                <div className="h-5 w-3/4 bg-slate-100 rounded mb-4" />
                <div className="flex gap-3 mb-5">
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between">
                  <div className="flex gap-2">
                    <div className="h-6 w-14 bg-slate-100 rounded-md" />
                    <div className="h-6 w-16 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-9 w-9 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* ─── EMPTY STATE ─── */
          <div className="px-6 py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-accent/50" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">Aucun document trouvé</h3>
            <p className="text-sm text-accent/70">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : "Il n'y a pas encore de documents dans cette catégorie."}
            </p>
          </div>
        ) : (
          /* ─── DOCUMENT CARDS ─── */
          <div className="px-6 flex flex-col gap-6">
            {documents.map((doc, index) => {
              const isBookmarked = bookmarks.includes(doc.id);
              const delay = `${index * 60}ms`;

              // ═══ Style Premium (Lauréat) — Fond Forest ═══
              if (doc.view_count > 50) {
                return (
                  <Link
                    key={doc.id}
                    href={`/document/${doc.id}`}
                    className="group relative flex flex-col bg-primary rounded-2xl p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: delay, animationFillMode: "both" }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-white text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        <Star className="w-3 h-3" />
                        {"POPULAIRE"}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display leading-tight mb-2">
                      {doc.title}
                    </h3>

                    {doc.abstract && (
                      <p className="text-white/80 text-sm mb-5 font-light leading-relaxed">
                        {doc.abstract}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90">
                          {doc.school}
                        </span>
                        {doc.keywords && doc.keywords.length > 0 && (
                          <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90">
                            {doc.keywords[0]}
                          </span>
                        )}
                      </div>
                      <div className="size-9 rounded-full bg-white flex items-center justify-center text-primary shadow-md hover:bg-gray-100 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              }

              // ═══ Style Standard (Certifié) — Fond Blanc ═══
              return (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-accent/10 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: delay, animationFillMode: "both" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E9] text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/20">
                      <BadgeCheck className="w-3 h-3" />
                      {doc.status === "APPROVED" ? "CERTIFIÉ PHENIX" : "EN ATTENTE"}
                    </div>
                    <button
                      onClick={(e) => handleBookmark(doc.id, e)}
                      className="text-accent/50 hover:text-secondary transition-colors"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-6 h-6 text-secondary" />
                      ) : (
                        <Bookmark className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-primary font-display leading-tight mb-3 group-hover:text-secondary transition-colors">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-accent mb-5">
                    {doc.author_name && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-[18px] h-[18px]" />
                        {doc.author_name}
                      </span>
                    )}
                    {doc.author_name && doc.promo_year && (
                      <span className="w-1 h-1 rounded-full bg-accent/40" />
                    )}
                    {doc.promo_year && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-[18px] h-[18px]" />
                        {doc.promo_year}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-accent/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#E8F0E9] text-xs font-semibold text-primary">
                        {doc.school}
                      </span>
                      {doc.keywords && doc.keywords.length > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-[#E8F0E9] text-xs font-semibold text-primary">
                          {doc.keywords[0]}
                        </span>
                      )}
                    </div>
                    <div className="size-9 rounded-full bg-secondary flex items-center justify-center text-white shadow-md hover:bg-secondary/90 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* ─── INFINITE SCROLL TARGET ─── */}
            {documents.length < totalCount && (
              <div ref={lastElementRef} className="flex justify-center py-6 w-full">
                {isFetching ? (
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                ) : (
                  <div className="h-4" />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── FAB (+) — Shine Effect ─── */}
      <Link
        href="/upload"
        className="fixed bottom-[85px] right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-transparent text-secondary hover:scale-110 active:scale-95 transition-all group"
      >
        {/* Shine ring */}
        <div className="absolute inset-0 rounded-full border-2 border-secondary/30 group-hover:border-secondary/60 transition-colors" />
        <div className="absolute inset-0 rounded-full animate-ping border border-secondary/20 group-hover:border-secondary/40" style={{ animationDuration: "2s" }} />

        {/* Subtle glow */}
        <div className="absolute inset-[-4px] rounded-full bg-secondary/5 blur-md group-hover:bg-secondary/10 transition-colors" />

        <Plus className="w-8 h-8 stroke-[2.5] relative z-10 drop-shadow-[0_0_8px_rgba(187,138,82,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(187,138,82,0.6)] transition-all" />
      </Link>
    </div>
  );
}