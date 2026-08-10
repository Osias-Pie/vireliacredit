/**
 * Central brand + company configuration.
 * Change the values here to rename the platform everywhere.
 * `null` = information not yet provided by the client. Never invent a value.
 */

export const BRAND = {
  name: "Virelia Crédit",
  shortName: "Virelia",
  positioning: "Solutions de prêt claires, transparentes et adaptées à votre marché.",
  /** Reference prefix used for application numbers (VIR-2026-000001). */
  referencePrefix: "VIR",
  domain: "vireliacredit.lovable.app",
  siteUrl: "https://vireliacredit.lovable.app",
} as const;

/** Single source of truth for every contact detail displayed on the site. */
export const CONTACT = {
  /** General enquiries. */
  email: "contact@virelia-credit.com" as string | null,
  /** Inbox receiving loan applications / file follow-up. */
  applicationEmail: "dossiers@virelia-credit.com" as string | null,
  phone: null as string | null,
  whatsapp: null as string | null,
  address: null as string | null,
  hours: null as string | null,
} as const;

/** Legal identity — to be completed once the client provides official documents. */
export const LEGAL = {
  legalCompanyName: null as string | null,
  registrationNumber: null as string | null,
  /** e.g. regulator name + licence number. Never invent one. */
  regulatoryInformation: null as string | null,
  dataControllerContact: null as string | null,
} as const;

export const isMissing = (v: unknown) => v === null || v === undefined || v === "";
