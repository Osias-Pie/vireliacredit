import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey, LOCALES } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  locales: typeof LOCALES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app.locale";

function detectDefault(): Locale {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && LOCALES.some((l) => l.code === stored)) return stored;
  const nav = window.navigator.language.slice(0, 2) as Locale;
  return LOCALES.some((l) => l.code === nav) ? nav : "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    setLocaleState(detectDefault());
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[locale] ?? translations.fr;
    const fallback = translations.fr;
    return {
      locale,
      setLocale,
      locales: LOCALES,
      t: (key, vars) => {
        let str = (dict[key] ?? fallback[key] ?? key) as string;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          }
        }
        return str;
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
