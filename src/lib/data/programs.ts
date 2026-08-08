import {
  Wallet, Briefcase, Building2, Home, GraduationCap, Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Loan solutions (repayable loans). Commercial conditions live in src/config/markets.ts. */
export interface LoanProduct {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  audience: string;
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    slug: "personal",
    icon: Wallet,
    title: "Prêt personnel",
    description:
      "Un prêt remboursable pour financer un besoin privé : équipement, imprévu, mobilité ou consolidation.",
    gradient: "from-[oklch(0.42_0.13_253)] to-[oklch(0.55_0.14_240)]",
    audience: "Particuliers",
  },
  {
    slug: "professional",
    icon: Briefcase,
    title: "Prêt professionnel",
    description:
      "Financement remboursable destiné aux indépendants et professions libérales pour leur activité.",
    gradient: "from-[oklch(0.5_0.14_240)] to-[oklch(0.65_0.13_220)]",
    audience: "Indépendants",
  },
  {
    slug: "business",
    icon: Building2,
    title: "Prêt entreprise",
    description:
      "Prêt remboursable pour les TPE et PME : trésorerie, équipement ou développement commercial.",
    gradient: "from-[oklch(0.32_0.11_255)] to-[oklch(0.45_0.13_245)]",
    audience: "TPE & PME",
  },
  {
    slug: "housing",
    icon: Home,
    title: "Prêt travaux et habitat",
    description:
      "Financement remboursable pour la rénovation, l'aménagement ou l'amélioration d'un logement.",
    gradient: "from-[oklch(0.6_0.14_150)] to-[oklch(0.72_0.13_130)]",
    audience: "Propriétaires & locataires",
  },
  {
    slug: "studies",
    icon: GraduationCap,
    title: "Prêt études",
    description:
      "Prêt remboursable pour financer une formation, un cursus supérieur ou une certification.",
    gradient: "from-[oklch(0.78_0.13_78)] to-[oklch(0.7_0.14_60)]",
    audience: "Étudiants & apprenants",
  },
  {
    slug: "project",
    icon: Lightbulb,
    title: "Prêt projet",
    description:
      "Financement remboursable pour un projet identifié, présenté et documenté par l'emprunteur.",
    gradient: "from-[oklch(0.6_0.2_25)] to-[oklch(0.72_0.15_40)]",
    audience: "Porteurs de projet",
  },
];

export const getLoanProductBySlug = (slug: string) =>
  LOAN_PRODUCTS.find((p) => p.slug === slug);

/** @deprecated kept for backward compatibility with existing imports. */
export const PROGRAMS = LOAN_PRODUCTS;
export const getProgramBySlug = getLoanProductBySlug;
