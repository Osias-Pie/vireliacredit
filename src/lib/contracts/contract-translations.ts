import type { SupportedLocale } from "@/lib/i18n/locale-core";

export interface ContractNarrativeValues {
  name: string;
  birthDate: string;
  nationality: string;
  address: string;
  program: string;
  amount: string;
  duration: string;
  purpose: string;
  situation: string;
  income: string;
  charges: string;
  speed: string;
  fee: string;
  holder: string;
  bank: string;
  account: string;
  swift?: string;
}

export interface ContractCopy {
  localeTag: string;
  brand: string;
  title: string;
  subtitle: string;
  reference: string;
  date: string;
  assignedAfterRegistration: string;
  months: string;
  notProvided: string;
  declaredSituation: string;
  sections: [string, string, string, string, string, string];
  narrativeSections: [string, string, string, string, string];
  labels: {
    fullName: string; birth: string; nationality: string; address: string; phone: string; email: string;
    loanType: string; requestedAmount: string; desiredDuration: string; purpose: string; requestedTime: string;
    processingFee: string; situation: string; income: string; charges: string; commitment: string; bank: string;
    holder: string; account: string; swift: string; amount: string; duration: string; processing: string; fees: string;
    decision: string;
  };
  commitment: string;
  afterReview: string;
  validationNote: string;
  forVirelia: string;
  directorGeneral: string;
  institutionalValidation: string;
  vicePresident: string;
  approvedNote: string;
  draftNote: string;
  intro: (v: ContractNarrativeValues) => string;
  narrativeIdentity: (v: ContractNarrativeValues) => string;
  narrativePurpose: (v: ContractNarrativeValues) => string;
  narrativeFees: (v: ContractNarrativeValues) => string;
  narrativeBank: (v: ContractNarrativeValues) => string;
  narrativeValidation: string;
}

