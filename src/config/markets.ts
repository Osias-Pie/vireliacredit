import type { Locale } from "@/lib/i18n/translations";

/** ---------------------------------------------------------------
 *  MARKET CONFIGURATION
 *  Nothing financial is hardcoded inside React components.
 *  Everything a market needs lives here and can be replaced as soon
 *  as the client provides its official commercial grid.
 *  --------------------------------------------------------------- */

export const MARKET_CODES = ["FR", "DE", "ES", "PT", "CH", "CA", "HR"] as const;
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
  /** APR / TAEG / EKS, in % — null while unknown */
  apr: number | null;
  fees: FeeConfig[];
  /** market/product specific regulatory sentence, provided by the client */
  legalNotice: string | null;
}

/** ------------------------------------------------------------------
 *  PROCESSING SPEED + PROCESSING FEES
 *  The commercial grid below is CENTRALISED here on purpose.
 *  Never duplicate these amounts inside a component.
 *  ------------------------------------------------------------------ */

export const PROCESSING_SPEEDS = [
  "urgent",
  "24h",
  "48h",
  "3_5_business_days",
  "within_one_week",
] as const;
export type ProcessingSpeed = (typeof PROCESSING_SPEEDS)[number];

export interface ProcessingFeeTier {
  speed: ProcessingSpeed;
  /** amount expressed in the policy currency */
  fee: number;
}

export interface ProcessingFeePolicy {
  /** When false, no processing fee exists for this market/product. */
  enabled: boolean;
  currency: CurrencyCode;
  /** When false, the fee is never requested before the file is studied. */
  requiresPaymentBeforeProcessing: boolean;
  /** Optional i18n key overriding the default wording. */
  labelKey?: string;
  tiers: ProcessingFeeTier[];
}

/** Current commercial grid — editable in one place. */
export const DEFAULT_PROCESSING_FEE_TIERS: ProcessingFeeTier[] = [
  { speed: "urgent", fee: 100 },
  { speed: "24h", fee: 98 },
  { speed: "48h", fee: 95 },
  { speed: "3_5_business_days", fee: 92 },
  { speed: "within_one_week", fee: 90 },
];

const feePolicy = (
  currency: CurrencyCode,
  enabled: boolean,
  requiresPaymentBeforeProcessing = enabled,
): ProcessingFeePolicy => ({
  enabled,
  currency,
  requiresPaymentBeforeProcessing,
  tiers: DEFAULT_PROCESSING_FEE_TIERS.map((t) => ({ ...t })),
});

/** Per-product configuration inside a market. */
export interface ProductConfig {
  slug: string;
  enabled: boolean;
  /** null while the client has not provided its commercial grid */
  pricing: ProductPricing | null;
  /** null = no processing fee policy defined for this market/product */
  processingFeePolicy: ProcessingFeePolicy | null;
}

/** UI bounds used by the simulator sliders. Not a commercial commitment. */
export interface InputRange {
  min: number;
  max: number;
  step: number;
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
  /** loan products available on this market, keyed by slug */
  products: Record<string, ProductConfig>;
  /** simulator input bounds (UI only) */
  amountRange: InputRange;
  durationRange: InputRange;
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

export const ALL_PRODUCTS = [
  "personal",
  "professional",
  "business",
  "housing",
  "studies",
  "project",
  "retired",
] as const;

const DEFAULT_AMOUNT_RANGE: InputRange = { min: 1000, max: 100000, step: 500 };
const DEFAULT_DURATION_RANGE: InputRange = { min: 6, max: 120, step: 6 };

/**
 * No rate, tax or duration is invented: pricing stays null until the client
 * provides its official grid. Only the processing-fee policy — which is a
 * service option, not a credit condition — carries real values, and it is
 * activated market by market.
 */
function buildProducts(
  currency: CurrencyCode,
  feesEnabled: boolean,
  overrides: Record<string, Partial<ProductConfig>> = {},
): Record<string, ProductConfig> {
  return Object.fromEntries(
    ALL_PRODUCTS.map((slug) => [
      slug,
      {
        slug,
        enabled: true,
        pricing: null,
        processingFeePolicy: feePolicy(currency, feesEnabled),
        ...(overrides[slug] ?? {}),
      } satisfies ProductConfig,
    ]),
  );
}

function market(
  code: MarketCode,
  currency: CurrencyCode,
  languages: Locale[],
  defaultLanguage: Locale,
  hreflang: string[],
  feesEnabled: boolean,
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
    products: buildProducts(currency, feesEnabled),
    amountRange: DEFAULT_AMOUNT_RANGE,
    durationRange: DEFAULT_DURATION_RANGE,
    documents: COMMON_DOCUMENTS,
    eligibility: COMMON_ELIGIBILITY,
    legalNotice: null,
    ...overrides,
  };
}

