"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, AtSign, Building2, GraduationCap, Lock, Eye, EyeOff, UserPlus, ChevronDown, Search, TrendingUp, BookOpenText, ShieldCheck, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/* ═══════════════════════════════════════════
   DONNÉES UNIVERSITÉS DU BÉNIN
   ═══════════════════════════════════════════ */

const UNIVERSITIES: Record<string, { type: string; schools?: string[] }> = {
  "Université d'Abomey-Calavi (UAC)": {
    type: "Publique",
    schools: [
      "IFRI – Institut de Formation et de Recherche en Informatique",
      "EPAC – École Polytechnique d'Abomey-Calavi",
      "FSA – Faculté des Sciences Agronomiques",
      "FAST – Faculté des Sciences et Techniques",
      "FSS – Faculté des Sciences de la Santé",
      "FADESP – Faculté de Droit et de Sciences Politiques",
      "FASHS – Faculté des Sciences Humaines et Sociales",
      "FLASH – Faculté des Lettres, Arts et Sciences Humaines",
      "ENEAM – École Nationale d'Économie Appliquée et de Management",
      "ENAM – École Nationale d'Administration et de Magistrature",
      "INE – Institut National de l'Eau",
      "INJEPS – Institut National de la Jeunesse et du Sport",
      "IECN – Institut d'Enseignement et de Communication Numérique",
    ],
  },
  "Université de Parakou (UP)": {
    type: "Publique",
    schools: [
      "FA – Faculté d'Agronomie",
      "FM – Faculté de Médecine",
      "FDSP – Faculté de Droit et de Sciences Politiques",
      "FLSH – Faculté des Lettres et Sciences Humaines",
      "IUT – Institut Universitaire de Technologie",
      "FASEG – Faculté des Sciences Économiques et de Gestion",
    ],
  },
  "UNSTIM – Université Nationale des Sciences et Technologies": {
    type: "Publique",
    schools: [
      "ENSI – École Nationale des Sciences Informatiques",
      "ENSGM – École Nationale Supérieure de Génie Mathématique",
      "ENSAM – École Nationale Supérieure d'Arts et Métiers",
    ],
  },
  "UNA – Université Nationale d'Agriculture": {
    type: "Publique",
    schools: [
      "École de Sciences et Techniques Animales",
      "École d'Horticulture et d'Aménagement",
      "École des Sciences de l'Alimentation",
    ],
  },
  "CERCO": { type: "Privée" },
  "ISM Adonaï": { type: "Privée" },
  "UCAO – Université Catholique de l'Afrique de l'Ouest": { type: "Privée" },
  "PIGIER Bénin": { type: "Privée" },
  "ESGIS Bénin": { type: "Privée" },
  "Université Protestante de l'Atlantique (UPA)": { type: "Privée" },
  "IRGIB Africa": { type: "Privée" },
  "Haute École de Commerce et de Management (HECM)": { type: "Privée" },
};