const fr: ContractCopy = {
  localeTag: "fr-FR", brand: "VIRELIA CRÉDIT", title: "PROJET DE CONTRAT DE PRÊT", subtitle: "Soumis à validation du dossier", reference: "Référence", date: "Date", assignedAfterRegistration: "attribuée après enregistrement", months: "mois", notProvided: "Non renseigné", declaredSituation: "Situation déclarée",
  sections: ["1. Demandeur", "2. Objet de la demande", "3. Conditions déclarées", "4. Coordonnées de versement", "5. Conditions essentielles", "6. Validation documentaire"],
  narrativeSections: ["Identité et demande", "Objet et conditions déclarées", "Traitement et frais", "Coordonnées de versement déclarées", "Validation documentaire"],
  labels: { fullName: "Nom complet", birth: "Naissance", nationality: "Nationalité", address: "Adresse", phone: "Téléphone", email: "E-mail", loanType: "Type de prêt", requestedAmount: "Montant demandé", desiredDuration: "Durée souhaitée", purpose: "Objet", requestedTime: "Délai demandé", processingFee: "Frais de dossier", situation: "Situation", income: "Revenus", charges: "Charges", commitment: "Engagement", bank: "Banque", holder: "Titulaire", account: "IBAN / compte", swift: "SWIFT / BIC", amount: "Montant", duration: "Durée", processing: "Traitement", fees: "Frais", decision: "Décision" },
  commitment: "Informations exactes et justificatifs requis", afterReview: "Après étude",
  validationNote: "Le demandeur confirme l’exactitude des informations communiquées. Des documents complémentaires peuvent être demandés selon la nature de la demande et l’étude du dossier. Ce projet de contrat ne vaut ni accord automatique, ni promesse de décaissement, ni engagement définitif de Virelia Crédit.",
  forVirelia: "POUR VIRELIA CRÉDIT", directorGeneral: "Directeur Général", institutionalValidation: "VALIDATION INSTITUTIONNELLE", vicePresident: "Vice-Président", approvedNote: "Dossier approuvé — validation institutionnelle apposée selon le statut réel du dossier.", draftNote: "Document de référence pré-contractuel — soumis à validation du dossier.",
  intro: (v) => `Monsieur / Madame ${v.name}, né(e) le ${v.birthDate}, a soumis auprès de Virelia Crédit une demande de ${v.program} d’un montant de ${v.amount}, destinée à ${v.purpose}. Le présent document constitue un projet pré-contractuel soumis à l’étude complète du dossier.`,
  narrativeIdentity: (v) => `Monsieur / Madame ${v.name}, né(e) le ${v.birthDate} et de nationalité ${v.nationality}, domicilié(e) à ${v.address}, a transmis à Virelia Crédit une demande de ${v.program}. Le montant demandé est de ${v.amount} pour une durée souhaitée de ${v.duration} mois.`,
  narrativePurpose: (v) => `La demande est destinée à l’objet suivant : ${v.purpose}. La situation déclarée est « ${v.situation} ». Les revenus mensuels déclarés sont ${v.income} et les charges mensuelles déclarées sont ${v.charges}. Ces informations seront vérifiées dans le cadre de l’étude du dossier.`,
  narrativeFees: (v) => `Le délai de traitement demandé est ${v.speed}. Les frais de traitement correspondants sont ${v.fee}. Ces frais proviennent de la grille configurée dans la plateforme et ne constituent ni une garantie d’acceptation ni une décision de crédit. Les conditions financières définitives ne sont établies qu’après l’étude du dossier lorsqu’elles sont disponibles.`,
  narrativeBank: (v) => `Le demandeur a indiqué le compte au nom de ${v.holder}, auprès de ${v.bank}, avec la référence de compte / IBAN ${v.account}${v.swift ? ` et le code SWIFT / BIC ${v.swift}` : ""}. Ces données sont conservées dans les espaces privés prévus pour le dossier et ne sont pas exposées dans le suivi public.`,
  narrativeValidation: "Le demandeur confirme avoir relu le présent projet et certifie l’exactitude des informations communiquées. Des documents complémentaires peuvent être demandés selon la nature de la demande et l’étude du dossier. Ce document reste un PROJET DE CONTRAT DE PRÊT soumis à validation du dossier. Il ne vaut ni acceptation automatique, ni promesse de décaissement, ni engagement définitif de Virelia Crédit.",
};

const en: ContractCopy = {
  localeTag: "en-GB", brand: "VIRELIA CREDIT", title: "LOAN AGREEMENT PROJECT", subtitle: "Subject to application approval", reference: "Reference", date: "Date", assignedAfterRegistration: "assigned after registration", months: "months", notProvided: "Not provided", declaredSituation: "Declared situation",
  sections: ["1. Applicant", "2. Purpose of the application", "3. Declared conditions", "4. Payment details", "5. Essential conditions", "6. Document validation"],
  narrativeSections: ["Identity and application", "Purpose and declared conditions", "Processing and fees", "Declared payment details", "Document validation"],
  labels: { fullName: "Full name", birth: "Date of birth", nationality: "Nationality", address: "Address", phone: "Phone", email: "Email", loanType: "Loan type", requestedAmount: "Requested amount", desiredDuration: "Desired term", purpose: "Purpose", requestedTime: "Requested processing", processingFee: "Processing fee", situation: "Situation", income: "Income", charges: "Charges", commitment: "Commitment", bank: "Bank", holder: "Account holder", account: "IBAN / account", swift: "SWIFT / BIC", amount: "Amount", duration: "Term", processing: "Processing", fees: "Fees", decision: "Decision" },
  commitment: "Accurate information and supporting documents required", afterReview: "After review",
  validationNote: "The applicant confirms that the information provided is accurate. Additional documents may be requested depending on the application and its review. This draft agreement is not an automatic approval, a promise of disbursement or a final commitment by Virelia Credit.",
  forVirelia: "FOR VIRELIA CREDIT", directorGeneral: "Managing Director", institutionalValidation: "INSTITUTIONAL VALIDATION", vicePresident: "Vice-President", approvedNote: "Application approved — institutional validation applied according to the actual application status.", draftNote: "Pre-contractual reference document — subject to application approval.",
  intro: (v) => `${v.name}, born on ${v.birthDate}, submitted to Virelia Credit an application for ${v.program} in the amount of ${v.amount}, intended for ${v.purpose}. This document is a pre-contractual draft subject to a full review of the application.`,
  narrativeIdentity: (v) => `${v.name}, born on ${v.birthDate}, of ${v.nationality} nationality and residing at ${v.address}, submitted an application for ${v.program} to Virelia Credit. The requested amount is ${v.amount} for a desired term of ${v.duration} months.`,
  narrativePurpose: (v) => `The application is intended for the following purpose: ${v.purpose}. The declared situation is “${v.situation}”. Declared monthly income is ${v.income} and declared monthly charges are ${v.charges}. This information will be verified during the application review.`,
  narrativeFees: (v) => `The requested processing time is ${v.speed}. The corresponding processing fee is ${v.fee}. This fee comes from the configuration currently used by the platform and is neither a guarantee of acceptance nor a credit decision. Final financial terms are established only after review when available.`,
  narrativeBank: (v) => `The applicant declared an account in the name of ${v.holder} with ${v.bank}, using account / IBAN reference ${v.account}${v.swift ? ` and SWIFT / BIC code ${v.swift}` : ""}. These details are kept in the private application areas and are not exposed through public tracking.`,
  narrativeValidation: "The applicant confirms having reviewed this draft and certifies the accuracy of the information provided. Additional documents may be requested depending on the application and its review. This document remains a LOAN AGREEMENT PROJECT subject to application approval. It is not an automatic acceptance, a promise of disbursement or a final commitment by Virelia Credit.",
};

