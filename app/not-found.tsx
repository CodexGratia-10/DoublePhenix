import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  const redirectUrl = "/";
  const buttonText = "Accueil";

  return (
    <div className="bg-[#f6f8f7] antialiased min-h-dvh flex flex-col items-center justify-center p-6 selection:bg-secondary/30 relative">
      <main className="w-full max-w-sm flex flex-col items-center text-center gap-8 relative z-10">
        {/* Floating Logo */}
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-2 animate-bounce" style={{ animationDuration: "6s" }}>
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6D9773]/10 to-transparent rounded-full blur-2xl scale-90" />
          {/* Logo - round */}
          <Image
            src="/logo.jpeg"
            alt="PHENIX"
            width={280}
            height={280}
            className="w-full h-full object-cover drop-shadow-2xl rounded-full relative z-10 hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-4">
          <h1 className="text-primary text-4xl font-bold tracking-tight leading-[1.1]">
            Oups !<br />Le savoir est en pause
          </h1>
          <p className="text-[#6D9773] text-lg leading-relaxed font-medium">
            Il semble que la connexion ait été interrompue ou que cette page soit introuvable. Ne paniquez pas, vos mémoires sont en sécurité.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-row items-center justify-center gap-8 mt-6">
          <Link href={redirectUrl} className="flex items-center justify-center gap-2 text-secondary hover:text-[#9a6e3d] transition-colors group">
            <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-lg font-bold tracking-wide border-b border-transparent group-hover:border-secondary transition-colors">{buttonText}</span>
          </Link>
        </div>
      </main>

      {/* Gradient overlays */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-60" />
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}
