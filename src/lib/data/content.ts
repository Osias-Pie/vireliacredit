import { CONTACT } from "@/config/brand";

export interface Testimonial {
  name: string;
  role: string;
  country: string;
  quote: string;
  program: string;
  rating: number;
}

/** Only real, verified borrower feedback may be published here. */
export const TESTIMONIALS: Testimonial[] = [];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Virelia Crédit propose-t-il des subventions ou des aides non remboursables ?",
    a: "Non. Virelia Crédit présente uniquement des solutions de prêt remboursables. Tout financement éventuellement accordé reste soumis à l'étude du dossier et aux conditions qui seront communiquées après validation.",
  },
  {
    q: "Puis-je déposer une demande quel que soit mon pays de résidence ?",
    a: "Oui. Le pays de résidence est demandé uniquement comme information du dossier. Il ne déclenche ni blocage géographique, ni devise imposée, ni décision automatique.",
  },
  {
    q: "Quels sont les taux et les conditions financières ?",
    a: "Virelia Crédit n'affiche aucun taux, TAEG ou coût de crédit qui n'a pas été réellement configuré. Les conditions définitives sont précisées après l'étude et la validation du dossier.",
  },
  {
    q: "Quels frais de traitement sont affichés ?",
    a: "Lorsque vous choisissez un délai de traitement, les frais de service correspondants sont affichés dans le formulaire avant l'envoi de la demande. Ils constituent des paramètres du service et ne sont présentés ni comme une taxe ni comme une obligation réglementaire.",
  },
  {
    q: "Le dépôt d'une demande garantit-il l'obtention d'un prêt ?",
    a: "Non. Chaque dossier est étudié individuellement. La vérification d'éligibilité et le dépôt d'une demande ne constituent jamais une acceptation automatique ou une garantie de crédit.",
  },
  {
    q: "À quoi sert la vérification d'éligibilité ?",
    a: "Elle sert uniquement à orienter le visiteur en trois questions. Même lorsqu'une situation nécessite une étude complémentaire, il reste possible de déposer une demande pour analyse humaine.",
  },
  {
    q: "Comment suivre ma demande ?",
    a: `Utilisez la page « Suivre ma demande » avec votre référence VIR et l'e-mail utilisé lors du dépôt. Vous pouvez aussi contacter l'équipe par e-mail${CONTACT.applicationEmail ? ` (${CONTACT.applicationEmail})` : ""}.`,
  },
  {
    q: "Quels documents dois-je préparer ?",
    a: "Une pièce d'identité et un justificatif de domicile sont demandés. Selon votre situation, un justificatif de revenus, de pension ou d'activité professionnelle peut également être requis. Aucun document de garant n'est demandé.",
  },
  {
    q: "Que deviennent mes données personnelles et bancaires ?",
    a: "Les données bancaires et les documents sont traités comme des informations sensibles. Ils ne sont pas affichés dans le suivi public et les fichiers sont stockés dans des espaces privés.",
  },
];