const de: ContractCopy = {
  localeTag: "de-DE", brand: "VIRELIA KREDIT", title: "ENTWURF DES DARLEHENSVERTRAGS", subtitle: "Vorbehaltlich der Genehmigung des Antrags", reference: "Referenz", date: "Datum", assignedAfterRegistration: "nach Registrierung vergeben", months: "Monate", notProvided: "Nicht angegeben", declaredSituation: "Angegebene Situation",
  sections: ["1. Antragsteller", "2. Zweck des Antrags", "3. Angegebene Bedingungen", "4. Auszahlungsdaten", "5. Wesentliche Bedingungen", "6. Dokumentenprüfung"], narrativeSections: ["Identität und Antrag", "Zweck und Angaben", "Bearbeitung und Gebühren", "Angegebene Auszahlungsdaten", "Dokumentenprüfung"],
  labels: { fullName: "Vollständiger Name", birth: "Geburtsdatum", nationality: "Staatsangehörigkeit", address: "Adresse", phone: "Telefon", email: "E-Mail", loanType: "Darlehensart", requestedAmount: "Beantragter Betrag", desiredDuration: "Gewünschte Laufzeit", purpose: "Zweck", requestedTime: "Bearbeitungszeit", processingFee: "Bearbeitungsgebühr", situation: "Situation", income: "Einkommen", charges: "Belastungen", commitment: "Verpflichtung", bank: "Bank", holder: "Kontoinhaber", account: "IBAN / Konto", swift: "SWIFT / BIC", amount: "Betrag", duration: "Laufzeit", processing: "Bearbeitung", fees: "Gebühren", decision: "Entscheidung" }, commitment: "Korrekte Angaben und Nachweise erforderlich", afterReview: "Nach Prüfung",
  validationNote: "Der Antragsteller bestätigt die Richtigkeit der Angaben. Je nach Antrag und Prüfung können zusätzliche Unterlagen angefordert werden. Dieser Vertragsentwurf stellt weder eine automatische Genehmigung noch eine Auszahlungszusage oder endgültige Verpflichtung von Virelia Kredit dar.", forVirelia: "FÜR VIRELIA KREDIT", directorGeneral: "Geschäftsführer", institutionalValidation: "INSTITUTIONELLE BESTÄTIGUNG", vicePresident: "Vizepräsident", approvedNote: "Antrag genehmigt — institutionelle Bestätigung entsprechend dem tatsächlichen Status.", draftNote: "Vorvertragliches Referenzdokument — vorbehaltlich der Antragsgenehmigung.",
  intro: (v) => `${v.name}, geboren am ${v.birthDate}, hat bei Virelia Kredit einen Antrag auf ${v.program} über ${v.amount} für ${v.purpose} eingereicht. Dieses Dokument ist ein vorvertraglicher Entwurf und steht unter dem Vorbehalt der vollständigen Prüfung des Antrags.`,
  narrativeIdentity: (v) => `${v.name}, geboren am ${v.birthDate}, Staatsangehörigkeit ${v.nationality}, wohnhaft ${v.address}, hat bei Virelia Kredit einen Antrag auf ${v.program} eingereicht. Beantragt sind ${v.amount} mit einer gewünschten Laufzeit von ${v.duration} Monaten.`,
  narrativePurpose: (v) => `Zweck des Antrags: ${v.purpose}. Angegebene Situation: „${v.situation}“. Angegebenes monatliches Einkommen: ${v.income}; angegebene monatliche Belastungen: ${v.charges}. Diese Angaben werden im Rahmen der Prüfung verifiziert.`,
  narrativeFees: (v) => `Gewünschte Bearbeitungszeit: ${v.speed}. Die entsprechende Bearbeitungsgebühr beträgt ${v.fee}. Sie basiert auf der Plattformkonfiguration und ist weder eine Annahmegarantie noch eine Kreditentscheidung. Endgültige finanzielle Bedingungen werden erst nach der Prüfung festgelegt, sofern verfügbar.`,
  narrativeBank: (v) => `Angegeben wurde ein Konto auf den Namen ${v.holder} bei ${v.bank}, IBAN / Kontoreferenz ${v.account}${v.swift ? `, SWIFT / BIC ${v.swift}` : ""}. Diese Daten werden in den privaten Bereichen des Antrags gespeichert und nicht im öffentlichen Tracking angezeigt.`,
  narrativeValidation: "Der Antragsteller bestätigt, diesen Entwurf gelesen zu haben und die Richtigkeit der Angaben. Zusätzliche Unterlagen können angefordert werden. Dieses Dokument bleibt ein ENTWURF DES DARLEHENSVERTRAGS und steht unter dem Vorbehalt der Antragsgenehmigung. Es ist weder eine automatische Annahme noch eine Auszahlungszusage oder endgültige Verpflichtung von Virelia Kredit.",
};

