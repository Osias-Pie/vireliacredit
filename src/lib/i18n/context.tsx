import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Locale, LOCALES } from "./translations";
import { FINAL_I18N_OVERRIDES } from "./final-overrides";
import {
  DETECTED_LOCALE_STORAGE_KEY,
  MANUAL_LOCALE_STORAGE_KEY,
  isSupportedLocale,
  normalizeLocale,
  resolveInitialLocale,
} from "./locale-core";
import { detectInitialLocale } from "./locale.functions";

interface I18nContextValue {
  /** Single source of truth for the whole user journey. */
  locale: Locale;
  activeLocale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locales: typeof LOCALES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  if (typeof document !== "undefined") document.documentElement.lang = locale;
}

function getStoredManualLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  return normalizeLocale(window.localStorage.getItem(MANUAL_LOCALE_STORAGE_KEY)) as Locale | null;
}

function getStoredDetectedLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  return normalizeLocale(window.localStorage.getItem(DETECTED_LOCALE_STORAGE_KEY)) as Locale | null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    let cancelled = false;

    const manual = getStoredManualLocale();
    if (manual) {
      setLocaleState(manual);
      applyDocumentLocale(manual);
      return () => {
        cancelled = true;
      };
    }

    const detected = getStoredDetectedLocale();
    if (detected) {
      setLocaleState(detected);
      applyDocumentLocale(detected);
      return () => {
        cancelled = true;
      };
    }

    void detectInitialLocale()
      .then((result) => {
        if (cancelled || getStoredManualLocale()) return;
        const next = isSupportedLocale(result.locale) ? (result.locale as Locale) : "fr";
        setLocaleState(next);
        applyDocumentLocale(next);
        window.localStorage.setItem(DETECTED_LOCALE_STORAGE_KEY, next);
      })
      .catch(() => {
        if (cancelled || getStoredManualLocale()) return;
        const acceptLanguage = window.navigator.languages?.join(",") || window.navigator.language;
        const next = resolveInitialLocale({ acceptLanguage, fallback: "fr" }) as Locale;
        setLocaleState(next);
        applyDocumentLocale(next);
        window.localStorage.setItem(DETECTED_LOCALE_STORAGE_KEY, next);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = (next: Locale) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    if (typeof window !== "undefined") {
      // A manual choice always wins over IP/browser detection on every following page and refresh.
      window.localStorage.setItem(MANUAL_LOCALE_STORAGE_KEY, next);
    }
    applyDocumentLocale(next);
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[locale] ?? translations.fr;
    const fallback = translations.fr;
    const runtimeOverrides = FINAL_I18N_OVERRIDES[locale] ?? {};
    const frenchOverrides = FINAL_I18N_OVERRIDES.fr ?? {};
    return {
      locale,
      activeLocale: locale,
      setLocale,
      locales: LOCALES,
      t: (key, vars) => {
        const runtimeValue = runtimeOverrides[key];
        // Some override dictionaries intentionally inherit the French override object.
        // When the inherited value is still exactly French, prefer the existing native dictionary.
        const isInheritedFrench =
          locale !== "fr" &&
          runtimeValue !== undefined &&
          runtimeValue === frenchOverrides[key] &&
          (dict as Record<string, string>)[key] !== undefined;

        let str = (
          (isInheritedFrench ? undefined : runtimeValue) ??
          (dict as Record<string, string>)[key] ??
          runtimeValue ??
          frenchOverrides[key] ??
          (fallback as Record<string, string>)[key] ??
          key
        ) as string;
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
