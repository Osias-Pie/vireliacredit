export type ProfileLoanType =
  | "personal"
  | "professional"
  | "business"
  | "housing"
  | "studies"
  | "project"
  | "retired";

export type ProfileRoleKey =
  | "administrative_manager"
  | "shop_owner"
  | "independent_architect"
  | "digital_consultant"
  | "sme_director"
  | "entrepreneur"
  | "liberal_professional"
  | "technical_manager"
  | "master_student"
  | "project_leader"
  | "retired_woman"
  | "retired_man";

export type ProfileTextKey =
  | "profile_01"
  | "profile_02"
  | "profile_03"
  | "profile_04"
  | "profile_05"
  | "profile_06"
  | "profile_07"
  | "profile_08"
  | "profile_09"
  | "profile_10"
  | "profile_11"
  | "profile_12";

export interface LoanProfileCard {
  id: string;
  image: string;
  name: string;
  roleKey: ProfileRoleKey;
  location: string;
  textKey: ProfileTextKey;
  loanType: ProfileLoanType;
  rating: 5;
  /** Development/demo content only. Replace with verified customer material before presenting as testimonials. */
  isDemo: true;
  objectPosition?: string;
}

/**
 * Demonstration profiles used to validate the premium grid layout.
 * Replace image files and copy with verified customer material when available.
 * These entries must never be labelled as verified reviews.
 */
export const LOAN_PROFILE_CARDS: LoanProfileCard[] = [
  {
    id: "profile-01",
    image: "/testimonials/profile-01.webp",
    name: "Camille Renaud",
    roleKey: "administrative_manager",
    location: "Lyon, France",
    textKey: "profile_01",
    loanType: "personal",
    rating: 5,
    isDemo: true,
    objectPosition: "center 30%",
  },
  {
    id: "profile-02",
    image: "/testimonials/profile-02.webp",
    name: "Sofia Almeida",
    roleKey: "shop_owner",
    location: "Porto, Portugal",
    textKey: "profile_02",
    loanType: "personal",
    rating: 5,
    isDemo: true,
    objectPosition: "center 28%",
  },
  {
    id: "profile-03",
    image: "/testimonials/profile-03.webp",
    name: "Daniel Krüger",
    roleKey: "independent_architect",
    location: "Munich, Germany",
    textKey: "profile_03",
    loanType: "professional",
    rating: 5,
    isDemo: true,
    objectPosition: "center 26%",
  },
  {
    id: "profile-04",
    image: "/testimonials/profile-04.webp",
    name: "Lucia Ferri",
    roleKey: "digital_consultant",
    location: "Turin, Italy",
    textKey: "profile_04",
    loanType: "professional",
    rating: 5,
    isDemo: true,
    objectPosition: "center 32%",
  },
  {
    id: "profile-05",
    image: "/testimonials/profile-05.webp",
    name: "Élise Vanier",
    roleKey: "sme_director",
    location: "Brussels, Belgium",
    textKey: "profile_05",
    loanType: "business",
    rating: 5,
    isDemo: true,
    objectPosition: "center 30%",
  },
  {
    id: "profile-06",
    image: "/testimonials/profile-06.webp",
    name: "Marko Radić",
    roleKey: "entrepreneur",
    location: "Zagreb, Croatia",
    textKey: "profile_06",
    loanType: "business",
    rating: 5,
    isDemo: true,
    objectPosition: "center 28%",
  },
  {
    id: "profile-07",
    image: "/testimonials/profile-07.webp",
    name: "Ana Pereira",
    roleKey: "liberal_professional",
    location: "Lisbon, Portugal",
    textKey: "profile_07",
    loanType: "housing",
    rating: 5,
    isDemo: true,
    objectPosition: "center 30%",
  },
  {
    id: "profile-08",
    image: "/testimonials/profile-08.webp",
    name: "Thomas Frei",
    roleKey: "technical_manager",
    location: "Basel, Switzerland",
    textKey: "profile_08",
    loanType: "housing",
    rating: 5,
    isDemo: true,
    objectPosition: "center 27%",
  },
  {
    id: "profile-09",
    image: "/testimonials/profile-09.webp",
    name: "Clara Neumann",
    roleKey: "master_student",
    location: "Berlin, Germany",
    textKey: "profile_09",
    loanType: "studies",
    rating: 5,
    isDemo: true,
    objectPosition: "center 25%",
  },
  {
    id: "profile-10",
    image: "/testimonials/profile-10.webp",
    name: "Marta Salas",
    roleKey: "project_leader",
    location: "Valencia, Spain",
    textKey: "profile_10",
    loanType: "project",
    rating: 5,
    isDemo: true,
    objectPosition: "center 30%",
  },
  {
    id: "profile-11",
    image: "/testimonials/profile-11.webp",
    name: "Jeanne Perrin",
    roleKey: "retired_woman",
    location: "Nantes, France",
    textKey: "profile_11",
    loanType: "retired",
    rating: 5,
    isDemo: true,
    objectPosition: "center 25%",
  },
  {
    id: "profile-12",
    image: "/testimonials/profile-12.webp",
    name: "Rui Fonseca",
    roleKey: "retired_man",
    location: "Coimbra, Portugal",
    textKey: "profile_12",
    loanType: "retired",
    rating: 5,
    isDemo: true,
    objectPosition: "center 28%",
  },
];
