"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, CheckCircle, Circle, LogIn, Shield } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password rules
  const hasMinLength = password.length >= 8;
  const hasDigitAndSymbol = /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const isFormValid = hasMinLength && hasDigitAndSymbol && passwordsMatch;

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Veuillez remplir correctement les champs.");
      return;
    }

    setIsSubmitting(true)
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    password: password
  })
  setIsSubmitting(false)

  if (error) {
    toast.error('Erreur lors de la mise à jour. Recommence depuis le début.')
    return
  }
  toast.success('Mot de passe mis à jour ! Connecte-toi.')
  router.push('/login')
  };

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-secondary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 flex items-center z-10">
        <Link
          href="/login"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-8 z-10 justify-center pb-20">
        {/* Icon illustration */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-secondary/10 rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-secondary" />
            </div>
            <div className="absolute -right-2 bottom-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#121716] mb-3">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Votre nouveau mot de passe doit être différent des mots de passe précédemment utilisés.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1" htmlFor="new-password">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-11 pr-12 py-4 rounded-xl bg-gray-50 border text-gray-900 focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow placeholder-gray-400 text-sm outline-none ${
                  password && !hasMinLength ? "border-red-300" : "border-gray-200"
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
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1" htmlFor="confirm-new-password">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${passwordsMatch ? "text-green-500" : "text-gray-400"}`} />
              </div>
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Répétez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-11 pr-12 py-4 rounded-xl bg-gray-50 border text-gray-900 focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow placeholder-gray-400 text-sm outline-none ${
                  passwordMismatch ? "border-red-300" : passwordsMatch ? "border-green-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-[11px] text-red-500 ml-1">Les mots de passe ne correspondent pas</p>
            )}
            {passwordsMatch && (
              <p className="text-[11px] text-green-600 ml-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Les mots de passe correspondent
              </p>
            )}
          </div>

          {/* Password rules checklist */}
          <div className="flex flex-col gap-2 pt-2 px-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {hasMinLength ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={hasMinLength ? "text-green-600" : ""}>Minimum 8 caractères</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {hasDigitAndSymbol ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={hasDigitAndSymbol ? "text-green-600" : ""}>Au moins un chiffre et un symbole</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {hasUppercase ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={hasUppercase ? "text-green-600" : ""}>Au moins une majuscule</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full text-white font-bold text-lg py-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                isFormValid
                  ? "bg-secondary hover:bg-[#a67a46] shadow-secondary/30"
                  : "bg-gray-300 shadow-none"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Réinitialisation...</span>
                </>
              ) : (
                <>
                  <span>Valider et se connecter</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <div className="p-6 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-xs font-medium text-gray-500">Sécurité garantie par PHENIX</span>
        </div>
      </div>
    </div>
  );
}