/**
 * Processing fees are only switched on where the client has confirmed the
 * practice is lawful and documented. Croatia is the priority market.
 * Everywhere else the policy exists but stays disabled — the simulator and
 * the form must work identically with `enabled: false`.
 */
export const MARKETS: Record<MarketCode, MarketConfig> = {
  FR: market("FR", "EUR", ["fr"], "fr", ["fr-FR"], false),
  DE: market("DE", "EUR", ["de"], "de", ["de-DE"], false),
  ES: market("ES", "EUR", ["es"], "es", ["es-ES"], false),
  PT: market("PT", "EUR", ["pt"], "pt", ["pt-PT"], false),
  CH: market("CH", "CHF", ["fr", "de", "it"], "de", ["fr-CH", "de-CH", "it-CH"], false),
  CA: market("CA", "CAD", ["fr", "en"], "en", ["fr-CA", "en-CA"], false),
  HR: market("HR", "EUR", ["hr", "en"], "hr", ["hr-HR"], true),
};

export const ENABLED_MARKETS = MARKET_CODES.map((c) => MARKETS[c]).filter(
  (m) => m.enabled,
);

export const isSupportedMarket = (code: string | null | undefined): code is MarketCode =>
  !!code && (MARKET_CODES as readonly string[]).includes(code.toUpperCase());

export const getMarket = (code: MarketCode) => MARKETS[code];

/** Slugs actually offered on a market. */
export const marketProductSlugs = (m: MarketConfig): string[] =>
  Object.values(m.products)
    .filter((p) => p.enabled)
    .map((p) => p.slug);

export const getProductConfig = (
  m: MarketConfig,
  slug: string,
): ProductConfig | null => m.products[slug] ?? null;

export const getPricing = (m: MarketConfig, slug: string): ProductPricing | null =>
  m.products[slug]?.pricing ?? null;

export interface ResolvedProcessingFee {
  amount: number;
  currency: CurrencyCode;
  requiresPaymentBeforeProcessing: boolean;
}

/**
 * Resolve the processing fee for a market / product / speed combination.
 * Returns null whenever no fee applies — callers must render nothing then.
 */
export function getProcessingFee(
  m: MarketConfig,
  slug: string,
  speed: ProcessingSpeed,
): ResolvedProcessingFee | null {
  const policy = m.products[slug]?.processingFeePolicy;
  if (!policy || !policy.enabled) return null;
  const tier = policy.tiers.find((t) => t.speed === speed);
  if (!tier) return null;
  return {
    amount: tier.fee,
    currency: policy.currency,
    requiresPaymentBeforeProcessing: policy.requiresPaymentBeforeProcessing,
  };
}

/** Documents requested depending on the declared employment situation. */
export const EMPLOYMENT_STATUSES = [
  "employee",
  "self_employed",
  "business_owner",
  "retired",
  "other",
] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const DOCUMENTS_BY_STATUS: Record<EmploymentStatus, string[]> = {
  employee: ["documents.id", "documents.address", "documents.payslip"],
  self_employed: ["documents.id", "documents.address", "documents.pro_income"],
  business_owner: ["documents.id", "documents.address", "documents.pro_income"],
  retired: ["documents.id", "documents.address", "documents.pension"],
  other: ["documents.id", "documents.address", "documents.income"],
};

/** Country flags, only used for display in the selector. */
export const MARKET_FLAGS: Record<MarketCode, string> = {
  FR: "🇫🇷",
  DE: "🇩🇪",
  ES: "🇪🇸",
  PT: "🇵🇹",
  CH: "🇨🇭",
  CA: "🇨🇦",
  HR: "🇭🇷",
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
