import type { Locale } from "@/lib/i18n/translations";

/** ---------------------------------------------------------------
 *  MARKET CONFIGURATION
 *  Nothing financial is hardcoded inside React components.
 *  Everything a market needs lives here and can be replaced as soon
 *  as the client provides its official commercial grid.
 *  --------------------------------------------------------------- */

export const MARKET_CODES = ["FR", "DE", "ES", "PT", "CH", "CA"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

export type CurrencyCode = "EUR" | "CHF" | "CAD";

/** When a cost is actually paid. */
export type PaymentTiming =
  | "upfront"
  | "signature"
  | "deducted"
  | "monthly"
  | "event"
  | "other";

export type FeeKind =
  /** percentage of the borrowed amount */
  | "percent_of_amount"
  /** fixed amount in the market currency */
  | "fixed"
  /** percentage of the borrowed amount charged every month */
  | "percent_monthly";

export interface FeeConfig {
  id: string;
  /** i18n key describing the fee */
  labelKey: string;
  kind: FeeKind;
  value: number;
  paymentTiming: PaymentTiming;
}

export interface ProductPricing {
  minAmount: number;
  maxAmount: number;
  /** available durations, in months */
  durations: number[];
  /** annual nominal rate, in % — null while unknown */
  nominalRate: number | null;
  /** APR / TAEG, in % — null while unknown */
  apr: number | null;
  fees: FeeConfig[];
  /** market/product specific regulatory sentence, provided by the client */
  legalNotice: string | null;
}

export interface MarketConfig {
  code: MarketCode;
  currency: CurrencyCode;
  /** languages actually offered on this market */
  languages: Locale[];
  defaultLanguage: Locale;
  enabled: boolean;
  /** BCP-47 tags used for hreflang */
  hreflang: string[];
  minimumAge: number;
  /** loan product slugs available on this market */
  products: string[];
  /** pricing per product slug — null until the client provides real values */
  pricing: Record<string, ProductPricing | null>;
  /** i18n keys of documents usually required */
  documents: string[];
  /** i18n keys of eligibility criteria */
  eligibility: string[];
  /** regulatory text supplied by the client */
  legalNotice: string | null;
}

const COMMON_DOCUMENTS = [
  "documents.id",
  "documents.address",
  "documents.income",
  "documents.activity",
  "documents.statements",
];

const COMMON_ELIGIBILITY = [
  "eligibility.age",
  "eligibility.residence",
  "eligibility.accurate_info",
  "eligibility.documents",
  "eligibility.product_criteria",
  "eligibility.repayment_study",
  "eligibility.accept_terms",
];

const ALL_PRODUCTS = [
  "personal",
  "professional",
  "business",
  "housing",
  "studies",
  "project",
];

/** No real rate, fee or tax is declared yet — every entry is intentionally null. */
const noPricing = (): Record<string, ProductPricing | null> =>
  Object.fromEntries(ALL_PRODUCTS.map((p) => [p, null]));

function market(
  code: MarketCode,
  currency: CurrencyCode,
  languages: Locale[],
  defaultLanguage: Locale,
  hreflang: string[],
  overrides: Partial<MarketConfig> = {},
): MarketConfig {
  return {
    code,
    currency,
    languages,
    defaultLanguage,
    hreflang,
    enabled: true,
    minimumAge: 18,
    products: ALL_PRODUCTS,
    pricing: noPricing(),
    documents: COMMON_DOCUMENTS,
    eligibility: COMMON_ELIGIBILITY,
    legalNotice: null,
    ...overrides,
  };
}

export const MARKETS: Record<MarketCode, MarketConfig> = {
  FR: market("FR", "EUR", ["fr"], "fr", ["fr-FR"]),
  DE: market("DE", "EUR", ["de"], "de", ["de-DE"]),
  ES: market("ES", "EUR", ["es"], "es", ["es-ES"]),
  PT: market("PT", "EUR", ["pt"], "pt", ["pt-PT"]),
  CH: market("CH", "CHF", ["fr", "de", "it"], "de", ["fr-CH", "de-CH", "it-CH"]),
  CA: market("CA", "CAD", ["fr", "en"], "en", ["fr-CA", "en-CA"]),
};

export const ENABLED_MARKETS = MARKET_CODES.map((c) => MARKETS[c]).filter(
  (m) => m.enabled,
);

export const isSupportedMarket = (code: string | null | undefined): code is MarketCode =>
  !!code && (MARKET_CODES as readonly string[]).includes(code.toUpperCase());

export const getMarket = (code: MarketCode) => MARKETS[code];

/** Country flags, only used for display in the selector. */
export const MARKET_FLAGS: Record<MarketCode, string> = {
  FR: "🇫🇷",
  DE: "🇩🇪",
  ES: "🇪🇸",
  PT: "🇵🇹",
  CH: "🇨🇭",
  CA: "🇨🇦",
};

/**
 * Pick the best language for a market given the browser preferences.
 * Country and language stay two independent settings.
 */
export function pickLanguageForMarket(
  m: MarketConfig,
  browserLanguages: readonly string[] = [],
): Locale {
  for (const raw of browserLanguages) {
    const code = raw.slice(0, 2).toLowerCase() as Locale;
    if (m.languages.includes(code)) return code;
  }
  return m.defaultLanguage;
}

/** Currency formatting driven by the market — never a hardcoded symbol. */
export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale = "fr-FR",
  opts: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...opts,
  }).format(amount);
}
