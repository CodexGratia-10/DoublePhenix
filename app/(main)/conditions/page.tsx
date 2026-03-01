"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  Eye,
  Scale,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ═══════════════════════════════════════════
// Page Conditions d'Utilisation
// ═══════════════════════════════════════════
export default function TermsPage() {
  const router = useRouter();
  const { t } = useI18n();

  const sections = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "1. Acceptation des Conditions",
      titleEn: "1. Acceptance of Terms",
      content: `En accédant à la plateforme PHENIX et en l'utilisant, vous acceptez d'être lié par les présentes Conditions d'Utilisation, notre Politique de Confidentialité et toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.

PHENIX est une plateforme académique destinée aux étudiants et professionnels du Bénin et de l'Afrique francophone. L'inscription et l'utilisation de nos services impliquent l'acceptation inconditionnelle et sans réserve des présentes conditions.`,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "2. Inscription et Compte Utilisateur",
      titleEn: "2. Registration and User Account",
      content: `Pour accéder aux fonctionnalités de PHENIX, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. Vous êtes responsable de :

• La confidentialité de votre mot de passe et de vos identifiants de connexion.
• Toute activité effectuée sous votre compte.
• La notification immédiate à PHENIX en cas d'utilisation non autorisée de votre compte.

PHENIX se réserve le droit de suspendre ou de supprimer tout compte qui viole les présentes conditions ou qui est inactif depuis plus de 12 mois consécutifs.`,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "3. Contenu et Propriété Intellectuelle",
      titleEn: "3. Content and Intellectual Property",
      content: `Les utilisateurs peuvent partager des mémoires, documents académiques et autres contenus sur la plateforme. En partageant du contenu, vous :

• Garantissez que vous êtes l'auteur original ou que vous disposez des droits nécessaires.
• Accordez à PHENIX une licence non exclusive, gratuite et mondiale de diffusion.
• Restez propriétaire de vos contenus et pouvez les retirer à tout moment.

Tout plagiat, violation de droits d'auteur ou partage de contenus illégaux entraînera la suppression immédiate du contenu et la suspension potentielle du compte. Les documents vérifiés par notre système reçoivent un badge de certification.`,
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "4. Confidentialité et Données Personnelles",
      titleEn: "4. Privacy and Personal Data",
      content: `PHENIX s'engage à protéger vos données personnelles conformément aux lois en vigueur en République du Bénin et aux standards internationaux de protection des données.

Nous collectons et traitons les données suivantes :
• Informations d'identification (nom, prénom, email, école).
• Données d'utilisation (historique de navigation, interactions).
• Contenus partagés (documents, annonces).

Vos données ne sont jamais vendues à des tiers. Vous pouvez à tout moment demander la suppression de vos données en contactant notre support ou via les paramètres de votre compte.`,
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: "5. Comportement et Utilisation Acceptable",
      titleEn: "5. Acceptable Use Policy",
      content: `En utilisant PHENIX, vous vous engagez à :

• Respecter tous les utilisateurs et maintenir un environnement bienveillant.
• Ne pas publier de contenu haineux, discriminatoire, diffamatoire ou illégal.
• Ne pas tenter de pirater, altérer ou perturber le fonctionnement de la plateforme.
• Ne pas usurper l'identité d'un autre utilisateur ou d'une institution.
• Ne pas utiliser la plateforme à des fins commerciales non autorisées.
• Ne pas partager votre compte avec des tiers.

Le système Nexus de collaboration doit être utilisé de manière éthique. Toute tentative de fraude ou d'arnaque via les annonces sera immédiatement sanctionnée.`,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "6. Badges et Système de Réputation",
      titleEn: "6. Badges and Reputation System",
      content: `PHENIX attribue des badges (Mentor, Talent) selon des critères objectifs :

• Badge MENTOR : attribué aux utilisateurs ayant partagé un minimum de documents vérifiés et ayant contribué activement à la communauté.
• Badge TALENT : attribué sur candidature après vérification du profil académique et des compétences.

Les badges peuvent être retirés en cas de violation des conditions d'utilisation. Toute tentative de manipulation du système de réputation est strictement interdite et entraînera des sanctions.`,
    },
    {
      icon: <Ban className="w-5 h-5" />,
      title: "7. Limitations de Responsabilité",
      titleEn: "7. Limitation of Liability",
      content: `PHENIX fournit ses services "en l'état" et ne garantit pas :

• L'exactitude ou la qualité des contenus partagés par les utilisateurs.
• La disponibilité ininterrompue de la plateforme.
• Les résultats obtenus grâce à l'utilisation de l'assistant IA.

PHENIX ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme. L'assistant IA fournit des informations à titre indicatif et ne remplace pas un avis professionnel ou académique.`,
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: "8. Modifications des Conditions",
      titleEn: "8. Changes to Terms",
      content: `PHENIX se réserve le droit de modifier les présentes Conditions d'Utilisation à tout moment. Les utilisateurs seront informés des modifications substantielles par :

• Une notification dans l'application.
• Un email envoyé à l'adresse associée au compte.

La poursuite de l'utilisation de la plateforme après la publication des modifications vaut acceptation des nouvelles conditions. En cas de désaccord, l'utilisateur peut supprimer son compte.`,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "9. Contact et Réclamations",
      titleEn: "9. Contact and Complaints",
      content: `Pour toute question, réclamation ou demande relative aux présentes Conditions d'Utilisation, vous pouvez nous contacter :

• Par email : support@phenix-app.com
• Via WhatsApp : +229 XX XX XX XX
• Via le formulaire de contact dans l'application.

Nous nous engageons à traiter votre demande dans un délai de 72 heures ouvrées. Toute réclamation non résolue peut être portée devant les juridictions compétentes de la République du Bénin.`,
    },
  ];

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden pb-12">

      {/* ─── HEADER ─── */}
      <header className="bg-white border-b border-primary/5 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push("/profile/me")}
            className="w-10 h-10 rounded-full hover:bg-primary/5 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-primary font-display">{t("terms_title")}</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      {/* ─── HERO ─── */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-32 h-32 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-8 w-24 h-24 bg-accent rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center py-10 px-6 text-center">
          {/* Animated PHENIX logo */}
          <div className="relative w-24 h-24 mb-5">
            <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative w-full h-full flex items-center justify-center animate-float">
              <Image
                src="/logo.jpeg"
                alt="PHENIX"
                width={80}
                height={80}
                className="rounded-2xl shadow-2xl shadow-black/30 border-2 border-white/20"
                style={{
                  animation: "rotateY 6s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 font-display">PHENIX</h2>
          <p className="text-white/60 text-sm font-body max-w-xs">
            Plateforme Académique IA — République du Bénin
          </p>
          <p className="text-white/40 text-xs mt-3 font-body">
            {t("terms_last_updated")} : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ─── PREAMBLE ─── */}
      <div className="px-5 py-6">
        <div className="bg-white p-5 rounded-2xl border border-secondary/20 shadow-sm">
          <p className="text-sm text-primary/80 leading-relaxed font-body">
            Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme PHENIX, 
            application mobile et web dédiée à l&apos;excellence académique en Afrique. En utilisant nos services, vous reconnaissez 
            avoir lu, compris et accepté l&apos;intégralité de ces conditions.
          </p>
        </div>
      </div>

      {/* ─── SECTIONS ─── */}
      <div className="px-5 space-y-4 pb-8">
        {sections.map((section, index) => (
          <details key={index} className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden group">
            <summary className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-[#F9F9F7] transition-colors list-none">
              <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-primary font-display leading-tight">{section.title}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-primary/30 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="px-5 pb-5 pt-1 border-t border-primary/5">
              <div className="text-sm text-primary/70 leading-relaxed whitespace-pre-line font-body">
                {section.content}
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="px-5 pb-6">
        <div className="bg-primary/5 p-5 rounded-2xl text-center space-y-2">
          <p className="text-xs text-primary/50 font-body">
            © 2026 PHENIX — Tous droits réservés
          </p>
          <p className="text-xs text-primary/40 font-body">
            République du Bénin • Cotonou
          </p>
        </div>
      </div>

      {/* ─── 3D CSS Animation ─── */}
      <style jsx>{`
        @keyframes rotateY {
          0%, 100% { transform: perspective(400px) rotateY(0deg); }
          25% { transform: perspective(400px) rotateY(15deg); }
          75% { transform: perspective(400px) rotateY(-15deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
