"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Megaphone, Users, MessageSquare } from "lucide-react";

export default function ConnexionPage() {
  const animatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animatedRef.current) return;
    const elements = animatedRef.current.querySelectorAll("[data-animate]");
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(16px)";
      htmlEl.style.transition = `all 0.7s ease-out ${index * 100}ms`;
      setTimeout(() => {
        htmlEl.style.opacity = "1";
        htmlEl.style.transform = "translateY(0)";
      }, 100);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-secondary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center z-10">
        <Link href="/onboarding/intelligence" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary" />
        </Link>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-8 h-2 rounded-full bg-secondary" />
        </div>
        <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-secondary transition-colors">
          Passer
        </Link>
      </header>

      {/* Main Content */}
      <main ref={animatedRef} className="flex-1 flex flex-col px-6 pb-4 z-10 overflow-y-auto no-scrollbar justify-center">
        {/* Illustration Area */}
        <div className="relative py-8 flex justify-center items-center mb-6">
          {/* Rotating circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border border-secondary/20 rounded-full" style={{ animation: "spin 25s linear infinite" }} />
          </div>

          <div className="relative w-full h-64 flex justify-center items-center">
            {/* Background card (left, rotated) */}
            <div className="absolute top-4 left-6 transform -rotate-6 scale-90 opacity-80 z-10">
              <div className="w-48 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <div className="w-20 h-2 bg-gray-100 rounded-full" />
                </div>
                <div className="w-full h-16 bg-gray-50 rounded-lg mb-2" />
                <div className="flex gap-2">
                  <div className="w-12 h-2 bg-secondary/30 rounded-full" />
                  <div className="w-8 h-2 bg-secondary/20 rounded-full" />
                </div>
              </div>
            </div>

            {/* Main project card (center) */}
            <div className="absolute z-20 transform hover:scale-105 transition-transform duration-300">
              <div className="w-56 bg-white rounded-2xl p-4 border-2 border-secondary/10" style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}>
                {/* Card header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold">Recherche IA</div>
                      <div className="text-[10px] text-gray-400">Il y a 2h</div>
                    </div>
                  </div>
                  <div className="bg-secondary/10 px-2 py-0.5 rounded-full">
                    <span className="text-[10px] text-secondary font-bold">PROJET</span>
                  </div>
                </div>

                {/* Placeholder lines */}
                <div className="space-y-2 mb-3">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                  <div className="h-1.5 w-4/5 bg-gray-100 rounded-full" />
                  <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                </div>

                {/* Avatars + WhatsApp */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-200 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-red-200 border-2 border-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-200 animate-bounce">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign icon (top-right, pulse) */}
            <div className="absolute right-4 top-10 animate-pulse">
              <div className="bg-white p-2 rounded-lg shadow-md border border-secondary/20 rotate-12">
                <Megaphone className="w-5 h-5 text-secondary" />
              </div>
            </div>

            {/* Forum icon (bottom-left, bounce) */}
            <div className="absolute left-10 bottom-4 animate-bounce" style={{ animationDuration: "3s" }}>
              <div className="bg-secondary p-1.5 rounded-lg shadow-md -rotate-6">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <div data-animate className="inline-block px-3 py-1 bg-secondary/10 rounded-full mb-4 border border-secondary/20">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Communication • Réseau</span>
          </div>
          <h1 data-animate className="text-3xl md:text-4xl font-bold text-[#121716] mb-4 leading-tight">
            Le Nexus de<br />
            <span className="text-secondary">Collaboration</span>
          </h1>
          <p data-animate className="text-gray-500 text-base md:text-lg leading-relaxed px-2">
            Transformez vos recherches en projets actifs. Connectez-vous avec des talents de tout le campus.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div data-animate className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center mb-2 shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#8c5e2a]">Annonces</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-tight">Postez vos idées</p>
          </div>
          <div data-animate className="bg-[#F9F1E6] p-4 rounded-2xl border-l-4 border-secondary flex flex-col items-center text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center mb-2 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#8c5e2a]">Réseautage</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-tight">Etudiants &amp; Professionnels</p>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center mt-2 px-6">
          <p className="text-sm font-medium italic text-secondary">
            &ldquo;Le savoir est une richesse, partageons-le.&rdquo;
          </p>
        </div>
      </main>

      {/* Bottom Section */}
      <div className="p-6 pt-0 bg-linear-to-t from-white via-white to-transparent z-20">
        {/* CTA Button - Ochre */}
        <Link href="/inscription">
          <button className="w-full bg-primary hover:bg-[#0f4a3a] text-white font-bold text-base md:text-lg py-3.5 md:py-4 rounded-2xl shadow-lg shadow-primary/30 transform transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 cursor-pointer">
            <span>C&apos;est parti !</span>
            <Rocket className="w-5 h-5 text-secondary" />
          </button>
        </Link>

        {/* Login link */}
        <div className="text-center">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            Déjà membre ? <span className="font-bold text-primary">Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
