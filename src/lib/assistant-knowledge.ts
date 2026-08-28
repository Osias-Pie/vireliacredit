import { PROCESSING_FEE_POLICY } from "@/config/loans";
import { STATUS_LABEL_FR } from "@/lib/status";

export interface AssistantKnowledgeContext {
  page?: string;
  step?: number;
  professionalStatus?: string;
  missingFields?: string[];
  reference?: string;
  status?: string;
  public_messages?: string[];
  missing_public_requirements?: string;
}

const PRODUCTS = [
  "Prêt personnel",
  "Prêt professionnel",
  "Prêt entreprise",
  "Prêt travaux et habitat",
  "Prêt études",
  "Prêt projet",
  "Prêt retraité",
];

const SPEED_LABELS: Record<string, string> = {
  urgent: "Urgent",
  "24h": "24 h",
  "48h": "48 h",
  "3_5_business_days": "3 à 5 jours ouvrés",
  within_one_week: "Sous une semaine",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .trim();
}

export function containsSensitiveBankData(message: string): boolean {
  const compact = message.replace(/\s+/g, " ").trim();
  const withoutSpaces = compact.replace(/\s/g, "");
  const ibanLike = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i.test(withoutSpaces);
  const bankKeyword = /\b(iban|swift|bic|num[eé]ro de compte|account number|bank account)\b/i.test(compact);
  const longAccountLike = /\b\d{10,34}\b/.test(compact.replace(/[ .-]/g, ""));
  return ibanLike || (bankKeyword && longAccountLike);
}

function feesAnswer() {
  const tiers = PROCESSING_FEE_POLICY.tiers;
  const lines = Object.entries(tiers).map(
    ([speed, amount]) => `${SPEED_LABELS[speed] ?? speed} : ${amount}`,
  );
  return `Les frais de traitement configurés dépendent du délai choisi : ${lines.join(", ")}. Le montant est appliqué dans la devise sélectionnée dans le formulaire. Ces frais ne garantissent jamais l'obtention du prêt et ne sont pas demandés avant l'étude du dossier.`;
}

function statusAnswer(status?: string) {
  if (status) {
    const label = STATUS_LABEL_FR[status as keyof typeof STATUS_LABEL_FR] ?? status.replaceAll("_", " ");
    return `Le statut actuel de votre dossier est « ${label} ». Le suivi affiche uniquement les informations publiques du dossier. Une décision définitive reste du ressort de l'équipe Virelia Crédit.`;
  }
  return "Les principaux statuts correspondent à la réception de la demande, la vérification du dossier, l'analyse, une éventuelle demande de complément, la préparation ou validation du contrat, puis la décision et la suite du dossier. Consultez /suivi avec votre référence VIR et votre e-mail pour connaître votre statut réel.";
}

