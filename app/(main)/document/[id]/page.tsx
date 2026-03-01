"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ZoomIn, ZoomOut, Quote, Mail, ChevronRight, Bookmark, BookmarkCheck, Share2, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// API Supabase
import { getDocumentById, toggleBookmark, getUserBookmarks } from "@/lib/api/documents";
import { getPublicProfile } from "@/lib/api/profiles";
import type { Document, Profile } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Page Viewer Document — /document/[id]
// ═══════════════════════════════════════════
export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  // State
  const [doc, setDoc] = useState<Document | null>(null);
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPage] = useState(1);
  const [totalPages] = useState(85); // Simulated — replace with real PDF page count
  const [zoom, setZoom] = useState(1);
  const [showCiteModal, setShowCiteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ─── Load document data ───
  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const [docData, bookmarks] = await Promise.all([
        getDocumentById(documentId),
        getUserBookmarks(),
      ]);

      if (docData) {
        setDoc(docData);
        setIsBookmarked(bookmarks.includes(docData.id));

        // Fetch author profile if user_id exists
        if (docData.user_id) {
          const profile = await getPublicProfile(docData.user_id);
          setAuthorProfile(profile);
        }
      }
    } catch (err) {
      console.error("[Viewer] Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Bookmark toggle ───
  const handleBookmark = async () => {
    if (!doc) return;
    const result = await toggleBookmark(doc.id);
    setIsBookmarked(result);
    toast.success(result ? "Ajouté aux favoris" : "Retiré des favoris");
  };

  // ─── Share ───
  const handleShare = async () => {
    if (!doc) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: doc.title,
          text: `Découvre ce mémoire sur PHENIX : ${doc.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papiers !");
      }
    } catch {
      // User cancelled share
    }
  };

  // ─── Generate citation ───
  const generateCitation = () => {
    if (!doc) return "";
    const author = doc.author_name || "Auteur inconnu";
    const year = doc.promo_year || "s.d.";
    const title = doc.title;
    const school = doc.school || "";
    return `${author} (${year}). ${title}. ${school}. Consulté sur PHENIX.`;
  };

  const copyCitation = async () => {
    const citation = generateCitation();
    await navigator.clipboard.writeText(citation);
    toast.success("Citation copiée !");
    setShowCiteModal(false);
  };

  // ─── Zoom controls ───
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));

  // ─── Watermark SVG ───
  const watermarkName = doc?.author_name || "Utilisateur PHENIX";
  const watermarkSVG = `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-weight='600' font-size='12' fill='rgba(196, 214, 208, 0.35)' transform='rotate(-45 150 150)' text-anchor='middle' dominant-baseline='middle'%3ELecture sur PHENIX - ${encodeURIComponent(watermarkName)}%3C/text%3E%3C/svg%3E")`;

  // ─── Loading state ───
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F9F9F7]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-sm text-accent font-medium">Chargement du document...</p>
        </div>
      </div>
    );
  }

  // ─── Not found state ───
  if (!doc) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F9F9F7] px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-primary">Document introuvable</h2>
          <p className="text-sm text-accent/70">Ce document n&apos;existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push("/library")}
            className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Retour à la bibliothèque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] antialiased selection:bg-secondary/20">

      {/* ─── HEADER STICKY ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#F9F9F7]/95 backdrop-blur-md px-4 py-3 border-b border-primary/10 h-16">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 px-4 text-center min-w-0">
          <h1 className="text-base font-semibold text-primary truncate tracking-tight">
            {doc.title.length > 35 ? `${doc.title.slice(0, 35)}...` : doc.title}
          </h1>
          <p className="text-[11px] text-primary/60 font-medium uppercase tracking-wide">
            {doc.author_name || "Auteur inconnu"} • {doc.promo_year}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBookmark}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-secondary" />
            ) : (
              <Bookmark className="w-5 h-5 text-primary" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors text-primary"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── DOCUMENT VIEWER ─── */}
      <main className="flex-1 relative w-full max-w-3xl mx-auto p-5 flex flex-col items-center justify-start gap-4 overflow-y-auto no-scrollbar pb-56">

        {/* Zoom controls */}
        <div className="flex items-center gap-2 self-end mb-1">
          <button onClick={handleZoomOut} className="w-8 h-8 rounded-full bg-white shadow-sm border border-primary/10 flex items-center justify-center hover:bg-slate-50 transition-colors text-primary">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-primary/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="w-8 h-8 rounded-full bg-white shadow-sm border border-primary/10 flex items-center justify-center hover:bg-slate-50 transition-colors text-primary">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* A4 Paper */}
        <div
          className="relative w-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-sm overflow-hidden aspect-[1/1.414] ring-1 ring-black/5 transition-transform duration-300 origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Document content */}
          <div className="absolute inset-0 p-8 flex flex-col gap-4 text-[10px] text-justify leading-relaxed text-stone-800 opacity-90 select-none">
            <div className="w-full h-full flex flex-col gap-5">
              <h2 className="text-xl font-bold text-primary mb-2">{doc.title}</h2>

              {doc.abstract ? (
                <p>{doc.abstract}</p>
              ) : (
                <>
                  <p>
                    Ce document académique a été déposé sur la plateforme PHENIX par {doc.author_name || "un auteur"} en {doc.promo_year}.
                    Il est rattaché à l&apos;établissement <strong>{doc.school}</strong>
                    {doc.keywords && doc.keywords.length > 0 ? ` dans le domaine « ${doc.keywords[0]} »` : ""}.
                  </p>
                  <p>
                    La consultation de ce mémoire est protégée par un filigrane numérique.
                    Pour accéder au document complet au format PDF, veuillez contacter l&apos;auteur directement
                    via le bouton &laquo; Contacter &raquo; ci-dessous.
                  </p>
                </>
              )}

              {/* Placeholder chart */}
              <div className="w-full h-28 bg-stone-50 rounded my-2 flex items-center justify-center border border-stone-100">
                <span className="text-xs text-primary/40 italic font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Aperçu du document
                </span>
              </div>

              {doc.file_path ? (
                <p className="text-[9px] text-accent/50 italic">
                  Document complet disponible en PDF — contactez l&apos;auteur ou utilisez le bouton &laquo; Citer &raquo; pour référencer ce travail.
                </p>
              ) : (
                <p className="text-[9px] text-accent/50 italic">
                  Aucun fichier PDF n&apos;a été rattaché à ce document pour le moment.
                </p>
              )}
            </div>
          </div>

          {/* Watermark overlay */}
          <div
            className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply"
            style={{ backgroundImage: watermarkSVG, backgroundRepeat: "repeat" }}
          />

          {/* Page indicator */}
          <div className="absolute bottom-4 right-4 bg-primary/90 text-white text-[10px] font-medium px-2.5 py-1 rounded backdrop-blur-sm z-30 shadow-sm">
            {currentPage} / {totalPages}
          </div>
        </div>

        {/* Stacked paper effect */}
        <div className="w-[94%] h-4 bg-white shadow-sm rounded-t-sm opacity-60 -mt-2 border-t border-l border-r border-black/5" />

        {/* ─── Document metadata ─── */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-primary/5 mt-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Informations</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-accent/60 font-medium block">École</span>
              <span className="text-sm font-semibold text-primary">{doc.school}</span>
            </div>
            <div>
              <span className="text-[10px] text-accent/60 font-medium block">Année</span>
              <span className="text-sm font-semibold text-primary">{doc.promo_year}</span>
            </div>
            {doc.keywords && doc.keywords.length > 0 && (
              <div>
                <span className="text-[10px] text-accent/60 font-medium block">Domaine</span>
                <span className="text-sm font-semibold text-primary">{doc.keywords[0]}</span>
              </div>
            )}
            {doc.level && (
              <div>
                <span className="text-[10px] text-accent/60 font-medium block">Niveau</span>
                <span className="text-sm font-semibold text-primary">{doc.level}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-accent/60 font-medium block">Statut</span>
              <span className={`text-sm font-semibold ${doc.status === "APPROVED" ? "text-green-600" : "text-secondary"}`}>
                {doc.status === "APPROVED" ? "Vérifié ✓" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FLOATING ACTION BAR ─── */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-6 flex flex-col items-center gap-4 pointer-events-none pb-4">

        {/* Author profile link */}
        <Link
          href={doc.user_id ? `/u/${doc.user_id}` : "#"}
          className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-sm px-4 py-2 rounded-full flex items-center gap-3 mb-2 border border-primary/5 transition-transform active:scale-95"
        >
          {authorProfile?.avatar_url ? (
            <Image
              alt={`Avatar de ${doc.author_name}`}
              src={authorProfile.avatar_url}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover border border-stone-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {(doc.author_name || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-primary/80">
            Voir le profil de {doc.author_name || "l'auteur"}
          </span>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-4 w-full max-w-sm pointer-events-auto">
          <button
            onClick={() => setShowCiteModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 active:scale-95 transition-all hover:brightness-110"
          >
            <Quote className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">Citer</span>
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all hover:bg-[#092e24]"
          >
            <Mail className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">Contacter</span>
          </button>
        </div>
      </div>

      {/* ═══ MODAL: Citer ═══ */}
      {showCiteModal && (
        <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCiteModal(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-primary mb-1">Référence bibliographique</h3>
            <p className="text-[10px] text-accent/60 mb-4">Format APA simplifié</p>
            <div className="bg-[#F1F4F1] rounded-xl p-4 mb-5 border border-accent/10">
              <p className="text-sm text-primary leading-relaxed font-medium">{generateCitation()}</p>
            </div>
            <button
              onClick={copyCitation}
              className="w-full py-3.5 rounded-xl bg-secondary text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Copier la citation
              <Quote className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Contacter ═══ */}
      {showContactModal && (
        <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-primary mb-1">Contacter l&apos;auteur</h3>
            <p className="text-xs text-accent/60 mb-5">
              Envoyez un message à {doc.author_name || "l'auteur"} à propos de ce mémoire.
            </p>

            <textarea
              placeholder="Votre message..."
              rows={4}
              className="w-full rounded-xl border border-accent/10 bg-[#F9F9F7] py-3 px-4 text-sm text-primary placeholder:text-accent/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 outline-none resize-none mb-4"
            />

            <button
              onClick={() => {
                toast.success("Message envoyé à l'auteur !");
                setShowContactModal(false);
              }}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#092e24] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Envoyer le message
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