export default function InscriptionPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [filiere, setFiliere] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Form completeness
  const isFormValid = fullname && email && selectedUniversity && filiere && password.length >= 8 && passwordsMatch && termsAccepted;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullname.trim()) newErrors.fullname = "Le nom est requis";
    if (!email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide";
    if (!selectedUniversity) newErrors.university = "Choisissez une université";
    if (!filiere.trim()) newErrors.filiere = "La filière est requise";
    if (password.length < 8) newErrors.password = "8 caractères minimum";
    if (!passwordsMatch) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!termsAccepted) newErrors.terms = "Veuillez accepter les conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {


      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin + "/callback?type=signup",
          data: {
            full_name: fullname.trim(),
            school: selectedSchool || selectedUniversity,
          },
        },
      });

      if (error) {
        toast.error(error.message || "Erreur lors de l'inscription.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Compte créé ! Vérifiez votre email 📧");
      router.push("/verification?type=inscription&email=" + encodeURIComponent(email));
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // University search
  const [uniSearch, setUniSearch] = useState("");
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  // School search
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const filteredUniversities = useMemo(() => {
    const universityNames = Object.keys(UNIVERSITIES);
    if (!uniSearch) return universityNames;
    return universityNames.filter((u) =>
      u.toLowerCase().includes(uniSearch.toLowerCase())
    );
  }, [uniSearch]);

  const currentSchools = useMemo(() => 
    selectedUniversity ? UNIVERSITIES[selectedUniversity]?.schools || [] : []
  , [selectedUniversity]);

  const filteredSchools = useMemo(() => {
    if (!schoolSearch) return currentSchools;
    return currentSchools.filter((s) =>
      s.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  }, [schoolSearch, currentSchools]);

  const handleSelectUniversity = (uni: string) => {
    setSelectedUniversity(uni);
    setUniSearch("");
    setShowUniDropdown(false);
    setSelectedSchool("");
    setSchoolSearch("");
  };

  const handleSelectSchool = (school: string) => {
    setSelectedSchool(school);
    setSchoolSearch("");
    setShowSchoolDropdown(false);
  };

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-secondary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center z-10">
        <Link href="/onboarding/connexion" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary" />
        </Link>
        <div className="flex-1 text-center" />
        <div className="w-10 h-10" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-6 pb-6 z-10 overflow-y-auto no-scrollbar">
        {/* Header illustration */}
        <div className="text-center mb-8 mt-2 relative">
          <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
            {/* Abstract blob background */}
            <div className="absolute inset-0 opacity-20 scale-125 rounded-full" style={{
              background: "linear-gradient(135deg, #0c3b2e 0%, #BB8A52 100%)",
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            }} />
            {/* Main icon card */}
            <div className="relative w-24 h-24 bg-linear-to-br from-primary to-phenix-accent rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-6 transform transition-transform hover:rotate-0">
              <BookOpenText className="w-12 h-12 text-white" />
            </div>
            {/* Small floating badge */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg -rotate-12">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#121716] mb-2 leading-tight">
            Rejoindre la<br />
            <span className="text-secondary">communauté</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Créez votre profil académique pour accéder aux ressources.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Nom complet */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider" htmlFor="fullname">Nom complet</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                id="fullname"
                type="text"
                placeholder="Ex: Jean Dupont"
                value={fullname}
                onChange={(e) => { setFullname(e.target.value); setErrors((prev) => ({ ...prev, fullname: "" })); }}
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  errors.fullname ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
            {errors.fullname && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider" htmlFor="email">Email académique</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <AtSign className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="etudiant@universite.bj"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>

          {/* Université (searchable dropdown) */}
          <div className="group relative">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Université</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Building2 className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une université..."
                value={selectedUniversity || uniSearch}
                onChange={(e) => {
                  setUniSearch(e.target.value);
                  setSelectedUniversity("");
                  setShowUniDropdown(true);
                  setErrors((prev) => ({ ...prev, university: "" }));
                }}
                onFocus={() => setShowUniDropdown(true)}
                className={`block w-full pl-11 pr-10 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  errors.university ? "border-red-400" : "border-gray-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            {errors.university && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.university}</p>}

            {/* Dropdown */}
            {showUniDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto no-scrollbar">
                {filteredUniversities.length === 0 ? (
                  <div className="p-3 text-sm text-gray-400 text-center">Aucun résultat</div>
                ) : (
                  <>
                    {/* Public */}
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Universités Publiques</span>
                    </div>
                    {filteredUniversities.filter(u => UNIVERSITIES[u].type === "Publique").map((uni) => (
                      <button
                        key={uni}
                        type="button"
                        onClick={() => handleSelectUniversity(uni)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-gray-700">{uni}</span>
                      </button>
                    ))}

                    {/* Private */}
                    <div className="px-3 pt-3 pb-1 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Universités Privées</span>
                    </div>
                    {filteredUniversities.filter(u => UNIVERSITIES[u].type === "Privée").map((uni) => (
                      <button
                        key={uni}
                        type="button"
                        onClick={() => handleSelectUniversity(uni)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span className="font-medium text-gray-700">{uni}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* École / Faculté (if university has schools) */}
          {selectedUniversity && currentSchools.length > 0 && (
            <div className="group relative animate-fade-in-up">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">École / Faculté</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une école..."
                  value={selectedSchool || schoolSearch}
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                    setSelectedSchool("");
                    setShowSchoolDropdown(true);
                  }}
                  onFocus={() => setShowSchoolDropdown(true)}
                  className="block w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {showSchoolDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar">
                  {filteredSchools.length === 0 ? (
                    <div className="p-3 text-sm text-gray-400 text-center">Aucun résultat</div>
                  ) : (
                    filteredSchools.map((school) => (
                      <button
                        key={school}
                        type="button"
                        onClick={() => handleSelectSchool(school)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-gray-700">{school}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Filière (free text) */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider" htmlFor="filiere">Filière ou Spécialité</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <GraduationCap className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                id="filiere"
                type="text"
                placeholder="Ex: Génie Logiciel, Médecine, Droit..."
                value={filiere}
                onChange={(e) => { setFiliere(e.target.value); setErrors((prev) => ({ ...prev, filiere: "" })); }}
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  errors.filiere ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
            {errors.filiere && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.filiere}</p>}
          </div>

          {/* Mot de passe */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider" htmlFor="password">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
                className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength >= level
                          ? level <= 1 ? "bg-red-400" : level <= 2 ? "bg-orange-400" : level <= 3 ? "bg-yellow-400" : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[10px] font-medium ${
                  passwordStrength <= 1 ? "text-red-500" : passwordStrength <= 2 ? "text-orange-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {passwordStrength <= 1 ? "Faible" : passwordStrength <= 2 ? "Moyen" : passwordStrength <= 3 ? "Bon" : "Excellent"}
                  <span className="text-gray-400 ml-1">• Min. 8 caractères, majuscule, chiffre, symbole</span>
                </p>
              </div>
            )}
            {errors.password && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
          </div>

          {/* Confirmer mot de passe */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider" htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className={`w-5 h-5 transition-colors ${
                  passwordsMatch ? "text-green-500" : "text-gray-400 group-focus-within:text-secondary"
                }`} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "" })); }}
                className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-gray-900 placeholder-gray-400 text-sm font-medium transition-all outline-none ${
                  passwordMismatch ? "border-red-400" : passwordsMatch ? "border-green-400" : "border-gray-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                {passwordsMatch && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            {passwordMismatch && (
              <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />Les mots de passe ne correspondent pas
              </p>
            )}
            {passwordsMatch && (
              <p className="text-[11px] text-green-600 mt-1 ml-1 flex items-center gap-1">
                <Check className="w-3 h-3" />Les mots de passe correspondent ✓
              </p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={() => { setTermsAccepted(!termsAccepted); setErrors((prev) => ({ ...prev, terms: "" })); }}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-secondary/30 accent-secondary"
              />
            </div>
            <label className="ml-2 text-xs font-medium text-gray-500" htmlFor="terms">
              J&apos;accepte les <Link href="/conditions" className="text-secondary hover:underline font-bold" onClick={(e) => e.stopPropagation()}>conditions d&apos;utilisation</Link> et la <Link href="/conditions" className="text-secondary hover:underline font-bold" onClick={(e) => e.stopPropagation()}>politique de confidentialité</Link>.
            </label>
          </div>
          {errors.terms && <p className="text-[11px] text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.terms}</p>}
        </form>

        {/* Submit + OAuth */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 mb-6 cursor-pointer ${
              isFormValid && !isSubmitting
                ? "bg-secondary hover:bg-[#D4A56E] shadow-secondary/30"
                : "bg-gray-300 shadow-none cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <span>Créer mon compte</span>
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="grow border-t border-gray-200" />
            <span className="shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-widest">Ou continuer avec</span>
            <div className="grow border-t border-gray-200" />
          </div>

          {/* Google */}
          <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm transform transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </main>

      {/* Bottom link */}
      <div className="p-6 pt-0 bg-transparent z-20 text-center">
        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          Déjà membre ? <span className="font-bold text-primary">Se connecter</span>
        </Link>
      </div>
    </div>
  );
}
