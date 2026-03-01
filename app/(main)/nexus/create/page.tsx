"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  Eye,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createAnnouncement } from "@/lib/api/announcements";

// ═══════════════════════════════════════════
// Universités & Écoles (même source)
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

// Types de collaboration
const COLLAB_TYPES = [
  { value: "éducatif", label: "Éducatif" },
  { value: "freelance", label: "Freelance" },
  { value: "pro", label: "Pro" },
];

// ═══════════════════════════════════════════
// Page Création Annonce — /nexus/create
// ═══════════════════════════════════════════
export default function CreateAnnouncementPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [collabType, setCollabType] = useState("");
  const [tags, setTags] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState(false);
  const [contactLinkedin, setContactLinkedin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // School selector state
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [expandedUni, setExpandedUni] = useState<string | null>(null);

  // Filter universities by search
  const filteredUnis = UNIVERSITIES.filter(
    (uni) =>
      !schoolSearch ||
      uni.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      uni.short.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      uni.schools.some((s) => s.toLowerCase().includes(schoolSearch.toLowerCase()))
  );

  // ─── Submit to Supabase ───
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !selectedSchool) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const result = await createAnnouncement({
        title: title.trim(),
        description: description.trim(),
        target_school: selectedSchool,
        collab_type: collabType || "projet",
        tags: tagArray,
        contact_whatsapp: contactWhatsapp,
        contact_linkedin: contactLinkedin,
      });

      if (result) {
        toast.success("Annonce publiée avec succès !");
        router.push("/nexus");
      } else {
        toast.error("Erreur lors de la publication.");
      }
    } catch {
      toast.error("Erreur réseau. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Preview mode ───
  const handlePreview = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Remplissez au moins le titre et la description pour l'aperçu.");
      return;
    }
    setIsPreview(true);
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden selection:bg-secondary/20">

      {/* ─── HERO HEADER ─── */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-[#F9F9F7] relative z-10">
        {/* Back button */}
        <div className="absolute left-4 top-10">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Animated logo */}
        <div className="h-24 w-24 mb-2 flex items-center justify-center" style={{ perspective: "1000px" }}>
          <div className="w-full h-full flex items-center justify-center relative animate-float">
            <div className="absolute inset-0 bg-secondary/30 rounded-full blur-2xl" />
            <Image
              src="/logo.jpeg"
              alt="PHENIX Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain drop-shadow-xl relative z-10 rounded-full"
            />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-primary mt-2 font-display">
          Créer une Annonce
        </h1>
        <p className="text-sm text-accent font-medium font-body">Nouvelle collaboration Nexus</p>
      </div>

      {/* ─── FORM ─── */}
      <div className="flex-1 overflow-y-auto px-6 pb-44 no-scrollbar">

        {!isPreview ? (
          <>
            {/* Section title */}
            <div className="mt-6 mb-6">
              <h2 className="text-lg font-semibold text-primary border-l-4 border-secondary pl-3 font-display">
                Détails du projet
              </h2>
            </div>

            <div className="space-y-6">

              {/* Titre */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-accent ml-1 group-focus-within:text-secondary transition-colors font-body">
                  Titre de l&apos;annonce
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Recherche développeur pour projet Alpha"
                  className="w-full rounded-2xl border border-accent/30 bg-white px-4 py-4 text-primary placeholder-accent/50 focus:border-secondary focus:ring-1 focus:ring-secondary shadow-sm transition-all font-body outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-accent ml-1 group-focus-within:text-secondary transition-colors font-body">
                  Description détaillée
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre besoin, les compétences recherchées, le contexte du projet..."
                  rows={5}
                  className="w-full rounded-2xl border border-accent/30 bg-white px-4 py-4 text-primary placeholder-accent/50 focus:border-secondary focus:ring-1 focus:ring-secondary shadow-sm resize-none transition-all font-body outline-none"
                />
              </div>

              {/* École Cible — Custom picker */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-accent ml-1 group-focus-within:text-secondary transition-colors font-body">
                  École Cible
                </label>
                <button
                  type="button"
                  onClick={() => setShowSchoolPicker(!showSchoolPicker)}
                  className={`w-full rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition-all flex items-center justify-between font-body outline-none ${
                    showSchoolPicker ? "border-secondary ring-1 ring-secondary" : "border-accent/30"
                  }`}
                >
                  <span className={selectedSchool ? "text-primary font-medium" : "text-accent/50"}>
                    {selectedSchool || "Sélectionner une école"}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-accent/50 transition-transform ${showSchoolPicker ? "rotate-180" : ""}`} />
                </button>

                {/* School picker dropdown */}
                {showSchoolPicker && (
                  <div className="rounded-2xl bg-white border border-accent/10 shadow-lg overflow-hidden max-h-[40vh] overflow-y-auto no-scrollbar mt-1 animate-fade-in">
                    {/* Search */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-3 border-b border-accent/10">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F1F4F1]">
                        <Search className="w-4 h-4 text-accent/40" />
                        <input
                          type="text"
                          value={schoolSearch}
                          onChange={(e) => setSchoolSearch(e.target.value)}
                          placeholder="Rechercher..."
                          className="bg-transparent text-sm outline-none text-primary placeholder-accent/40 flex-1 font-body"
                        />
                      </div>
                    </div>

                    {/* Universities accordion */}
                    <div className="divide-y divide-accent/5">
                      {filteredUnis.map((uni) => (
                        <div key={uni.short}>
                          <button
                            type="button"
                            onClick={() => setExpandedUni(expandedUni === uni.short ? null : uni.short)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F7] transition-colors"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-black text-primary">{uni.short}</span>
                              </div>
                              <span className="text-xs font-semibold text-primary">{uni.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-accent/40 transition-transform ${expandedUni === uni.short ? "rotate-180" : ""}`} />
                          </button>
                          {expandedUni === uni.short && (
                            <div className="bg-[#F9F9F7]/50 px-4 pb-3 pt-1">
                              <div className="flex flex-wrap gap-2">
                                {uni.schools.map((school) => (
                                  <button
                                    key={school}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSchool(school);
                                      setShowSchoolPicker(false);
                                      setSchoolSearch("");
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
                  </div>
                )}
              </div>

              {/* Type de Collaboration */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-accent ml-1 group-focus-within:text-secondary transition-colors font-body">
                  Type de Collaboration (optionnel)
                </label>
                <div className="relative">
                  <select
                    value={collabType}
                    onChange={(e) => setCollabType(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-accent/30 bg-white px-4 py-4 pr-10 text-primary focus:border-secondary focus:ring-1 focus:ring-secondary shadow-sm transition-all font-body outline-none"
                  >
                    <option value="" disabled className="text-accent/50">Sélectionner un type</option>
                    {COLLAB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent/50 group-focus-within:text-secondary transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Tags (optional) */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium text-accent ml-1 group-focus-within:text-secondary transition-colors font-body">
                  Tags <span className="text-accent/40 text-xs">(optionnel, séparés par des virgules)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: React, Mobile, Santé"
                  className="w-full rounded-2xl border border-accent/30 bg-white px-4 py-4 text-primary placeholder-accent/50 focus:border-secondary focus:ring-1 focus:ring-secondary shadow-sm transition-all font-body outline-none"
                />
              </div>
            </div>
          </>
        ) : (
          /* ═══ PREVIEW MODE ═══ */
          <div className="mt-6 space-y-5">
            <h2 className="text-lg font-semibold text-primary border-l-4 border-secondary pl-3 font-display">
              Aperçu de l&apos;annonce
            </h2>

            <div className="bg-white rounded-2xl p-5 border border-accent/5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  {selectedSchool}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {COLLAB_TYPES.find((t) => t.value === collabType)?.label || collabType}
                </span>
                <span className="text-[10px] text-accent/40 ml-auto">À l&apos;instant</span>
              </div>
              <h3 className="font-bold text-sm text-primary mb-2 font-display">{title}</h3>
              <p className="text-xs text-accent/60 leading-relaxed font-body">{description}</p>
              {tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="text-[10px] bg-[#F1F4F1] text-primary/70 px-2.5 py-0.5 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ CONTACT OPTIONS ═══ */}
      <div className="px-6 mt-6">
        <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">Moyens de contact</p>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 bg-white rounded-xl p-3 border border-primary/5 cursor-pointer hover:border-primary/20 transition-all">
            <input type="checkbox" checked={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.checked)} className="w-4 h-4 accent-[#25D366] rounded" />
            <span className="text-sm font-medium text-primary">Partager mon WhatsApp</span>
          </label>
          <label className="flex items-center gap-3 bg-white rounded-xl p-3 border border-primary/5 cursor-pointer hover:border-primary/20 transition-all">
            <input type="checkbox" checked={contactLinkedin} onChange={(e) => setContactLinkedin(e.target.checked)} className="w-4 h-4 accent-[#0A66C2] rounded" />
            <span className="text-sm font-medium text-primary">Partager mon LinkedIn</span>
          </label>
        </div>
      </div>

      {/* ─── STICKY BOTTOM BAR ─── */}
      <div className="fixed bottom-[64px] left-0 w-full px-6 py-4 bg-[#F9F9F7]/95 backdrop-blur-md border-t border-accent/10 flex gap-4 z-20">
        {!isPreview ? (
          <>
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 rounded-2xl border-2 border-secondary text-secondary bg-transparent px-4 py-3.5 text-sm font-bold hover:bg-secondary/5 transition-colors active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[1.5] rounded-2xl bg-gradient-to-br from-primary to-[#0f4d3c] px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-body disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Publier
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className="flex-1 rounded-2xl border-2 border-accent/30 text-primary bg-transparent px-4 py-3.5 text-sm font-bold hover:bg-primary/5 transition-colors active:scale-95 font-body"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[1.5] rounded-2xl bg-gradient-to-br from-primary to-[#0f4d3c] px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-body disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Publier
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}