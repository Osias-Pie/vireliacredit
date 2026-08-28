export const SUPPORTED_LOCALES = ["fr", "en", "de", "es", "pt", "it", "hr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const MANUAL_LOCALE_STORAGE_KEY = "app.locale";
export const DETECTED_LOCALE_STORAGE_KEY = "app.locale.detected";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value?: string | null): SupportedLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace("_", "-").split("-")[0];
  return isSupportedLocale(normalized) ? normalized : null;
}

export function parseAcceptLanguage(value?: string | null): SupportedLocale | null {
  if (!value) return null;
  const candidates = value
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qRaw = params.find((param) => param.trim().startsWith("q="));
      const q = qRaw ? Number(qRaw.trim().slice(2)) : 1;
      return { locale: normalizeLocale(tag), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item): item is { locale: SupportedLocale; q: number } => Boolean(item.locale))
    .sort((a, b) => b.q - a.q);
  return candidates[0]?.locale ?? null;
}

export function countryToLocale(
  countryCode?: string | null,
  browserLocale?: SupportedLocale | null,
): SupportedLocale | null {
  const country = countryCode?.trim().toUpperCase();
  if (!country) return null;

  switch (country) {
    case "FR":
    case "BE":
      return "fr";
    case "CH":
    case "CA":
      return browserLocale ?? "fr";
    case "DE":
    case "AT":
      return "de";
    case "ES":
      return "es";
    case "PT":
      return "pt";
    case "IT":
      return "it";
    case "HR":
      return "hr";
    default:
      return null;
  }
}

export function resolveInitialLocale({
  country,
  acceptLanguage,
  fallback = "fr",
}: {
  country?: string | null;
  acceptLanguage?: string | null;
  fallback?: SupportedLocale;
}): SupportedLocale {
  const browserLocale = parseAcceptLanguage(acceptLanguage);
  const mapped = countryToLocale(country, browserLocale);
  if (mapped) return mapped;
  if (browserLocale) return browserLocale;
  return country ? "en" : fallback;
}

export function resolveLocalePriority({
  manual,
  detected,
  country,
  acceptLanguage,
  fallback = "fr",
}: {
  manual?: string | null;
  detected?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  fallback?: SupportedLocale;
}): SupportedLocale {
  return (
    normalizeLocale(manual) ??
    normalizeLocale(detected) ??
    resolveInitialLocale({ country, acceptLanguage, fallback })
  );
}