const es: ContractCopy = {
  localeTag: "es-ES", brand: "VIRELIA CRÉDIT", title: "PROYECTO DE CONTRATO DE PRÉSTAMO", subtitle: "Sujeto a la aprobación del expediente", reference: "Referencia", date: "Fecha", assignedAfterRegistration: "asignada tras el registro", months: "meses", notProvided: "No indicado", declaredSituation: "Situación declarada",
  sections: ["1. Solicitante", "2. Objeto de la solicitud", "3. Condiciones declaradas", "4. Datos de desembolso", "5. Condiciones esenciales", "6. Validación documental"], narrativeSections: ["Identidad y solicitud", "Objeto y condiciones declaradas", "Tramitación y gastos", "Datos de desembolso declarados", "Validación documental"],
  labels: { fullName: "Nombre completo", birth: "Nacimiento", nationality: "Nacionalidad", address: "Dirección", phone: "Teléfono", email: "Correo electrónico", loanType: "Tipo de préstamo", requestedAmount: "Importe solicitado", desiredDuration: "Duración deseada", purpose: "Objeto", requestedTime: "Plazo solicitado", processingFee: "Gastos de tramitación", situation: "Situación", income: "Ingresos", charges: "Cargas", commitment: "Compromiso", bank: "Banco", holder: "Titular", account: "IBAN / cuenta", swift: "SWIFT / BIC", amount: "Importe", duration: "Duración", processing: "Tramitación", fees: "Gastos", decision: "Decisión" }, commitment: "Información exacta y justificantes requeridos", afterReview: "Tras el estudio",
  validationNote: "El solicitante confirma la exactitud de la información comunicada. Pueden solicitarse documentos adicionales según la solicitud y su estudio. Este proyecto no constituye una aprobación automática, una promesa de desembolso ni un compromiso definitivo de Virelia Crédit.", forVirelia: "POR VIRELIA CRÉDIT", directorGeneral: "Director General", institutionalValidation: "VALIDACIÓN INSTITUCIONAL", vicePresident: "Vicepresidente", approvedNote: "Expediente aprobado — validación institucional aplicada según el estado real del expediente.", draftNote: "Documento precontractual de referencia — sujeto a la aprobación del expediente.",
  intro: (v) => `${v.name}, nacido/a el ${v.birthDate}, ha presentado ante Virelia Crédit una solicitud de ${v.program} por un importe de ${v.amount}, destinada a ${v.purpose}. Este documento constituye un proyecto precontractual sujeto al estudio completo del expediente.`,
  narrativeIdentity: (v) => `${v.name}, nacido/a el ${v.birthDate}, de nacionalidad ${v.nationality} y con domicilio en ${v.address}, ha presentado una solicitud de ${v.program}. El importe solicitado es ${v.amount} para una duración deseada de ${v.duration} meses.`,
  narrativePurpose: (v) => `La solicitud tiene el siguiente objeto: ${v.purpose}. La situación declarada es «${v.situation}». Los ingresos mensuales declarados son ${v.income} y las cargas mensuales declaradas son ${v.charges}. Estos datos se verificarán durante el estudio del expediente.`,
  narrativeFees: (v) => `El plazo de tramitación solicitado es ${v.speed}. Los gastos correspondientes son ${v.fee}. Proceden de la configuración de la plataforma y no constituyen una garantía de aceptación ni una decisión de crédito. Las condiciones financieras definitivas solo se establecen después del estudio cuando están disponibles.`,
  narrativeBank: (v) => `El solicitante ha indicado una cuenta a nombre de ${v.holder}, en ${v.bank}, con referencia de cuenta / IBAN ${v.account}${v.swift ? ` y código SWIFT / BIC ${v.swift}` : ""}. Estos datos se conservan en las áreas privadas del expediente y no aparecen en el seguimiento público.`,
  narrativeValidation: "El solicitante confirma haber revisado este proyecto y certifica la exactitud de la información comunicada. Pueden solicitarse documentos adicionales. Este documento sigue siendo un PROYECTO DE CONTRATO DE PRÉSTAMO sujeto a la aprobación del expediente. No constituye aceptación automática, promesa de desembolso ni compromiso definitivo de Virelia Crédit.",
};

