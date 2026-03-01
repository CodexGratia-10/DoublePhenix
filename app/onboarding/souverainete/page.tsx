"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CloudUpload, Lock, Database, BookOpen, BadgeCheck } from "lucide-react";

export default function SouverainetePage() {
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
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-primary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header with progress dots */}
      <header className="px-6 py-6 flex justify-between items-center z-10">
        {/* Invisible spacer for alignment */}
        <div className="w-10 h-10 opacity-0 pointer-events-none" />

        {/* Progress dots */}
        <div className="flex gap-2">
          <div className="w-8 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>

        {/* Skip button */}
        <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">
          Passer
        </Link>
      </header>

      {/* Main Content */}
      <main ref={animatedRef} className="flex-1 flex flex-col px-6 pb-4 z-10 overflow-y-auto no-scrollbar justify-center">
        {/* Illustration Area */}
        <div className="relative py-8 flex justify-center items-center mb-8">
          {/* Outer rotating circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-72 h-72 border border-primary/10 rounded-full"
              style={{ animation: "spin 25s linear infinite" }}
            />
          </div>
          {/* Inner circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border border-primary/20 rounded-full" />
          </div>

          <div className="relative flex items-center justify-center">
            {/* Side card (right, rotated) */}
            <div className="absolute -right-6 top-6 transform rotate-12 opacity-90 z-10">
              <div className="w-32 h-40 bg-[#9CAF88] rounded-2xl shadow-lg border border-white/20 flex flex-col p-3">
                <div className="h-2 w-12 bg-white/40 rounded-full mb-3" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/30 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-white/30 rounded-full" />
                  <div className="h-1.5 w-full bg-white/30 rounded-full" />
                </div>
                <div className="mt-auto flex justify-end">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>

            {/* Main card (center) */}
            <div className="relative z-20 transform hover:scale-105 transition-transform duration-300">
              <div className="w-48 h-60 bg-gradient-to-br from-primary via-[#0f4d3c] to-[#082a21] rounded-[2rem] shadow-2xl flex flex-col items-center justify-between p-6 text-white border-4 border-white relative overflow-hidden">
                {/* Dot pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "12px 12px"
                }} />
                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                {/* Top row */}
                <div className="w-full flex justify-between items-start z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Database className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  </div>
                </div>

                {/* Center icon */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/10 backdrop-blur-sm shadow-inner">
                    <ShieldCheck className="w-9 h-9 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-[#6D9773] uppercase tracking-widest mb-1">DATA SECURE</p>
                    <div className="w-24 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                      <div className="w-2/3 h-full bg-secondary rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Bottom badge */}
                <div className="w-full bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5 z-10">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[10px] font-medium text-gray-200">Certifié PHENIX</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book icon card (bottom-left) */}
            <div className="absolute -left-8 bottom-8 transform -rotate-12 z-30">
              <div className="w-16 h-16 bg-[#D6A461] text-white rounded-xl shadow-xl flex flex-col items-center justify-center border-2 border-white/20">
                <BookOpen className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <div data-animate className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Partage • Héritage</span>
          </div>
          <h1 data-animate className="text-3xl md:text-4xl font-bold text-[#121716] mb-4 leading-tight">
            Souveraineté<br />
            <span className="text-primary">Numérique</span>
          </h1>
          <p data-animate className="text-gray-500 text-base md:text-lg leading-relaxed px-2">
            Sauvegardez et valorisez le patrimoine intellectuel béninois. Chaque mémoire est certifié et protégé.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div data-animate className="bg-[#D6A461]/10 p-4 rounded-2xl border border-[#D6A461]/20 flex flex-col items-center text-center">
            <CloudUpload className="w-6 h-6 text-[#D6A461] mb-2" />
            <h3 className="font-bold text-sm text-primary">Archivage</h3>
            <p className="text-xs text-gray-600 mt-1">Mémoires &amp; Thèses</p>
          </div>
          <div data-animate className="bg-[#9CAF88]/10 p-4 rounded-2xl border border-[#9CAF88]/20 flex flex-col items-center text-center shadow-sm">
            <Lock className="w-6 h-6 text-[#9CAF88] mb-2" />
            <h3 className="font-bold text-sm text-primary">Sécurité</h3>
            <p className="text-xs text-gray-600 mt-1">Données Cryptées</p>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <div className="p-6 pt-0 bg-gradient-to-t from-white via-white to-transparent z-20">
        {/* Quote */}
        <p className="text-center text-sm font-medium text-primary/80 mb-6 italic">
          &ldquo;Le savoir est une richesse, partageons-le.&rdquo;
        </p>

        {/* Next Button */}
        <Link href="/onboarding/intelligence">
          <button className="w-full bg-primary hover:bg-[#092e24] text-white font-bold text-base md:text-lg py-3.5 md:py-4 rounded-2xl shadow-lg shadow-primary/30 transform transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 cursor-pointer">
            <span>Suivant</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4 pb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
