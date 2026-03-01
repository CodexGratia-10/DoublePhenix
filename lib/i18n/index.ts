"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import fr from "./fr";
import en from "./en";
import type { TranslationKeys } from "./fr";

// ═══════════════════════════════════════════
// PHENIX — i18n Context
// ═══════════════════════════════════════════
export type Locale = "fr" | "en";

const translations: Record<Locale, Record<TranslationKeys, string>> = { fr, en };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => fr[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  // Load saved locale
  useEffect(() => {
    const saved = localStorage.getItem("phenix-lang") as Locale | null;
    if (saved && (saved === "fr" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("phenix-lang", newLocale);
  };

  const t = (key: TranslationKeys): string => {
    return translations[locale]?.[key] ?? fr[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { TranslationKeys };
