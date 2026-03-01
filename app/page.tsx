"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-[#FDFCF8] min-h-dvh shadow-2xl overflow-hidden selection:bg-secondary selection:text-white">
      {/* Decorative Blobs */}
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="blob-3" />

      {/* Small decorative elements */}
      <div className="absolute top-1/4 left-8 w-3 h-3 rounded-full bg-secondary/20 z-0" />
      <div className="absolute bottom-1/3 right-8 w-4 h-4 border border-primary/20 transform rotate-45 z-0" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-8 z-10 justify-center items-center relative">
        {/* Logo with spectacular entrance */}
        <div className="relative mb-12">
          {/* Expanding rings on entrance */}
          <div
            className="absolute inset-0 -m-10 border-2 border-secondary/30 rounded-full"
            style={{ animation: "ringExpand 1.5s ease-out 0.2s both" }}
          />
          <div
            className="absolute inset-0 -m-6 border border-primary/20 rounded-full"
            style={{ animation: "ringExpandDelayed 1.8s ease-out 0.1s both" }}
          />

          {/* Logo container with entrance animation */}
          <div
            className="w-44 h-44 bg-white border-2 border-primary rounded-[2rem] flex items-center justify-center relative z-10 overflow-hidden"
            style={{
              animation: "logoEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both, logoGlow 1.5s ease-out 0.5s both, float 6s ease-in-out 2s infinite",
            }}
          >
            {/* Shine overlay */}
            <div className="absolute top-0 left-0 w-full h-full rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Shimmer sweep effect */}
            <div
              className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
              style={{ animation: "shimmerSweep 1s ease-in-out 1.2s both" }}
            />

            {/* Actual Logo Image */}
            <Image
              src="/logo.jpeg"
              alt="PHENIX"
              width={150}
              height={150}
              className="relative z-10 drop-shadow-lg"
              priority
            />
          </div>

          {/* Ground shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-5 bg-primary/15 blur-lg rounded-[100%]"
            style={{ animation: "fadeIn 0.8s ease-out 0.6s both" }}
          />
        </div>

        {/* Text Content — appears AFTER logo */}
        <div className="text-center space-y-6 max-w-xs mx-auto">
          <h1
            className="text-4xl font-bold text-primary tracking-tight leading-tight"
            style={{ animation: "revealDown 0.8s ease-out 1.3s both" }}
          >
            Bienvenue sur <span className="text-secondary">PHENIX</span>
          </h1>
          <p
            className="text-gray-600 text-lg font-light leading-relaxed"
            style={{ animation: "revealUp 0.8s ease-out 1.6s both" }}
          >
            La plateforme académique IA qui transforme l&apos;éducation au Bénin.
          </p>
        </div>
      </main>

      {/* Bottom Section — appears LAST */}
      <div className="p-8 pb-10 z-20">
        {/* Quote */}
        <div
          className="mb-8 text-center"
          style={{ animation: "fadeIn 0.6s ease-out 2s both" }}
        >
          <p className="text-sm font-medium text-primary/80 italic">
            &ldquo;Le savoir est une richesse, partageons-le.&rdquo;
          </p>
        </div>

        {/* CTA Button */}
        <Link href="/onboarding/souverainete" style={{ animation: "revealUp 0.7s ease-out 2.2s both", display: "block" }}>
          <button className="w-full bg-primary hover:bg-[#1A5C4A] text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-primary/20 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group cursor-pointer">
            <span>Commencer</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>

        {/* Progress Dots */}
        <div
          className="mt-8 flex justify-center items-center gap-2"
          style={{ animation: "fadeIn 0.5s ease-out 2.5s both" }}
        >
          <div className="h-1.5 w-8 rounded-full bg-secondary" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
