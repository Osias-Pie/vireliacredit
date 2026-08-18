import {
  Wallet, Briefcase, Building2, Home, GraduationCap, Lightbulb, HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Loan solutions (repayable loans). Commercial conditions live in src/config/loans.ts. */
export interface LoanProduct {
  slug: string;
  icon: LucideIcon;
  /** i18n keys — the French strings below are only a fallback. */
  titleKey: string;
  descKey: string;
  title: string;
  description: string;
  gradient: string;
  audienceKey: string;
  audience: string;
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    slug: "personal",
    icon: Wallet,
    titleKey: "product.personal.title",
    descKey: "product.personal.desc",
    title: "Prêt personnel",
    description:
      "Un prêt remboursable pour financer un besoin privé : équipement, imprévu, mobilité ou consolidation.",
    gradient: "from-[oklch(0.32_0.06_205)] to-[oklch(0.48_0.08_192)]",
    audienceKey: "product.personal.audience",
    audience: "Particuliers",
  },
  {
    slug: "professional",
    icon: Briefcase,
    titleKey: "product.professional.title",
    descKey: "product.professional.desc",
    title: "Prêt professionnel",
    description:
      "Financement remboursable destiné aux indépendants et professions libérales pour leur activité.",
    gradient: "from-[oklch(0.42_0.07_195)] to-[oklch(0.56_0.08_186)]",
    audienceKey: "product.professional.audience",
    audience: "Indépendants",
  },
  {
    slug: "business",
    icon: Building2,
    titleKey: "product.business.title",
    descKey: "product.business.desc",
    title: "Prêt entreprise",
    description:
      "Prêt remboursable pour les TPE et PME : trésorerie, équipement ou développement commercial.",
    gradient: "from-[oklch(0.28_0.05_208)] to-[oklch(0.42_0.07_198)]",
    audienceKey: "product.business.audience",
    audience: "TPE & PME",
  },
  {
    slug: "housing",
    icon: Home,
    titleKey: "product.housing.title",
    descKey: "product.housing.desc",
    title: "Prêt travaux et habitat",
    description:
      "Financement remboursable pour la rénovation, l'aménagement ou l'amélioration d'un logement.",
    gradient: "from-[oklch(0.45_0.08_180)] to-[oklch(0.60_0.08_170)]",
    audienceKey: "product.housing.audience",
    audience: "Propriétaires & locataires",
  },
  {
    slug: "studies",
    icon: GraduationCap,
    titleKey: "product.studies.title",
    descKey: "product.studies.desc",
    title: "Prêt études",
    description:
      "Prêt remboursable pour financer une formation, un cursus supérieur ou une certification.",
    gradient: "from-[oklch(0.72_0.09_80)] to-[oklch(0.62_0.10_66)]",
    audienceKey: "product.studies.audience",
    audience: "Étudiants & apprenants",
  },
  {
    slug: "project",
    icon: Lightbulb,
    titleKey: "product.project.title",
    descKey: "product.project.desc",
    title: "Prêt projet",
    description:
      "Financement remboursable pour un projet identifié, présenté et documenté par l'emprunteur.",
    gradient: "from-[oklch(0.66_0.10_60)] to-[oklch(0.55_0.09_48)]",
    audienceKey: "product.project.audience",
    audience: "Porteurs de projet",
  },
  {
    slug: "retired",
    icon: HeartHandshake,
    titleKey: "product.retired.title",
    descKey: "product.retired.desc",
    title: "Prêt retraité",
    description:
      "Une solution de financement destinée aux retraités disposant de revenus réguliers, sous réserve de l'étude de leur situation et des conditions applicables dans leur pays.",
    gradient: "from-[oklch(0.36_0.06_200)] to-[oklch(0.62_0.09_176)]",
    audienceKey: "product.retired.audience",
    audience: "Retraités",
  },
];

export const getLoanProductBySlug = (slug: string) =>
  LOAN_PRODUCTS.find((p) => p.slug === slug);

/** @deprecated kept for backward compatibility with existing imports. */
export const PROGRAMS = LOAN_PRODUCTS;
export const getProgramBySlug = getLoanProductBySlug;
