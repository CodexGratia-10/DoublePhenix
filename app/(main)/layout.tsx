import { BottomNav } from "@/components/layout/BottomNav";

// ═══════════════════════════════════════════
// Layout (main) — Pages protégées avec BottomNav
// Dashboard, Library, Chat, Nexus, Profile
// ═══════════════════════════════════════════

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto bg-white shadow-2xl relative">
      {children}
      <BottomNav />
    </div>
  );
}
