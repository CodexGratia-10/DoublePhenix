"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes — Supabase auto-processes tokens
    // from both URL hash fragments (#access_token=...) and code params
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          // Normal sign-in after signup confirmation or OAuth
          router.replace("/dashboard");
        } else if (event === "PASSWORD_RECOVERY") {
          // Password reset link clicked → go to change password page
          router.replace("/nouveau-mot-de-passe");
        }
      }
    );

    // Fallback: if no auth event fires within 5 seconds, something went wrong
    const timeout = setTimeout(() => {
      setMessage("Lien invalide ou expiré.");
      setTimeout(() => router.replace("/login?error=auth_failed"), 2000);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-gray-500 font-body">{message}</p>
    </div>
  );
}