export function answerFromVireliaKnowledge(
  message: string,
  ctx: AssistantKnowledgeContext = {},
  locale = "fr",
): string {
  if (containsSensitiveBankData(message)) {
    return locale === "fr"
      ? "Je ne peux pas traiter ni transmettre une coordonnée bancaire. Saisissez votre IBAN, numéro de compte ou SWIFT uniquement dans l'étape sécurisée prévue dans le formulaire."
      : "I cannot process or transmit bank details. Enter your IBAN, account number or SWIFT only in the secure form step.";
  }

  if (locale !== "fr") {
    return "Virelia Crédit is a platform for submitting and tracking repayable loan applications. You can check eligibility, submit your application and supporting documents, review a draft contract, and track the file with your VIR reference and email. Loan approval is never automatic.";
  }

  const q = normalize(message);
  const missing = ctx.missingFields ?? [];

  if (/\b(qui est|c'est qui|cest qui|qu'est ce que|quest ce que)\b.*\bvirelia/.test(q) || q === "virelia" || q.includes("virelia credit c'est quoi")) {
    return "Virelia Crédit est une plateforme de demande et de suivi de prêts remboursables. Elle permet de vérifier votre profil, transmettre votre demande et vos justificatifs, consulter votre projet de contrat et suivre l'avancement de votre dossier à l'aide de votre référence VIR. Chaque dossier est étudié individuellement : aucun prêt n'est accordé automatiquement.";
  }

  if (q.includes("type de pret") || q.includes("types de pret") || q.includes("solutions de pret") || q.includes("quel pret")) {
    return `Virelia Crédit propose actuellement sept catégories de prêts remboursables : ${PRODUCTS.join(", ")}. Les conditions financières définitives ne sont jamais inventées : elles sont confirmées après étude du dossier lorsqu'elles sont disponibles.`;
  }

  if (q.includes("retraite") || q.includes("pension")) {
    return "Le prêt retraité est une solution destinée aux personnes retraitées. Le formulaire adapte les justificatifs à cette situation, notamment la preuve de pension. L'acceptation dépend toujours de l'étude individuelle du dossier.";
  }

  if (q.includes("document") || q.includes("justificatif") || q.includes("piece")) {
    return "Le dossier demande au minimum une pièce d'identité et un justificatif de domicile. Selon la situation déclarée, un justificatif de salaire, de revenus professionnels, de pension ou de revenus peut être demandé. Des pièces complémentaires peuvent aussi être demandées selon la nature de votre demande et l'étude de votre dossier.";
  }

  if (q.includes("eligibil") || q.includes("eligible")) {
    return "La vérification d'éligibilité est un test d'orientation en trois questions. Elle aide à savoir si vous pouvez poursuivre vers une demande, mais elle ne constitue ni une décision d'octroi ni une promesse de financement.";
  }

  if (q.includes("reference") || q.includes("vir-") || q.includes("retrouver") && q.includes("dossier")) {
    return `Votre référence VIR est affichée juste après l'envoi réussi de la demande et peut être copiée depuis la page de confirmation.${ctx.reference ? ` Votre référence actuellement connue est ${ctx.reference}.` : ""} Conservez-la avec l'adresse e-mail utilisée lors du dépôt : les deux sont nécessaires pour le suivi.`;
  }

  if (q.includes("suiv") || q.includes("avancement") || q.includes("statut")) {
    if (q.includes("statut") || ctx.status) return statusAnswer(ctx.status);
    return "Pour suivre votre demande, ouvrez la page « Suivre ma demande » et saisissez votre référence VIR ainsi que l'adresse e-mail utilisée lors du dépôt. Aucune coordonnée bancaire n'est demandée sur cette page.";
  }

  if (q.includes("contrat") || q.includes("pdf")) {
    return "Virelia génère deux versions privées du projet de contrat : une version structurée avec tableaux et une version narrative rédigée. Le document reste un PROJET DE CONTRAT DE PRÊT soumis à validation du dossier. Le cachet APPROVED n'est ajouté qu'après un véritable statut d'approbation.";
  }

  if (q.includes("frais") || q.includes("cout") || q.includes("delai") || q.includes("traitement")) {
    return feesAnswer();
  }

  if (q.includes("faire une demande") || q.includes("demande de pret") || q.includes("comment demander") || q.includes("formulaire")) {
    return "La demande se fait en cinq étapes : 1) informations personnelles, 2) situation professionnelle et financière, 3) caractéristiques du prêt, 4) documents justificatifs, 5) coordonnées bancaires et lecture du projet de contrat. Après confirmation, une référence VIR est créée pour le suivi.";
  }

  if (missing.length) {
    return `Il vous reste à renseigner : ${missing.join(", ")} avant de continuer. Je peux vous expliquer chaque champ, mais je ne peux pas accepter ou refuser un prêt à la place de l'équipe.`;
  }

  if (ctx.page === "confirmation") {
    return `Votre demande a été enregistrée.${ctx.reference ? ` Conservez bien la référence ${ctx.reference}.` : " Conservez bien votre référence VIR."} Vous aurez besoin de cette référence et de votre adresse e-mail pour suivre le dossier. Vous pouvez aussi télécharger les deux versions privées de votre projet de contrat depuis cette page.`;
  }

  if (ctx.page === "tracking" && ctx.status) return statusAnswer(ctx.status);

  if (ctx.page === "application") {
    return `Vous êtes à l'étape ${ctx.step ?? "en cours"} du formulaire. Je peux vous aider sur les champs, les justificatifs, les frais configurés ou le projet de contrat. Aucune donnée bancaire ne m'est transmise.`;
  }

  return "Je peux vous renseigner sur Virelia Crédit, les types de prêts, l'éligibilité, les cinq étapes du formulaire, les documents, les frais configurés, le projet de contrat, la référence VIR et le suivi du dossier. Je ne peux ni garantir ni décider l'octroi d'un prêt.";
}

export const VIRELIA_ASSISTANT_KNOWLEDGE = `
Virelia Crédit est une plateforme de demande et de suivi de prêts remboursables.
Parcours : éligibilité d'orientation, formulaire en cinq étapes, justificatifs, projet de contrat, référence VIR, suivi référence + e-mail.
Solutions : ${PRODUCTS.join(", ")}.
Frais de traitement configurés : ${Object.entries(PROCESSING_FEE_POLICY.tiers)
  .map(([speed, amount]) => `${SPEED_LABELS[speed] ?? speed}=${amount}`)
  .join(", ")}. Ils sont exprimés dans la devise sélectionnée et ne garantissent jamais un accord.
Deux projets de contrat privés existent : structuré et narratif. Le cachet APPROVED est réservé à un statut réellement approuvé.
Ne jamais demander, restituer ni transmettre d'IBAN, de numéro de compte, de document privé ou de note interne.
`;
