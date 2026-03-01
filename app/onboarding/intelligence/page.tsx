"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Bot, BookOpen, CheckCircle, Brain, Quote } from "lucide-react";

export default function IntelligencePage() {
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
        <Link href="/onboarding/souverainete" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary" />
        </Link>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-8 h-2 rounded-full bg-secondary" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
        <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-secondary transition-colors">
          Passer
        </Link>
      </header>

      {/* Main Content */}
      <main ref={animatedRef} className="flex-1 flex flex-col px-6 pb-2 z-10 overflow-y-auto no-scrollbar justify-center">
        {/* Illustration Area */}
        <div className="relative py-4 flex justify-center items-center mb-6 h-80">
          {/* Rotating circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 border border-secondary/20 rounded-full" style={{ animation: "spin 25s linear infinite" }} />
          </div>
          {/* Dashed inner circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border border-secondary/30 rounded-full border-dashed" />
          </div>

          <div className="relative w-full max-w-[280px] h-full flex flex-col justify-center items-center">
            {/* Student question bubble (top-right) */}
            <div className="absolute top-8 right-0 transform translate-x-2 z-10">
              <div className="bg-white rounded-2xl rounded-tr-sm p-3 shadow-md border border-secondary/20 max-w-[180px]">
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-[10px] font-bold text-secondary uppercase">Étudiant</span>
                </div>
                <p className="text-xs text-gray-700 leading-snug">
                  Quelle est la méthodologie de recherche qualitative ?
                </p>
              </div>
            </div>

            {/* PHENIX AI response bubble (center) */}
            <div className="relative z-20 mt-16 transform -translate-x-2">
              <div className="bg-primary text-white rounded-2xl rounded-tl-sm p-4 shadow-xl border border-secondary/30 max-w-[240px] relative overflow-hidden">
                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">PHENIX AI</span>
                  </div>
                  <span className="text-[8px] bg-secondary/20 px-1.5 py-0.5 rounded text-secondary">v2.0</span>
                </div>

                {/* Response text */}
                <p className="text-xs font-light leading-relaxed text-gray-100 mb-3 relative z-10">
                  Selon <span className="text-secondary font-medium underline decoration-dotted">Kouakou (2021)</span>, l&apos;approche qualitative privilégie l&apos;analyse en profondeur des phénomènes sociaux...
                </p>

                {/* Citation card */}
                <div className="bg-white/10 rounded-lg p-2 flex gap-2 items-start border border-white/5 relative z-10">
                  <BookOpen className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-white">Mémoire UAC #4290</p>
                    <p className="text-[8px] text-gray-400">Page 45 • Chapitre 3</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified citation card (bottom-left) */}
            <div className="absolute bottom-8 -left-2 transform rotate-6 z-30">
              <div className="bg-white p-2 rounded-xl shadow-lg border border-secondary/20 flex gap-2 items-center" style={{ boxShadow: "0 4px 20px -2px rgba(187, 138, 82, 0.15)" }}>
                <div className="bg-secondary/10 p-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                </div>
                <div className="pr-2">
                  <div className="h-1.5 w-16 bg-gray-200 rounded-full mb-1" />
                  <div className="h-1.5 w-10 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <div data-animate className="inline-block px-3 py-1 bg-secondary/10 rounded-full mb-4 border border-secondary/20">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Partage • Intelligence</span>
          </div>
          <h1 data-animate className="text-3xl md:text-4xl font-bold text-[#121716] mb-4 leading-tight">
            Intelligence<br />
            <span className="text-secondary">Contextuelle</span>
          </h1>
          <p data-animate className="text-gray-500 text-base md:text-lg leading-relaxed px-4">
            Une IA qui ne devine pas, elle analyse vos mémoires locaux pour des réponses précises et citées.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div data-animate className="bg-[#f0f7f2] p-4 rounded-2xl border border-secondary/20 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-bold text-sm text-primary">Analyse Locale</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-tight">Données Béninoises</p>
          </div>
          <div data-animate className="bg-[#f0f7f2] p-4 rounded-2xl border border-secondary/20 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
              <Quote className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-bold text-sm text-primary">Citations</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-tight">Sources vérifiées</p>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <div className="p-6 pt-0 bg-gradient-to-t from-white via-white to-transparent z-20">
        <p className="text-center text-sm font-medium text-secondary mb-6 italic">
          &ldquo;Le savoir est une richesse, partageons-le.&rdquo;
        </p>

        <Link href="/onboarding/connexion">
          <button className="w-full bg-primary hover:bg-[#0f4a3a] text-white font-bold text-base md:text-lg py-3.5 md:py-4 rounded-2xl shadow-lg shadow-primary/30 transform transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 cursor-pointer">
            <span>Suivant</span>
            <ArrowRight className="w-5 h-5 text-secondary" />
          </button>
        </Link>

        <div className="flex justify-center gap-2 mt-4 pb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
