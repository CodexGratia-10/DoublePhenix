"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from '@/lib/supabase/client'


function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setLoading] = useState(false);

  // Handle query params from auth callback
  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    if (verified === "true") {
      toast.success("Email confirmé ! Vous pouvez maintenant vous connecter. 🎉");
    }
    if (error === "auth_failed") {
      toast.error("La vérification a échoué. Veuillez réessayer.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide";
    if (!password.trim()) newErrors.password = "Le mot de passe est requis";
    else if (password.length < 6) newErrors.password = "Min. 6 caractères";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Email non confirmé. Vérifiez votre boîte mail puis réessayez.");
      } else {
        toast.error(error.message || "Email ou mot de passe incorrect.");
      }
      setLoading(false);
      return;
    }

    toast.success('Connexion réussie ! Bienvenue 🔥');
    router.push('/dashboard');
    router.refresh(); // Important : force le middleware à relire la session
  };

  const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/callback`
    }
  })
}

  return (
    <div className="flex-1 flex flex-col relative max-w-md mx-auto w-full bg-white min-h-dvh shadow-2xl overflow-hidden selection:bg-primary selection:text-white">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />

      {/* Header with logo */}
      <header className="px-6 pt-12 pb-6 flex justify-center items-center z-10">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.jpeg" alt="PHENIX" width={120} height={120} className="drop-shadow-lg" />
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Phenix</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-8 z-10 justify-center">
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121716] mb-2">Bon retour !</h1>
          <p className="text-gray-500 text-sm">Connectez-vous pour continuer votre apprentissage.</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="login-email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="login-email"
                type="email"
                placeholder="exemple@uac.bj"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm outline-none ${errors.email ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="login-password">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                className={`block w-full pl-11 pr-12 py-4 bg-gray-50 border rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm outline-none ${errors.password ? "border-red-400" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-primary hover:text-[#1a5c4a] transition-colors">
                Mot de passe oublié ?
              </Link>
            {errors.password && <p className="text-[11px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-[#092b22] text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-primary/20 transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connexion en cours...
              </span>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 text-xs uppercase tracking-wider">Ou continuer avec</span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Se connecter avec Google</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center z-10">
        <Link href="/inscription" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          Pas encore de compte ? <span className="font-bold text-primary">S&apos;inscrire</span>
        </Link>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center min-h-dvh bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
