/** ------------------------------------------------------------------
 *  LOAN CONFIGURATION — country independent.
 *  No geolocation, no market, no country rule. Everything a product
 *  needs lives here and can be edited in one single place.
 *  ------------------------------------------------------------------ */

/** Currencies the platform can quote in. Extensible. */
export const SUPPORTED_CURRENCIES = ["EUR", "CHF", "CAD"] as const;
export type LoanCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type FeeKind = "percent_of_amount" | "fixed" | "percent_monthly";

export interface FeeConfig {
  id: string;
  labelKey: string;
  kind: FeeKind;
  value: number;
}

export interface ProductPricing {
  /** annual nominal rate, in % — null while unknown */
  nominalRate: number | null;
  /** APR / TAEG, in % — null while unknown */
  apr: number | null;
  fees: FeeConfig[];
}

export interface InputRange {
  min: number;
  max: number;
  step: number;
}

/** ---- Processing speed + processing fee grid (centralised) ---- */

export const PROCESSING_SPEEDS = [
  "urgent",
  "24h",
  "48h",
  "3_5_business_days",
  "within_one_week",
] as const;
export type ProcessingSpeed = (typeof PROCESSING_SPEEDS)[number];

export interface ProcessingFeePolicy {
  enabled: boolean;
  /** the fee is never requested before the file has been studied */
  requiresPaymentBeforeProcessing: boolean;
  tiers: Record<ProcessingSpeed, number>;
}

export const PROCESSING_FEE_POLICY: ProcessingFeePolicy = {
  enabled: true,
  requiresPaymentBeforeProcessing: false,
  tiers: {
    urgent: 100,
    "24h": 98,
    "48h": 95,
    "3_5_business_days": 92,
    within_one_week: 90,
  },
};

/** ---- Products ---- */

export const LOAN_SLUGS = [
  "personal",
  "professional",
  "business",
  "housing",
  "studies",
  "project",
  "retired",
] as const;
export type LoanSlug = (typeof LOAN_SLUGS)[number];

export interface LoanProductConfig {
  slug: LoanSlug;
  enabled: boolean;
  amountRange: InputRange;
  durationRange: InputRange;
  /** null while the official commercial grid is not provided */
  pricing: ProductPricing | null;
  /** processing fee availability for this product */
  processingFee: boolean;
}

const DEFAULT_AMOUNT_RANGE: InputRange = { min: 1000, max: 100000, step: 500 };
const DEFAULT_DURATION_RANGE: InputRange = { min: 6, max: 120, step: 6 };

const product = (
  slug: LoanSlug,
  overrides: Partial<LoanProductConfig> = {},
): LoanProductConfig => ({
  slug,
  enabled: true,
  amountRange: { ...DEFAULT_AMOUNT_RANGE },
  durationRange: { ...DEFAULT_DURATION_RANGE },
  pricing: null,
  processingFee: true,
  ...overrides,
});

export const LOAN_PRODUCT_CONFIG: Record<LoanSlug, LoanProductConfig> = {
  personal: product("personal"),
  professional: product("professional"),
  business: product("business", {
    amountRange: { min: 2000, max: 250000, step: 1000 },
  }),
  housing: product("housing", {
    amountRange: { min: 2000, max: 150000, step: 1000 },
  }),
  studies: product("studies", {
    amountRange: { min: 1000, max: 60000, step: 500 },
  }),
  project: product("project"),
  retired: product("retired", {
    amountRange: { min: 1000, max: 50000, step: 500 },
    durationRange: { min: 6, max: 84, step: 6 },
  }),
};

export const enabledLoanSlugs = (): LoanSlug[] =>
  LOAN_SLUGS.filter((s) => LOAN_PRODUCT_CONFIG[s].enabled);

export const getLoanConfig = (slug: string): LoanProductConfig =>
  LOAN_PRODUCT_CONFIG[(slug as LoanSlug) in LOAN_PRODUCT_CONFIG ? (slug as LoanSlug) : "personal"];

export interface ResolvedProcessingFee {
  amount: number;
  requiresPaymentBeforeProcessing: boolean;
}

/**
 * Processing fee for a product + requested speed. Returns null when no fee
 * applies — callers must then render nothing.
 */
export function getProcessingFee(
  slug: string,
  speed: ProcessingSpeed,
): ResolvedProcessingFee | null {
  if (!PROCESSING_FEE_POLICY.enabled) return null;
  if (!getLoanConfig(slug).processingFee) return null;
  const amount = PROCESSING_FEE_POLICY.tiers[speed];
  if (amount == null) return null;
  return {
    amount,
    requiresPaymentBeforeProcessing:
      PROCESSING_FEE_POLICY.requiresPaymentBeforeProcessing,
  };
}

/** ---- Employment situation ---- */

export const EMPLOYMENT_STATUSES = [
  "employee",
  "self_employed",
  "business_owner",
  "retired",
  "other",
] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

/** Documents requested, depending on the declared situation only. */
export const BASE_DOCUMENTS = ["documents.id", "documents.address"];

export const DOCUMENTS_BY_STATUS: Record<EmploymentStatus, string[]> = {
  employee: [...BASE_DOCUMENTS, "documents.payslip"],
  self_employed: [...BASE_DOCUMENTS, "documents.pro_income"],
  business_owner: [...BASE_DOCUMENTS, "documents.pro_income"],
  retired: [...BASE_DOCUMENTS, "documents.pension"],
  other: [...BASE_DOCUMENTS, "documents.income"],
};

export const ELIGIBILITY_CRITERIA = [
  "eligibility.age",
  "eligibility.accurate_info",
  "eligibility.documents",
  "eligibility.product_criteria",
  "eligibility.repayment_study",
  "eligibility.accept_terms",
];

/** Currency formatting — never a hardcoded symbol. */
export function formatMoney(
  amount: number,
  currency: string,
  locale = "fr-FR",
  opts: Intl.NumberFormatOptions = {},
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      ...opts,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}
