import {
  Wallet, Briefcase, Building2, Home, GraduationCap, Lightbulb, HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Loan solutions (repayable loans). Commercial conditions live in src/config/loans.ts. */
export interface LoanProduct {
  slug: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  title: string;
  description: string;
  gradient: string;
  audienceKey: string;
  audience: string;
}

const BRAND_GRADIENT = "from-[#0B2A5B] to-[#0B2A5B]";

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    slug: "personal",
    icon: Wallet,
    titleKey: "product.personal.title",
    descKey: "product.personal.desc",
    title: "Prêt personnel",
    description: "Un prêt remboursable pour financer un besoin privé : équipement, imprévu, mobilité ou consolidation.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.personal.audience",
    audience: "Particuliers",
  },
  {
    slug: "professional",
    icon: Briefcase,
    titleKey: "product.professional.title",
    descKey: "product.professional.desc",
    title: "Prêt professionnel",
    description: "Financement remboursable destiné aux indépendants et professions libérales pour leur activité.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.professional.audience",
    audience: "Indépendants",
  },
  {
    slug: "business",
    icon: Building2,
    titleKey: "product.business.title",
    descKey: "product.business.desc",
    title: "Prêt entreprise",
    description: "Prêt remboursable pour les TPE et PME : trésorerie, équipement ou développement commercial.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.business.audience",
    audience: "TPE & PME",
  },
  {
    slug: "housing",
    icon: Home,
    titleKey: "product.housing.title",
    descKey: "product.housing.desc",
    title: "Prêt travaux et habitat",
    description: "Financement remboursable pour la rénovation, l'aménagement ou l'amélioration d'un logement.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.housing.audience",
    audience: "Propriétaires & locataires",
  },
  {
    slug: "studies",
    icon: GraduationCap,
    titleKey: "product.studies.title",
    descKey: "product.studies.desc",
    title: "Prêt études",
    description: "Prêt remboursable pour financer une formation, un cursus supérieur ou une certification.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.studies.audience",
    audience: "Étudiants & apprenants",
  },
  {
    slug: "project",
    icon: Lightbulb,
    titleKey: "product.project.title",
    descKey: "product.project.desc",
    title: "Prêt projet",
    description: "Financement remboursable pour un projet identifié, présenté et documenté par l'emprunteur.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.project.audience",
    audience: "Porteurs de projet",
  },
  {
    slug: "retired",
    icon: HeartHandshake,
    titleKey: "product.retired.title",
    descKey: "product.retired.desc",
    title: "Prêt retraité",
    description: "Une solution de financement destinée aux retraités, sous réserve de l'étude individuelle du dossier et des justificatifs transmis.",
    gradient: BRAND_GRADIENT,
    audienceKey: "product.retired.audience",
    audience: "Retraités",
  },
];

export const getLoanProductBySlug = (slug: string) => LOAN_PRODUCTS.find((p) => p.slug === slug);

/** @deprecated kept for backward compatibility with existing imports. */
export const PROGRAMS = LOAN_PRODUCTS;
export const getProgramBySlug = getLoanProductBySlug;
