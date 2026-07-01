export interface Testimonial {
  name: string;
  role: string;
  country: string;
  quote: string;
  program: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aminata Diallo",
    role: "Fondatrice, Atelier Textile Bamako",
    country: "Mali",
    quote:
      "Un accompagnement exceptionnel du dépôt jusqu'à la réponse finale. L'équipe a compris mon projet et m'a permis de lancer mon atelier avec sérénité.",
    program: "Programme Entrepreneurs",
    rating: 5,
  },
  {
    name: "Julien Moreau",
    role: "Co-fondateur, Greentech Studio",
    country: "France",
    quote:
      "Réactivité, transparence et professionnalisme. Le suivi par e-mail est ultra clair, on sait toujours où on en est.",
    program: "Programme PME",
    rating: 5,
  },
  {
    name: "Sofia Rodríguez",
    role: "Doctorante",
    country: "Espagne",
    quote:
      "Grâce au Programme Éducation, j'ai pu financer ma thèse à l'étranger. Une expérience humaine avant tout.",
    program: "Programme Éducation",
    rating: 5,
  },
  {
    name: "Kwame Osei",
    role: "Coopérative Kakao Plus",
    country: "Ghana",
    quote:
      "Notre coopérative a doublé sa production grâce au Programme Agriculture. Merci pour la confiance accordée.",
    program: "Programme Agriculture",
    rating: 5,
  },
  {
    name: "Emma Van Berg",
    role: "Directrice, ONG Kinderhulp",
    country: "Pays-Bas",
    quote:
      "Un partenaire fiable pour les projets à impact social. Nous recommandons vivement leur programme solidaire.",
    program: "Programme Solidaire",
    rating: 5,
  },
  {
    name: "Marco Ferretti",
    role: "Architecte",
    country: "Italie",
    quote:
      "Rapide, sérieux, humain. J'ai pu concrétiser mon projet immobilier familial dans d'excellentes conditions.",
    program: "Programme Habitat",
    rating: 5,
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "Global Finance Initiative est-il une banque ?",
    a: "Non. Nous sommes un organisme international qui met en relation les porteurs de projets avec des programmes de financement adaptés. Nous ne délivrons pas de crédit bancaire.",
  },
  {
    q: "Comment se passe le suivi de mon dossier ?",
    a: "L'intégralité du suivi se fait par e-mail, à l'adresse indiquée dans votre demande. Un numéro de dossier unique vous est attribué dès l'envoi.",
  },
  {
    q: "Combien de temps prend l'analyse d'une demande ?",
    a: "Une première analyse est effectuée sous 72 heures. La réponse détaillée intervient sous 15 jours ouvrés maximum.",
  },
  {
    q: "Les frais de dossier sont-ils payants ?",
    a: "Le dépôt d'une demande est entièrement gratuit. Aucun frais ne vous sera jamais demandé pendant la phase d'analyse.",
  },
  {
    q: "Puis-je déposer plusieurs demandes ?",
    a: "Oui, vous pouvez déposer une demande pour chaque programme distinct, à condition que chaque projet soit détaillé et cohérent.",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Absolument. Nous respectons le RGPD et toutes les données sont stockées de manière sécurisée. Voir notre politique de confidentialité.",
  },
  {
    q: "Puis-je modifier ma demande après envoi ?",
    a: "Non, mais vous pouvez nous contacter par e-mail en précisant votre numéro de dossier pour toute mise à jour importante.",
  },
  {
    q: "Quels pays sont couverts ?",
    a: "Nous sommes présents dans plus de 30 pays en Europe, en Amérique du Nord et en Afrique. La liste complète est disponible sur simple demande.",
  },
  {
    q: "Dois-je fournir des garanties ?",
    a: "Les garanties dépendent du programme choisi. Elles sont précisées lors de la phase d'analyse, jamais avant.",
  },
  {
    q: "Comment savoir quel programme choisir ?",
    a: "Consultez la page Programmes ou contactez-nous : nous vous orientons vers le dispositif le plus adapté à votre situation.",
  },
];
