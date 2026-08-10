import { CONTACT } from "@/config/brand";

export interface Testimonial {
  name: string;
  role: string;
  country: string;
  quote: string;
  program: string;
  rating: number;
}

/**
 * No testimonial is published yet: only real, verified borrower feedback may be
 * added here. While the list is empty the section is hidden.
 */
export const TESTIMONIALS: Testimonial[] = [];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Virelia Crédit propose-t-il des subventions ou des aides non remboursables ?",
    a: "Non. Virelia Crédit présente uniquement des solutions de prêt remboursables. Tout montant accordé doit être remboursé selon un échéancier convenu.",
  },
  {
    q: "Dans quels pays puis-je déposer une demande ?",
    a: "Les demandes sont étudiées pour les résidents des pays actuellement desservis : France, Allemagne, Espagne, Portugal, Suisse, Canada et Croatie. Le pays de résidence doit être confirmé avant l'envoi du dossier.",
  },
  {
    q: "Quels sont les taux et les frais appliqués ?",
    a: "Les conditions tarifaires sont définies marché par marché. Tant qu'elles ne sont pas publiées, la mention « en cours de configuration » est affichée : aucun taux ni frais n'est inventé.",
  },
  {
    q: "Des frais sont-ils demandés avant le versement du prêt ?",
    a: "Il n'existe aucune règle générale. Lorsqu'un marché prévoit des frais exigibles avant décaissement, ils sont indiqués dans la configuration du marché, dans le simulateur et dans le récapitulatif de la demande, avant toute signature.",
  },
  {
    q: "Le dépôt d'une demande garantit-il l'obtention d'un prêt ?",
    a: "Non. Chaque dossier est étudié individuellement, notamment au regard de la capacité de remboursement. Aucune approbation, aucun délai et aucun taux ne sont garantis à l'avance.",
  },
  {
    q: "Le simulateur a-t-il une valeur contractuelle ?",
    a: "Non. Il fournit une estimation indicative. Seule l'offre de prêt écrite qui vous serait adressée après étude a une valeur contractuelle.",
  },
  {
    q: "Comment se déroule le suivi de mon dossier ?",
    a: `Le suivi se fait par écrit, par e-mail${CONTACT.applicationEmail ? ` (${CONTACT.applicationEmail})` : ""}, afin que vous conserviez une trace de chaque échange.`,
  },
  {
    q: "Quels documents dois-je préparer ?",
    a: "Généralement une pièce d'identité en cours de validité, un justificatif de domicile récent, des justificatifs de revenus, un justificatif d'activité et des relevés bancaires. La liste exacte dépend du marché et de la solution de prêt.",
  },
  {
    q: "Que deviennent mes données personnelles ?",
    a: "Elles sont utilisées uniquement pour l'étude de votre demande de prêt et ne sont pas cédées à des tiers à des fins commerciales.",
  },
];