const pt: ContractCopy = {
  localeTag: "pt-PT", brand: "VIRELIA CRÉDIT", title: "PROJETO DE CONTRATO DE CRÉDITO", subtitle: "Sujeito à aprovação do processo", reference: "Referência", date: "Data", assignedAfterRegistration: "atribuída após o registo", months: "meses", notProvided: "Não indicado", declaredSituation: "Situação declarada",
  sections: ["1. Requerente", "2. Objeto do pedido", "3. Condições declaradas", "4. Dados de desembolso", "5. Condições essenciais", "6. Validação documental"], narrativeSections: ["Identidade e pedido", "Objeto e condições declaradas", "Tratamento e encargos", "Dados de desembolso declarados", "Validação documental"],
  labels: { fullName: "Nome completo", birth: "Nascimento", nationality: "Nacionalidade", address: "Morada", phone: "Telefone", email: "E-mail", loanType: "Tipo de crédito", requestedAmount: "Montante solicitado", desiredDuration: "Prazo desejado", purpose: "Objeto", requestedTime: "Prazo solicitado", processingFee: "Encargos de tratamento", situation: "Situação", income: "Rendimentos", charges: "Encargos", commitment: "Compromisso", bank: "Banco", holder: "Titular", account: "IBAN / conta", swift: "SWIFT / BIC", amount: "Montante", duration: "Prazo", processing: "Tratamento", fees: "Encargos", decision: "Decisão" }, commitment: "Informações exatas e comprovativos necessários", afterReview: "Após análise",
  validationNote: "O requerente confirma a exatidão das informações comunicadas. Podem ser solicitados documentos adicionais conforme o pedido e a análise do processo. Este projeto não constitui aprovação automática, promessa de desembolso nem compromisso definitivo da Virelia Crédit.", forVirelia: "PELA VIRELIA CRÉDIT", directorGeneral: "Diretor-Geral", institutionalValidation: "VALIDAÇÃO INSTITUCIONAL", vicePresident: "Vice-Presidente", approvedNote: "Processo aprovado — validação institucional aplicada de acordo com o estado real do processo.", draftNote: "Documento pré-contratual de referência — sujeito à aprovação do processo.",
  intro: (v) => `${v.name}, nascido(a) em ${v.birthDate}, apresentou à Virelia Crédit um pedido de ${v.program} no montante de ${v.amount}, destinado a ${v.purpose}. O presente documento é um projeto pré-contratual sujeito à análise completa do processo.`,
  narrativeIdentity: (v) => `${v.name}, nascido(a) em ${v.birthDate}, de nacionalidade ${v.nationality} e residente em ${v.address}, apresentou à Virelia Crédit um pedido de ${v.program}. O montante solicitado é ${v.amount}, por um prazo desejado de ${v.duration} meses.`,
  narrativePurpose: (v) => `O pedido destina-se ao seguinte objetivo: ${v.purpose}. A situação declarada é «${v.situation}». Os rendimentos mensais declarados são ${v.income} e os encargos mensais declarados são ${v.charges}. Estas informações serão verificadas durante a análise do processo.`,
  narrativeFees: (v) => `O prazo de tratamento solicitado é ${v.speed}. Os encargos correspondentes são ${v.fee}. Estes valores resultam da configuração da plataforma e não constituem garantia de aceitação nem decisão de crédito. As condições financeiras definitivas só são estabelecidas após análise, quando disponíveis.`,
  narrativeBank: (v) => `O requerente indicou uma conta em nome de ${v.holder}, no banco ${v.bank}, com a referência de conta / IBAN ${v.account}${v.swift ? ` e o código SWIFT / BIC ${v.swift}` : ""}. Estes dados são conservados nas áreas privadas do processo e não são expostos no acompanhamento público.`,
  narrativeValidation: "O requerente confirma ter revisto este projeto e certifica a exatidão das informações comunicadas. Podem ser solicitados documentos adicionais. Este documento continua a ser um PROJETO DE CONTRATO DE CRÉDITO sujeito à aprovação do processo. Não constitui aceitação automática, promessa de desembolso nem compromisso definitivo da Virelia Crédit.",
};

