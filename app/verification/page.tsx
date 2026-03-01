"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MailCheck, ArrowLeft, ExternalLink } from "lucide-react";

// ═══════════════════════════════════════════
// Page « Vérifiez votre email »
// Remplace l'ancienne page OTP
// ═══════════════════════════════════════════
function VerificationPageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "inscription"; // "inscription" | "reset"
  const email = searchParams.get("email") || "";

  const isReset = type === "reset";

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-primary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-40 left-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />

      {/* Header */}
      <header className="px-6 py-6 flex items-center z-10">
        <Link
          href={isReset ? "/mot-de-passe-oublie" : "/inscription"}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 z-10 pb-20">

        {/* Logo PHENIX */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse scale-150" />
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-xl">
            <Image src="/logo.jpeg" alt="PHENIX" width={80} height={80} className="object-cover w-full h-full" />
          </div>
        </div>

        {/* Mail icon animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
            <MailCheck className="w-12 h-12 text-accent" />
          </div>
          {/* Floating notification dot */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-primary text-center mb-3 font-display">
          {isReset ? "Lien de réinitialisation envoyé !" : "Confirmez votre email"}
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-sm text-center leading-relaxed max-w-xs mb-2 font-body">
          {isReset
            ? "Nous avons envoyé un lien de réinitialisation de mot de passe à votre adresse email."
            : "Nous avons envoyé un lien de confirmation à votre adresse email pour activer votre compte."
          }
        </p>

        {/* Email badge */}
        {email && (
          <div className="bg-primary/5 px-4 py-2 rounded-full mb-8">
            <p className="text-sm font-bold text-primary font-body">{email}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="w-full bg-[#F9F9F7] rounded-2xl p-5 space-y-4 mb-8 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
            <p className="text-sm text-gray-600 font-body">
              Ouvrez votre boîte mail <span className="font-bold text-primary">({email || "votre email"})</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
            <p className="text-sm text-gray-600 font-body">
              Cherchez un email de <span className="font-bold text-primary">PHENIX</span>
              <span className="text-gray-400 text-xs ml-1">(vérifiez aussi les spams)</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
            <p className="text-sm text-gray-600 font-body">
              <span className="font-bold text-secondary">Cliquez sur le lien</span> dans l&apos;email pour {isReset ? "réinitialiser votre mot de passe" : "confirmer votre inscription"}
            </p>
          </div>
        </div>

        {/* Where will the link take me */}
        <div className="w-full bg-accent/5 rounded-xl p-4 mb-6 border border-accent/10">
          <div className="flex items-center gap-2 mb-1">
            <ExternalLink className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent font-body">Où mène le lien ?</span>
          </div>
          <p className="text-xs text-gray-500 font-body leading-relaxed">
            {isReset
              ? "Le lien vous redirigera vers la page de création d'un nouveau mot de passe."
              : "Le lien confirmera votre email et vous redirigera vers la page de connexion."
            }
          </p>
        </div>

        {/* Back to login */}
        <Link
          href="/login"
          className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </main>

      {/* Footer */}
      <div className="p-6 text-center z-10">
        <p className="text-xs text-gray-400 font-body">PHENIX — Plateforme académique</p>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerificationPageContent />
    </Suspense>
  );
}
