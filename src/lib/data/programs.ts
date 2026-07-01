import {
  Briefcase, Home, GraduationCap, Sprout, Building2, Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Program {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  maxAmountEUR: number;
  gradient: string;
  audience: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "entrepreneur",
    icon: Briefcase,
    title: "Programme Entrepreneurs",
    description:
      "Financement dédié à la création et au développement d'entreprises innovantes, TPE et startups à impact.",
    maxAmountEUR: 250000,
    gradient: "from-[oklch(0.42_0.13_253)] to-[oklch(0.55_0.14_240)]",
    audience: "Créateurs d'entreprise",
  },
  {
    slug: "immobilier",
    icon: Home,
    title: "Programme Habitat",
    description:
      "Accès facilité au financement pour l'acquisition, la rénovation ou l'aménagement d'un logement principal.",
    maxAmountEUR: 400000,
    gradient: "from-[oklch(0.5_0.14_240)] to-[oklch(0.65_0.13_220)]",
    audience: "Particuliers",
  },
  {
    slug: "education",
    icon: GraduationCap,
    title: "Programme Éducation",
    description:
      "Bourses et financements pour les études supérieures, formations professionnelles et certifications internationales.",
    maxAmountEUR: 80000,
    gradient: "from-[oklch(0.78_0.13_78)] to-[oklch(0.7_0.14_60)]",
    audience: "Étudiants & apprenants",
  },
  {
    slug: "agriculture",
    icon: Sprout,
    title: "Programme Agriculture",
    description:
      "Soutien aux exploitants agricoles, coopératives et projets d'agriculture durable et responsable.",
    maxAmountEUR: 150000,
    gradient: "from-[oklch(0.6_0.14_150)] to-[oklch(0.72_0.13_130)]",
    audience: "Exploitants agricoles",
  },
  {
    slug: "pme",
    icon: Building2,
    title: "Programme PME",
    description:
      "Financement de croissance pour les petites et moyennes entreprises souhaitant se développer à l'international.",
    maxAmountEUR: 500000,
    gradient: "from-[oklch(0.32_0.11_255)] to-[oklch(0.45_0.13_245)]",
    audience: "PME établies",
  },
  {
    slug: "social",
    icon: Heart,
    title: "Programme Solidaire",
    description:
      "Programme d'aide aux associations, ONG et projets sociaux à fort impact communautaire.",
    maxAmountEUR: 120000,
    gradient: "from-[oklch(0.6_0.2_25)] to-[oklch(0.72_0.15_40)]",
    audience: "Associations & ONG",
  },
];

export const getProgramBySlug = (slug: string) =>
  PROGRAMS.find((p) => p.slug === slug);