const it: ContractCopy = {
  localeTag: "it-IT", brand: "VIRELIA CRÉDIT", title: "PROGETTO DI CONTRATTO DI PRESTITO", subtitle: "Soggetto all’approvazione della pratica", reference: "Riferimento", date: "Data", assignedAfterRegistration: "assegnato dopo la registrazione", months: "mesi", notProvided: "Non indicato", declaredSituation: "Situazione dichiarata",
  sections: ["1. Richiedente", "2. Oggetto della richiesta", "3. Condizioni dichiarate", "4. Dati di erogazione", "5. Condizioni essenziali", "6. Validazione documentale"], narrativeSections: ["Identità e richiesta", "Oggetto e condizioni dichiarate", "Elaborazione e spese", "Dati di erogazione dichiarati", "Validazione documentale"],
  labels: { fullName: "Nome completo", birth: "Nascita", nationality: "Nazionalità", address: "Indirizzo", phone: "Telefono", email: "E-mail", loanType: "Tipo di prestito", requestedAmount: "Importo richiesto", desiredDuration: "Durata desiderata", purpose: "Oggetto", requestedTime: "Tempi richiesti", processingFee: "Spese di elaborazione", situation: "Situazione", income: "Redditi", charges: "Oneri", commitment: "Impegno", bank: "Banca", holder: "Intestatario", account: "IBAN / conto", swift: "SWIFT / BIC", amount: "Importo", duration: "Durata", processing: "Elaborazione", fees: "Spese", decision: "Decisione" }, commitment: "Informazioni corrette e documenti giustificativi richiesti", afterReview: "Dopo la valutazione",
  validationNote: "Il richiedente conferma l’esattezza delle informazioni comunicate. Possono essere richiesti documenti aggiuntivi in base alla domanda e alla valutazione della pratica. Questo progetto non costituisce approvazione automatica, promessa di erogazione o impegno definitivo di Virelia Crédit.", forVirelia: "PER VIRELIA CRÉDIT", directorGeneral: "Direttore Generale", institutionalValidation: "VALIDAZIONE ISTITUZIONALE", vicePresident: "Vicepresidente", approvedNote: "Pratica approvata — validazione istituzionale applicata in base allo stato reale della pratica.", draftNote: "Documento precontrattuale di riferimento — soggetto all’approvazione della pratica.",
  intro: (v) => `${v.name}, nato/a il ${v.birthDate}, ha presentato a Virelia Crédit una richiesta di ${v.program} per un importo di ${v.amount}, destinata a ${v.purpose}. Il presente documento è un progetto precontrattuale soggetto alla valutazione completa della pratica.`,
  narrativeIdentity: (v) => `${v.name}, nato/a il ${v.birthDate}, di nazionalità ${v.nationality} e residente in ${v.address}, ha presentato una richiesta di ${v.program}. L’importo richiesto è ${v.amount} per una durata desiderata di ${v.duration} mesi.`,
  narrativePurpose: (v) => `La richiesta è destinata al seguente scopo: ${v.purpose}. La situazione dichiarata è «${v.situation}». I redditi mensili dichiarati sono ${v.income} e gli oneri mensili dichiarati sono ${v.charges}. Queste informazioni saranno verificate durante la valutazione della pratica.`,
  narrativeFees: (v) => `Il tempo di elaborazione richiesto è ${v.speed}. Le spese corrispondenti sono ${v.fee}. Derivano dalla configurazione della piattaforma e non costituiscono garanzia di accettazione né decisione di credito. Le condizioni finanziarie definitive vengono stabilite solo dopo la valutazione, quando disponibili.`,
  narrativeBank: (v) => `Il richiedente ha indicato un conto intestato a ${v.holder}, presso ${v.bank}, con riferimento conto / IBAN ${v.account}${v.swift ? ` e codice SWIFT / BIC ${v.swift}` : ""}. Questi dati sono conservati nelle aree private della pratica e non sono esposti nel monitoraggio pubblico.`,
  narrativeValidation: "Il richiedente conferma di aver esaminato questo progetto e certifica l’esattezza delle informazioni comunicate. Possono essere richiesti documenti aggiuntivi. Il documento resta un PROGETTO DI CONTRATTO DI PRESTITO soggetto all’approvazione della pratica. Non costituisce accettazione automatica, promessa di erogazione o impegno definitivo di Virelia Crédit.",
};

