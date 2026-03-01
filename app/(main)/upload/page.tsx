"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudUpload, GraduationCap, Share2, Send, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

// API Supabase
import { uploadDocument } from "@/lib/api/documents";
import { createClient } from "@/lib/supabase/client";

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
    schools: ["FA", "FM", "FDSE", "FLSH", "IUT", "ENSI", "FASHS", "FaSG"],
  },
  {
    name: "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques",
    short: "UNSTIM",
    schools: ["ENSTA", "ENSI-F", "ENSTIC", "IUT-L", "ENSA", "ENSPM"],
  },
  {
    name: "Université Nationale d'Agriculture",
    short: "UNA",
    schools: ["FA-Kétou", "FA-Sakété", "EPAC-A", "LAMS"],
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

// ═══════════════════════════════════════════
// Page Upload — Supabase-Connected
// ═══════════════════════════════════════════
export default function UploadPage() {
  const router = useRouter();

  // University / School selection
  const [expandedUni, setExpandedUni] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [uniSearch, setUniSearch] = useState("");

  // Form state
  const [filiere, setFiliere] = useState("");
  const [theme, setTheme] = useState("");
  const [year, setYear] = useState("");
  const [author, setAuthor] = useState("");

  // Contact toggles
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedin, setLinkedin] = useState("");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);

  // CGU + Submitting
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered universities
  const filteredUniversities = uniSearch.trim()
    ? UNIVERSITIES.filter(
        (u) =>
          u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
          u.short.toLowerCase().includes(uniSearch.toLowerCase()) ||
          u.schools.some((s) => s.toLowerCase().includes(uniSearch.toLowerCase()))
      )
    : UNIVERSITIES;

  // ─── Handle school selection ───
  const handleSelectSchool = (uni: typeof UNIVERSITIES[number], school: string) => {
    setSelectedUniversity(`${uni.name} (${uni.short})`);
    setSelectedSchool(school);
    setExpandedUni(null);
    setUniSearch("");
  };

  // ─── Handle file ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 50 Mo");
      return;
    }
    setFile(selectedFile);
    setOcrDone(false);
    simulateOCR();
  };

  const simulateOCR = () => {
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setOcrDone(true);
        setIsUploading(false);
        toast.success("Analyse OCR terminée !");
      }
      setUploadProgress(Math.min(progress, 100));
    }, 300);
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) { toast.error("Veuillez saisir le thème du mémoire"); return; }
    if (!selectedSchool) { toast.error("Veuillez sélectionner votre école"); return; }
    if (!acceptedCGU) { toast.error("Veuillez accepter les conditions d'utilisation"); return; }

    setIsSubmitting(true);
    try {
      let fileUrl: string | undefined;
      if (file) {
        const supabase = createClient();
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from("documents")
          .upload(fileName, file, { contentType: "application/pdf" });

        if (storageError) {
          toast.error("Erreur lors du téléversement du fichier");
          setIsSubmitting(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(storageData.path);
        fileUrl = urlData.publicUrl;
      }

      const result = await uploadDocument({
        title: theme.trim(),
        author_name: author.trim() || "Anonyme",
        school: selectedSchool,
        promo_year: parseInt(year) || new Date().getFullYear(),
        level: filiere.trim() || "Général",
        file_path: fileUrl,
      });

      if (result) {
        toast.success("Mémoire publié avec succès !", {
          description: "Votre document est en attente de vérification.",
        });
        setTimeout(() => router.push("/library"), 1500);
      } else {
        toast.error("Erreur lors de la publication");
      }
    } catch (err) {
      console.error("[Upload] Erreur:", err);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#fafafa] pb-28">

      {/* ─── Background Animé ─── */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-slate-100 to-transparent opacity-80" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full shape-blob blur-md animate-float opacity-70 mix-blend-multiply" />
        <div className="absolute top-10 -right-20 w-64 h-64 rounded-full bg-linear-to-br from-secondary/10 to-transparent blur-2xl animate-float-delayed" />
        <div className="absolute top-32 left-4 w-16 h-16 rounded-2xl shape-cube transform rotate-12 animate-float-slow" />
        <div className="absolute top-0 left-1/3 w-full h-full opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M45.7,-76.3C58.9,-69.3,69.1,-55.6,76.1,-41.2C83.1,-26.8,86.9,-11.7,84.4,2.5C81.9,16.7,73.1,30,63.1,41.2C53.1,52.4,41.9,61.5,29.4,68.4C16.9,75.3,3.1,80,-10.2,79.1C-23.5,78.2,-36.3,71.7,-48.4,63.1C-60.5,54.5,-71.9,43.8,-79.3,30.5C-86.7,17.2,-90.1,1.3,-86.3,-12.9C-82.5,-27.1,-71.5,-39.6,-59.4,-47.5C-47.3,-55.4,-34.1,-58.7,-21.5,-66.1C-8.9,-73.5,3.1,-85,16.7,-86.4C30.3,-87.8,45.5,-79.1,45.7,-76.3Z" fill="#0C3B2E" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* ─── HEADER ─── */}
      <header className="relative z-10 px-6 pt-12 pb-2">
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center gap-2 relative overflow-hidden group mb-4">
          <h1 className="text-[24px] font-extrabold tracking-tight text-gradient-premium drop-shadow-sm mb-1">
            Dépôt de Mémoire
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-[220px] mx-auto leading-relaxed">
            Partagez votre savoir académique et contribuez à l&apos;excellence.
          </p>
        </div>
      </header>

      {/* ─── CONTENU ─── */}
      <main className="flex-1 overflow-y-auto no-scrollbar space-y-6 relative z-10 px-6 pb-6">

        {/* ═══ ZONE PDF ═══ */}
        <div className="bg-white rounded-2xl p-6 card-shadow border border-slate-100">
          <div
            className="border-2 border-dashed border-accent/30 rounded-xl bg-[#F1F4F1]/50 p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group cursor-pointer hover:bg-[#F1F4F1] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              {file ? (
                <>
                  <p className="text-sm font-bold text-primary">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} Mo</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-primary">Glissez votre PDF ici</p>
                  <p className="text-[10px] text-slate-400 mt-1">Max 50Mo • PDF uniquement</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>

          {(isUploading || ocrDone) && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{ocrDone ? "Analyse terminée" : "Analyse OCR en cours..."}</span>
                <span className="text-accent">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full relative overflow-hidden transition-all duration-300" style={{ width: `${uploadProgress}%` }}>
                  {!ocrDone && <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic">Extraction des métadonnées automatique</p>
            </div>
          )}
        </div>

        {/* ═══ FORMULAIRE ═══ */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ─── Détails Académiques ─── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-[18px] h-[18px]" />
              Détails Académiques
            </h3>

            {/* ═══ Sélection Université / École ═══ */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary ml-1">École / Université</label>

              {/* Affichage de la sélection courante */}
              {selectedSchool ? (
                <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-[#F1F4F1] px-4 py-3">
                  <div>
                    <span className="text-sm font-bold text-primary">{selectedSchool}</span>
                    <span className="text-[10px] text-accent block">{selectedUniversity}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedSchool(""); setSelectedUniversity(""); setExpandedUni(null); }}
                    className="text-xs font-bold text-secondary hover:text-secondary/70 transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  {/* Recherche */}
                  <div className="relative border-b border-slate-100">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                    <input
                      type="text"
                      value={uniSearch}
                      onChange={(e) => setUniSearch(e.target.value)}
                      placeholder="Rechercher une université..."
                      className="w-full py-3 pl-9 pr-4 text-sm text-primary bg-transparent outline-none placeholder:text-accent/40"
                    />
                  </div>

                  {/* Liste accordion */}
                  <div className="max-h-[240px] overflow-y-auto no-scrollbar divide-y divide-slate-50">
                    {filteredUniversities.map((uni) => (
                      <div key={uni.short}>
                        <button
                          type="button"
                          onClick={() => setExpandedUni(expandedUni === uni.short ? null : uni.short)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F7] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            <div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-black text-primary">{uni.short}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-primary leading-tight">{uni.name}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-accent/40 transition-transform duration-200 shrink-0 ${expandedUni === uni.short ? "rotate-180" : ""}`} />
                        </button>

                        {expandedUni === uni.short && (
                          <div className="bg-[#F9F9F7]/70 px-4 pb-3 pt-1">
                            <div className="flex flex-wrap gap-2">
                              {uni.schools.map((school) => (
                                <button
                                  key={school}
                                  type="button"
                                  onClick={() => handleSelectSchool(uni, school)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-primary border border-accent/10 hover:border-secondary/30 hover:text-secondary transition-all active:scale-95"
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

            {/* Filière (texte libre) */}
            <div className="space-y-1.5">
              <label htmlFor="filiere" className="text-xs font-bold text-primary ml-1">
                Filière / Spécialité
              </label>
              <input
                id="filiere"
                type="text"
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                placeholder="Ex: Informatique, Génie Civil, Droit..."
                className="w-full rounded-xl border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 focus:border-accent focus:ring-accent shadow-sm outline-none"
              />
            </div>

            {/* Thème */}
            <div className="space-y-1.5">
              <label htmlFor="theme" className="text-xs font-bold text-primary ml-1">
                Thème du mémoire
              </label>
              <textarea
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Titre complet ou sujet principal de votre recherche..."
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 focus:border-accent focus:ring-accent shadow-sm resize-none outline-none"
              />
            </div>

            {/* Année + Auteur */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="year" className="text-xs font-bold text-primary ml-1">Année</label>
                <input
                  id="year"
                  type="number"
                  min="2000"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className="w-full rounded-xl border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 focus:border-accent focus:ring-accent shadow-sm outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="author" className="text-xs font-bold text-primary ml-1">Auteur(s)</label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nom Prénom"
                  className="w-full rounded-xl border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 focus:border-accent focus:ring-accent shadow-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* ─── Contact & Réseaux ─── */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-[18px] h-[18px]" />
              Contact & Réseaux
            </h3>

            {/* WhatsApp */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-[#25D366]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Partager WhatsApp</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWhatsApp(!showWhatsApp)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showWhatsApp ? "bg-accent" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${showWhatsApp ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
              {showWhatsApp && (
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Numéro WhatsApp (ex: +229...)" className="w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-[#25D366] focus:ring-[#25D366] shadow-sm outline-none" />
              )}
            </div>

            {/* LinkedIn */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-[#0077b5]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Lien Profil LinkedIn</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkedIn(!showLinkedIn)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showLinkedIn ? "bg-[#0077b5]" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${showLinkedIn ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
              {showLinkedIn && (
                <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="Lien du profil LinkedIn" className="w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-[#0077b5] focus:ring-[#0077b5] shadow-sm outline-none" />
              )}
            </div>
          </div>

          {/* ─── CGU + Submit ─── */}
          <div className="pt-4 space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white/50 cursor-pointer hover:bg-white transition-colors">
              <input type="checkbox" checked={acceptedCGU} onChange={(e) => setAcceptedCGU(e.target.checked)} className="mt-1 rounded border-slate-300 text-secondary focus:ring-secondary" />
              <span className="text-[10px] text-slate-500 leading-relaxed">
                Je certifie être l&apos;auteur de ce mémoire et j&apos;autorise PHENIX à le référencer sur la plateforme conformément aux{" "}
                <Link href="/conditions" className="text-primary underline font-bold">CGU</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-sm shadow-lg shadow-secondary/30 hover:shadow-xl hover:brightness-110 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <span>Publier le Mémoire</span>
                  <Send className="w-[18px] h-[18px]" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
