import { normalizeLocale, type SupportedLocale } from "./locale-core";
import type {
  ProfileLoanType,
  ProfileRoleKey,
  ProfileTextKey,
} from "../data/testimonial-profiles";

export interface ProfileSectionCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageAlt: string;
  loanTypes: Record<ProfileLoanType, string>;
  roles: Record<ProfileRoleKey, string>;
  texts: Record<ProfileTextKey, string>;
}

export const PROFILE_SECTION_TRANSLATIONS: Record<SupportedLocale, ProfileSectionCopy> = {
  fr: {
    eyebrow: "PROFILS & PROJETS",
    title: "Des besoins différents, un parcours clair",
    subtitle:
      "Exemples de profils et de projets pouvant utiliser le parcours Virelia, sans présumer d’une décision de financement.",
    imageAlt: "Portrait illustratif de {name}",
    loanTypes: {
      personal: "Prêt personnel",
      professional: "Prêt professionnel",
      business: "Prêt entreprise",
      housing: "Prêt travaux",
      studies: "Prêt études",
      project: "Prêt projet",
      retired: "Prêt retraité",
    },
    roles: {
      administrative_manager: "Responsable administrative",
      shop_owner: "Commerçante",
      independent_architect: "Architecte indépendant",
      digital_consultant: "Consultante digitale",
      sme_director: "Dirigeante de PME",
      entrepreneur: "Entrepreneur",
      liberal_professional: "Professionnelle libérale",
      technical_manager: "Cadre technique",
      master_student: "Étudiante en master",
      project_leader: "Porteuse de projet",
      retired_woman: "Retraitée",
      retired_man: "Retraité",
    },
    texts: {
      profile_01:
        "Besoin personnel à structurer avec des informations claires, des pièces organisées et un suivi simple du dossier.",
      profile_02:
        "Projet privé préparé étape par étape, avec une demande en ligne et une visibilité claire sur son avancement.",
      profile_03:
        "Activité indépendante nécessitant un dossier professionnel lisible et des justificatifs adaptés à la situation.",
      profile_04:
        "Projet de développement professionnel à présenter dans un parcours structuré, documenté et facile à suivre.",
      profile_05:
        "PME avec un besoin de financement à formaliser clairement avant l’étude individuelle du dossier.",
      profile_06:
        "Entreprise en phase de développement souhaitant centraliser sa demande et les documents utiles à son analyse.",
      profile_07:
        "Projet de rénovation à décrire avec son objet, son budget et les pièces nécessaires à l’étude.",
      profile_08:
        "Travaux d’amélioration d’un logement à présenter dans une demande structurée et traçable.",
      profile_09:
        "Projet d’études ou de formation à documenter avec un besoin, une durée et des justificatifs cohérents.",
      profile_10:
        "Projet défini à présenter simplement, avec son objectif et les informations nécessaires à son analyse.",
      profile_11:
        "Situation de retraite avec des justificatifs de pension et un besoin à étudier individuellement.",
      profile_12:
        "Projet personnel à la retraite, présenté avec les informations et justificatifs disponibles pour l’étude.",
    },
  },
  en: {
    eyebrow: "PROFILES & PROJECTS",
    title: "Different needs, one clear journey",
    subtitle:
      "Examples of profiles and projects that can use the Virelia journey, without implying any financing decision.",
    imageAlt: "Illustrative portrait of {name}",
    loanTypes: {
      personal: "Personal loan",
      professional: "Professional loan",
      business: "Business loan",
      housing: "Home improvement loan",
      studies: "Study loan",
      project: "Project loan",
      retired: "Retiree loan",
    },
    roles: {
      administrative_manager: "Administrative manager",
      shop_owner: "Shop owner",
      independent_architect: "Independent architect",
      digital_consultant: "Digital consultant",
      sme_director: "SME director",
      entrepreneur: "Entrepreneur",
      liberal_professional: "Independent professional",
      technical_manager: "Technical manager",
      master_student: "Master’s student",
      project_leader: "Project owner",
      retired_woman: "Retired professional",
      retired_man: "Retired professional",
    },
    texts: {
      profile_01:
        "A personal need to structure with clear information, organised documents and straightforward application tracking.",
      profile_02:
        "A private project prepared step by step, with an online application and clear visibility of its progress.",
      profile_03:
        "Independent activity requiring a readable professional application and documents suited to the situation.",
      profile_04:
        "A professional development project to present through a structured, documented and easy-to-follow journey.",
      profile_05:
        "An SME financing need to formalise clearly before the application is reviewed individually.",
      profile_06:
        "A growing business looking to centralise its application and the documents useful for its review.",
      profile_07:
        "A renovation project to describe with its purpose, budget and the documents required for review.",
      profile_08:
        "Home improvement work to present through a structured and traceable application.",
      profile_09:
        "A study or training project to document with a clear need, duration and consistent supporting documents.",
      profile_10:
        "A defined project to present simply, with its objective and the information needed for review.",
      profile_11:
        "A retirement situation with pension evidence and a need to be reviewed individually.",
      profile_12:
        "A personal retirement project presented with the available information and supporting documents for review.",
    },
  },
  de: {
    eyebrow: "PROFILE & PROJEKTE",
    title: "Unterschiedliche Bedürfnisse, ein klarer Ablauf",
    subtitle:
      "Beispiele für Profile und Projekte, die den Virelia-Ablauf nutzen können, ohne eine Finanzierungsentscheidung vorwegzunehmen.",
    imageAlt: "Illustratives Porträt von {name}",
    loanTypes: {
      personal: "Privatkredit",
      professional: "Kredit für Selbstständige",
      business: "Unternehmenskredit",
      housing: "Renovierungskredit",
      studies: "Studienkredit",
      project: "Projektkredit",
      retired: "Kredit für Rentner",
    },
    roles: {
      administrative_manager: "Verwaltungsleiterin",
      shop_owner: "Händlerin",
      independent_architect: "Selbstständiger Architekt",
      digital_consultant: "Digitalberaterin",
      sme_director: "KMU-Geschäftsführerin",
      entrepreneur: "Unternehmer",
      liberal_professional: "Freiberuflerin",
      technical_manager: "Technischer Manager",
      master_student: "Masterstudentin",
      project_leader: "Projektträgerin",
      retired_woman: "Rentnerin",
      retired_man: "Rentner",
    },
    texts: {
      profile_01:
        "Ein persönlicher Bedarf, der mit klaren Angaben, geordneten Unterlagen und einfacher Nachverfolgung strukturiert wird.",
      profile_02:
        "Ein privates Projekt, Schritt für Schritt vorbereitet, mit Online-Antrag und klarer Sicht auf den Fortschritt.",
      profile_03:
        "Selbstständige Tätigkeit mit Bedarf an einem übersichtlichen Antrag und passenden Nachweisen.",
      profile_04:
        "Ein berufliches Entwicklungsprojekt, das strukturiert, dokumentiert und nachvollziehbar dargestellt wird.",
      profile_05:
        "Ein Finanzierungsbedarf eines KMU, der vor der individuellen Prüfung klar formalisiert wird.",
      profile_06:
        "Ein wachsendes Unternehmen, das Antrag und prüfungsrelevante Unterlagen zentral bündeln möchte.",
      profile_07:
        "Ein Renovierungsprojekt mit Zweck, Budget und den für die Prüfung erforderlichen Unterlagen.",
      profile_08:
        "Verbesserungsarbeiten an einer Wohnung oder einem Haus in einem strukturierten, nachvollziehbaren Antrag.",
      profile_09:
        "Ein Studien- oder Weiterbildungsprojekt mit Bedarf, Laufzeit und stimmigen Nachweisen.",
      profile_10:
        "Ein klar definiertes Projekt mit Ziel und den für die Prüfung erforderlichen Informationen.",
      profile_11:
        "Eine Ruhestandssituation mit Rentennachweisen und einem individuell zu prüfenden Bedarf.",
      profile_12:
        "Ein persönliches Projekt im Ruhestand mit den verfügbaren Angaben und Nachweisen zur Prüfung.",
    },
  },
  es: {
    eyebrow: "PERFILES Y PROYECTOS",
    title: "Necesidades distintas, un recorrido claro",
    subtitle:
      "Ejemplos de perfiles y proyectos que pueden utilizar el recorrido Virelia, sin anticipar ninguna decisión de financiación.",
    imageAlt: "Retrato ilustrativo de {name}",
    loanTypes: {
      personal: "Préstamo personal",
      professional: "Préstamo profesional",
      business: "Préstamo para empresa",
      housing: "Préstamo para reformas",
      studies: "Préstamo para estudios",
      project: "Préstamo para proyecto",
      retired: "Préstamo para jubilados",
    },
    roles: {
      administrative_manager: "Responsable administrativa",
      shop_owner: "Comerciante",
      independent_architect: "Arquitecto independiente",
      digital_consultant: "Consultora digital",
      sme_director: "Directora de pyme",
      entrepreneur: "Emprendedor",
      liberal_professional: "Profesional independiente",
      technical_manager: "Responsable técnico",
      master_student: "Estudiante de máster",
      project_leader: "Promotora de proyecto",
      retired_woman: "Jubilada",
      retired_man: "Jubilado",
    },
    texts: {
      profile_01:
        "Una necesidad personal que estructurar con información clara, documentos organizados y un seguimiento sencillo del expediente.",
      profile_02:
        "Un proyecto privado preparado paso a paso, con solicitud en línea y visibilidad clara de su avance.",
      profile_03:
        "Actividad independiente que requiere un expediente profesional legible y justificantes adaptados a la situación.",
      profile_04:
        "Un proyecto de desarrollo profesional que presentar mediante un recorrido estructurado, documentado y fácil de seguir.",
      profile_05:
        "Una necesidad de financiación de pyme que formalizar claramente antes del estudio individual del expediente.",
      profile_06:
        "Una empresa en crecimiento que desea centralizar su solicitud y los documentos útiles para el análisis.",
      profile_07:
        "Un proyecto de reforma que describir con su objetivo, presupuesto y documentos necesarios para el estudio.",
      profile_08:
        "Trabajos de mejora de vivienda que presentar mediante una solicitud estructurada y trazable.",
      profile_09:
        "Un proyecto de estudios o formación que documentar con necesidad, duración y justificantes coherentes.",
      profile_10:
        "Un proyecto definido que presentar de forma sencilla, con su objetivo y la información necesaria para analizarlo.",
      profile_11:
        "Una situación de jubilación con justificantes de pensión y una necesidad que estudiar individualmente.",
      profile_12:
        "Un proyecto personal durante la jubilación, presentado con la información y los justificantes disponibles.",
    },
  },
  pt: {
    eyebrow: "PERFIS & PROJETOS",
    title: "Necessidades diferentes, um percurso claro",
    subtitle:
      "Exemplos de perfis e projetos que podem utilizar o percurso Virelia, sem antecipar qualquer decisão de financiamento.",
    imageAlt: "Retrato ilustrativo de {name}",
    loanTypes: {
      personal: "Crédito pessoal",
      professional: "Crédito profissional",
      business: "Crédito empresarial",
      housing: "Crédito para obras",
      studies: "Crédito para estudos",
      project: "Crédito para projeto",
      retired: "Crédito para reformados",
    },
    roles: {
      administrative_manager: "Responsável administrativa",
      shop_owner: "Comerciante",
      independent_architect: "Arquiteto independente",
      digital_consultant: "Consultora digital",
      sme_director: "Gestora de PME",
      entrepreneur: "Empresário",
      liberal_professional: "Profissional liberal",
      technical_manager: "Quadro técnico",
      master_student: "Estudante de mestrado",
      project_leader: "Promotora de projeto",
      retired_woman: "Reformada",
      retired_man: "Reformado",
    },
    texts: {
      profile_01:
        "Uma necessidade pessoal a estruturar com informação clara, documentos organizados e acompanhamento simples do processo.",
      profile_02:
        "Um projeto privado preparado passo a passo, com pedido online e visibilidade clara sobre a sua evolução.",
      profile_03:
        "Atividade independente que exige um processo profissional legível e comprovativos adaptados à situação.",
      profile_04:
        "Um projeto de desenvolvimento profissional a apresentar num percurso estruturado, documentado e fácil de acompanhar.",
      profile_05:
        "Uma necessidade de financiamento de PME a formalizar claramente antes da análise individual do processo.",
      profile_06:
        "Uma empresa em crescimento que pretende centralizar o pedido e os documentos úteis à análise.",
      profile_07:
        "Um projeto de obras a descrever com objetivo, orçamento e documentos necessários para a análise.",
      profile_08:
        "Obras de melhoria de uma habitação a apresentar através de um pedido estruturado e rastreável.",
      profile_09:
        "Um projeto de estudos ou formação a documentar com necessidade, duração e comprovativos coerentes.",
      profile_10:
        "Um projeto definido a apresentar de forma simples, com o objetivo e a informação necessária à análise.",
      profile_11:
        "Uma situação de reforma com comprovativos de pensão e uma necessidade a analisar individualmente.",
      profile_12:
        "Um projeto pessoal na reforma, apresentado com a informação e os comprovativos disponíveis para análise.",
    },
  },
  it: {
    eyebrow: "PROFILI & PROGETTI",
    title: "Esigenze diverse, un percorso chiaro",
    subtitle:
      "Esempi di profili e progetti che possono utilizzare il percorso Virelia, senza anticipare alcuna decisione di finanziamento.",
    imageAlt: "Ritratto illustrativo di {name}",
    loanTypes: {
      personal: "Prestito personale",
      professional: "Prestito professionale",
      business: "Prestito aziendale",
      housing: "Prestito per lavori",
      studies: "Prestito per studi",
      project: "Prestito per progetto",
      retired: "Prestito per pensionati",
    },
    roles: {
      administrative_manager: "Responsabile amministrativa",
      shop_owner: "Commerciante",
      independent_architect: "Architetto indipendente",
      digital_consultant: "Consulente digitale",
      sme_director: "Dirigente di PMI",
      entrepreneur: "Imprenditore",
      liberal_professional: "Libera professionista",
      technical_manager: "Responsabile tecnico",
      master_student: "Studentessa magistrale",
      project_leader: "Promotrice di progetto",
      retired_woman: "Pensionata",
      retired_man: "Pensionato",
    },
    texts: {
      profile_01:
        "Un’esigenza personale da strutturare con informazioni chiare, documenti ordinati e un monitoraggio semplice della pratica.",
      profile_02:
        "Un progetto privato preparato passo dopo passo, con domanda online e visibilità chiara sul suo avanzamento.",
      profile_03:
        "Attività indipendente che richiede una pratica professionale leggibile e documenti adeguati alla situazione.",
      profile_04:
        "Un progetto di sviluppo professionale da presentare in un percorso strutturato, documentato e facile da seguire.",
      profile_05:
        "Un’esigenza di finanziamento di una PMI da formalizzare chiaramente prima della valutazione individuale.",
      profile_06:
        "Un’impresa in crescita che desidera centralizzare la domanda e i documenti utili alla valutazione.",
      profile_07:
        "Un progetto di ristrutturazione da descrivere con obiettivo, budget e documenti necessari alla valutazione.",
      profile_08:
        "Lavori di miglioramento dell’abitazione da presentare con una domanda strutturata e tracciabile.",
      profile_09:
        "Un progetto di studio o formazione da documentare con esigenza, durata e giustificativi coerenti.",
      profile_10:
        "Un progetto definito da presentare in modo semplice, con obiettivo e informazioni necessarie alla valutazione.",
      profile_11:
        "Una situazione di pensionamento con prova della pensione e un’esigenza da valutare individualmente.",
      profile_12:
        "Un progetto personale in pensione, presentato con le informazioni e i documenti disponibili per la valutazione.",
    },
  },
  hr: {
    eyebrow: "PROFILI I PROJEKTI",
    title: "Različite potrebe, jasan postupak",
    subtitle:
      "Primjeri profila i projekata koji mogu koristiti Virelia postupak, bez prejudiciranja odluke o financiranju.",
    imageAlt: "Ilustrativni portret osobe {name}",
    loanTypes: {
      personal: "Osobni kredit",
      professional: "Kredit za samostalne djelatnosti",
      business: "Kredit za poduzeće",
      housing: "Kredit za renoviranje",
      studies: "Studentski kredit",
      project: "Projektni kredit",
      retired: "Kredit za umirovljenike",
    },
    roles: {
      administrative_manager: "Voditeljica administracije",
      shop_owner: "Trgovkinja",
      independent_architect: "Samostalni arhitekt",
      digital_consultant: "Digitalna konzultantica",
      sme_director: "Direktorica MSP-a",
      entrepreneur: "Poduzetnik",
      liberal_professional: "Samostalna stručnjakinja",
      technical_manager: "Tehnički voditelj",
      master_student: "Studentica diplomskog studija",
      project_leader: "Nositeljica projekta",
      retired_woman: "Umirovljenica",
      retired_man: "Umirovljenik",
    },
    texts: {
      profile_01:
        "Osobna potreba koju treba strukturirati jasnim informacijama, urednim dokumentima i jednostavnim praćenjem zahtjeva.",
      profile_02:
        "Privatni projekt pripremljen korak po korak, uz online zahtjev i jasan pregled njegova napretka.",
      profile_03:
        "Samostalna djelatnost kojoj je potreban pregledan profesionalni zahtjev i dokumentacija prilagođena situaciji.",
      profile_04:
        "Projekt profesionalnog razvoja koji treba predstaviti kroz strukturiran, dokumentiran i pregledan postupak.",
      profile_05:
        "Potreba MSP-a za financiranjem koju treba jasno oblikovati prije pojedinačne analize zahtjeva.",
      profile_06:
        "Poduzeće u razvoju koje želi objediniti zahtjev i dokumente korisne za analizu.",
      profile_07:
        "Projekt renoviranja koji treba opisati svrhom, proračunom i dokumentima potrebnima za analizu.",
      profile_08:
        "Radovi na poboljšanju doma predstavljeni kroz strukturiran zahtjev koji se može pratiti.",
      profile_09:
        "Projekt studija ili edukacije dokumentiran potrebom, trajanjem i odgovarajućim dokazima.",
      profile_10:
        "Definiran projekt koji treba jednostavno predstaviti ciljem i informacijama potrebnima za analizu.",
      profile_11:
        "Umirovljenička situacija s dokazima o mirovini i potrebom koja se procjenjuje pojedinačno.",
      profile_12:
        "Osobni projekt u mirovini predstavljen dostupnim informacijama i dokumentima za analizu.",
    },
  },
};

export function getProfileSectionCopy(locale: string): ProfileSectionCopy {
  const normalized = normalizeLocale(locale) ?? "fr";
  return PROFILE_SECTION_TRANSLATIONS[normalized];
}
