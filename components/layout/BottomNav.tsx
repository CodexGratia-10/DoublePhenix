"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const items = [
  { name: "Accueil", href: "/dashboard", icon: Home },
  { name: "Savoir", href: "/library", icon: BookOpen },
  { name: "PHENIX", href: "/chat", icon: Sparkles, isCenter: true },
  { name: "Nexus", href: "/nexus", icon: Users },
  { name: "Profil", href: "/profile/me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border/60 bg-white/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all touch-bounce overflow-hidden bg-white border border-slate-100",
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "hover:scale-105"
                  )}
                >
                  <Image src="/logo.jpeg" alt="PHENIX" width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold mt-1 tracking-wide",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-full transition-all touch-bounce relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 rounded-full bg-primary animate-scale-in" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