const hr: ContractCopy = {
  localeTag: "hr-HR", brand: "VIRELIA CRÉDIT", title: "NACRT UGOVORA O KREDITU", subtitle: "Podliježe odobrenju zahtjeva", reference: "Referenca", date: "Datum", assignedAfterRegistration: "dodjeljuje se nakon registracije", months: "mjeseci", notProvided: "Nije navedeno", declaredSituation: "Prijavljena situacija",
  sections: ["1. Podnositelj zahtjeva", "2. Svrha zahtjeva", "3. Prijavljeni uvjeti", "4. Podaci za isplatu", "5. Bitni uvjeti", "6. Provjera dokumentacije"], narrativeSections: ["Identitet i zahtjev", "Svrha i prijavljeni uvjeti", "Obrada i naknade", "Prijavljeni podaci za isplatu", "Provjera dokumentacije"],
  labels: { fullName: "Puno ime", birth: "Datum rođenja", nationality: "Državljanstvo", address: "Adresa", phone: "Telefon", email: "E-pošta", loanType: "Vrsta kredita", requestedAmount: "Traženi iznos", desiredDuration: "Željeno trajanje", purpose: "Svrha", requestedTime: "Traženi rok", processingFee: "Naknada za obradu", situation: "Situacija", income: "Prihodi", charges: "Obveze", commitment: "Obveza", bank: "Banka", holder: "Vlasnik računa", account: "IBAN / račun", swift: "SWIFT / BIC", amount: "Iznos", duration: "Trajanje", processing: "Obrada", fees: "Naknade", decision: "Odluka" }, commitment: "Točne informacije i potrebni dokazni dokumenti", afterReview: "Nakon analize",
  validationNote: "Podnositelj potvrđuje točnost dostavljenih podataka. Ovisno o zahtjevu i analizi mogu se zatražiti dodatni dokumenti. Ovaj nacrt ne predstavlja automatsko odobrenje, obećanje isplate ni konačnu obvezu Virelia Crédit.", forVirelia: "ZA VIRELIA CRÉDIT", directorGeneral: "Glavni direktor", institutionalValidation: "INSTITUCIONALNA POTVRDA", vicePresident: "Potpredsjednik", approvedNote: "Zahtjev odobren — institucionalna potvrda primijenjena prema stvarnom statusu zahtjeva.", draftNote: "Predugovorni referentni dokument — podliježe odobrenju zahtjeva.",
  intro: (v) => `${v.name}, rođen/a ${v.birthDate}, podnio/la je Virelia Crédit zahtjev za ${v.program} u iznosu od ${v.amount}, namijenjen ${v.purpose}. Ovaj je dokument predugovorni nacrt koji podliježe potpunoj analizi zahtjeva.`,
  narrativeIdentity: (v) => `${v.name}, rođen/a ${v.birthDate}, državljanstva ${v.nationality} i s prebivalištem na adresi ${v.address}, podnio/la je zahtjev za ${v.program}. Traženi iznos je ${v.amount} uz željeno trajanje od ${v.duration} mjeseci.`,
  narrativePurpose: (v) => `Zahtjev je namijenjen sljedećoj svrsi: ${v.purpose}. Prijavljena situacija je „${v.situation}“. Prijavljeni mjesečni prihodi iznose ${v.income}, a mjesečne obveze ${v.charges}. Podaci će biti provjereni tijekom analize zahtjeva.`,
  narrativeFees: (v) => `Traženi rok obrade je ${v.speed}. Odgovarajuća naknada iznosi ${v.fee}. Naknada proizlazi iz konfiguracije platforme i nije jamstvo prihvaćanja niti kreditna odluka. Konačni financijski uvjeti utvrđuju se tek nakon analize kada su dostupni.`,
  narrativeBank: (v) => `Podnositelj je naveo račun na ime ${v.holder}, kod banke ${v.bank}, s referencom računa / IBAN ${v.account}${v.swift ? ` i SWIFT / BIC kodom ${v.swift}` : ""}. Ti se podaci čuvaju u privatnim dijelovima zahtjeva i nisu vidljivi u javnom praćenju.`,
  narrativeValidation: "Podnositelj potvrđuje da je pregledao ovaj nacrt i jamči točnost dostavljenih informacija. Mogu se zatražiti dodatni dokumenti. Ovaj dokument ostaje NACRT UGOVORA O KREDITU i podliježe odobrenju zahtjeva. Ne predstavlja automatsko prihvaćanje, obećanje isplate niti konačnu obvezu Virelia Crédit.",
};

export const CONTRACT_TRANSLATIONS: Record<SupportedLocale, ContractCopy> = { fr, en, de, es, pt, it, hr };

export function getContractCopy(locale: SupportedLocale): ContractCopy {
  return CONTRACT_TRANSLATIONS[locale] ?? CONTRACT_TRANSLATIONS.fr;
}
