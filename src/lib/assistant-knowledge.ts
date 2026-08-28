import { PROCESSING_FEE_POLICY } from "@/config/loans";
import { dossierValues, localizeProgram, localizeSpeed } from "@/lib/i18n/application-values";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n/locale-core";

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

const PRODUCT_CODES = ["personal", "professional", "business", "housing", "studies", "project", "retired"] as const;

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
  const bankKeyword = /\b(iban|swift|bic|num[eé]ro de compte|account number|bank account|kontonummer|numero de cuenta|número de conta|numero di conto|broj računa)\b/i.test(compact);
  const longAccountLike = /\b\d{10,34}\b/.test(compact.replace(/[ .-]/g, ""));
  return ibanLike || (bankKeyword && longAccountLike);
}

const COPY = {
  fr: {
    sensitive: "Je ne peux pas traiter ni transmettre une coordonnée bancaire. Saisissez votre IBAN, numéro de compte ou SWIFT uniquement dans l'étape sécurisée prévue dans le formulaire.",
    about: "Virelia Crédit est une plateforme de demande et de suivi de prêts remboursables. Elle permet de vérifier votre profil, transmettre votre demande et vos justificatifs, consulter votre projet de contrat et suivre l'avancement avec votre référence VIR. Chaque dossier est étudié individuellement : aucun prêt n'est accordé automatiquement.",
    retired: "Le prêt retraité est destiné aux personnes retraitées. Le formulaire adapte les justificatifs à cette situation, notamment la preuve de pension. L'acceptation dépend toujours de l'étude individuelle du dossier.",
    docs: "Le dossier demande au minimum une pièce d'identité et un justificatif de domicile. Selon la situation déclarée, un justificatif de salaire, de revenus professionnels, de pension ou de revenus peut être demandé. Des pièces complémentaires peuvent aussi être demandées.",
    eligibility: "La vérification d'éligibilité est un test d'orientation en trois questions. Elle aide à savoir si vous pouvez poursuivre vers une demande, mais elle ne constitue ni une décision d'octroi ni une promesse de financement.",
    reference: "Votre référence VIR est affichée juste après l'envoi réussi de la demande. Conservez-la avec l'adresse e-mail utilisée lors du dépôt : les deux sont nécessaires pour le suivi.",
    tracking: "Pour suivre votre demande, ouvrez la page « Suivre ma demande » et saisissez votre référence VIR ainsi que l'adresse e-mail utilisée lors du dépôt. Aucune coordonnée bancaire n'est demandée sur cette page.",
    contract: "Virelia génère deux versions privées du projet de contrat : une version structurée avec tableaux et une version narrative rédigée. Elles sont générées dans la langue enregistrée avec votre dossier. Le cachet APPROVED n'est ajouté qu'après un véritable statut d'approbation.",
    apply: "La demande se fait en cinq étapes : informations personnelles, situation professionnelle et financière, caractéristiques du prêt, documents justificatifs, puis coordonnées bancaires et lecture du projet de contrat. Après confirmation, une référence VIR est créée pour le suivi.",
    generic: "Je peux vous renseigner sur Virelia Crédit, les types de prêts, l'éligibilité, le formulaire, les documents, les frais configurés, le projet de contrat, la référence VIR et le suivi. Je ne peux ni garantir ni décider l'octroi d'un prêt.",
    productsPrefix: "Virelia Crédit propose actuellement sept catégories de prêts remboursables :",
    feesPrefix: "Les frais de traitement configurés dépendent du délai choisi :",
    feesSuffix: "Le montant est appliqué dans la devise sélectionnée. Ces frais ne garantissent jamais l'obtention du prêt.",
    statusPrefix: "Le statut actuel de votre dossier est",
    statusSuffix: "Le suivi affiche uniquement les informations publiques du dossier.",
    missingPrefix: "Il vous reste à renseigner :",
    confirmation: "Votre demande a été enregistrée. Conservez votre référence VIR et l'adresse e-mail utilisée : elles sont nécessaires pour le suivi et l'accès aux documents privés.",
    application: "Vous êtes dans le formulaire de demande. Je peux vous aider sur les champs, les justificatifs, les frais configurés ou le projet de contrat. Aucune donnée bancaire ne m'est transmise.",
  },
  en: {
    sensitive: "I cannot process or transmit bank details. Enter your IBAN, account number or SWIFT only in the secure form step.",
    about: "Virelia Credit is a platform for submitting and tracking repayable loan applications. You can check your profile, submit an application and supporting documents, review a draft agreement and track progress with your VIR reference. Every application is reviewed individually; approval is never automatic.",
    retired: "The retiree loan is intended for retired applicants. The form adapts the required documents to this situation, including pension evidence. Approval always depends on an individual review.",
    docs: "The application requires at least an identity document and proof of address. Depending on your declared situation, proof of salary, professional income, pension or other income may be required. Additional documents may also be requested.",
    eligibility: "The eligibility check is a three-question orientation test. It helps determine whether you can continue to an application, but it is neither a lending decision nor a promise of financing.",
    reference: "Your VIR reference is displayed immediately after a successful submission. Keep it with the email address used for the application; both are required for tracking.",
    tracking: "To track your application, open the tracking page and enter your VIR reference and the email address used when applying. No bank details are requested on that page.",
    contract: "Virelia generates two private draft agreement versions: a structured version with tables and a narrative version. Both are generated in the language stored with your application. The APPROVED stamp appears only after a real approval status.",
    apply: "The application has five steps: personal information, professional and financial situation, loan details, supporting documents, then bank details and review of the draft agreement. After confirmation, a VIR reference is created for tracking.",
    generic: "I can help with Virelia Credit, loan types, eligibility, the application form, documents, configured fees, the draft agreement, VIR references and tracking. I cannot guarantee or decide whether a loan is granted.",
    productsPrefix: "Virelia Credit currently offers seven categories of repayable loans:",
    feesPrefix: "Configured processing fees depend on the selected processing time:",
    feesSuffix: "The amount is applied in the selected currency. These fees never guarantee loan approval.",
    statusPrefix: "The current status of your application is",
    statusSuffix: "Tracking only displays public application information.",
    missingPrefix: "You still need to provide:",
    confirmation: "Your application has been recorded. Keep your VIR reference and the email address used; they are required for tracking and access to private documents.",
    application: "You are in the application form. I can help with fields, supporting documents, configured fees or the draft agreement. No bank details are sent to me.",
  },
  de: {
    sensitive: "Ich kann keine Bankdaten verarbeiten oder übermitteln. Geben Sie IBAN, Kontonummer oder SWIFT ausschließlich im dafür vorgesehenen sicheren Formularschritt ein.",
    about: "Virelia Kredit ist eine Plattform zur Einreichung und Nachverfolgung rückzahlbarer Darlehensanträge. Sie können Ihre Eignung prüfen, Antrag und Nachweise einreichen, einen Vertragsentwurf einsehen und den Vorgang mit Ihrer VIR-Referenz verfolgen. Jeder Antrag wird individuell geprüft; eine Genehmigung erfolgt nie automatisch.",
    retired: "Das Darlehen für Rentner richtet sich an Personen im Ruhestand. Das Formular passt die Nachweise an, einschließlich Rentennachweis. Eine Annahme hängt immer von der individuellen Prüfung ab.",
    docs: "Mindestens ein Identitätsnachweis und ein Adressnachweis sind erforderlich. Je nach Situation können Gehalts-, Einkommens- oder Rentennachweise verlangt werden. Weitere Unterlagen können angefordert werden.",
    eligibility: "Die Eignungsprüfung ist ein Orientierungstest mit drei Fragen. Sie zeigt, ob Sie mit einem Antrag fortfahren können, ist aber weder eine Kreditentscheidung noch eine Finanzierungszusage.",
    reference: "Ihre VIR-Referenz wird direkt nach erfolgreicher Einreichung angezeigt. Bewahren Sie sie zusammen mit der verwendeten E-Mail-Adresse auf; beide werden für die Nachverfolgung benötigt.",
    tracking: "Öffnen Sie zur Nachverfolgung die entsprechende Seite und geben Sie VIR-Referenz und die beim Antrag verwendete E-Mail-Adresse ein. Bankdaten werden dort nicht abgefragt.",
    contract: "Virelia erstellt zwei private Vertragsentwürfe: eine strukturierte Version mit Tabellen und eine Textversion. Beide werden in der mit dem Antrag gespeicherten Sprache erzeugt. Der APPROVED-Stempel erscheint erst nach einem tatsächlichen Genehmigungsstatus.",
    apply: "Der Antrag umfasst fünf Schritte: persönliche Angaben, berufliche und finanzielle Situation, Darlehensdaten, Nachweise sowie Bankdaten und Prüfung des Vertragsentwurfs. Nach Bestätigung wird eine VIR-Referenz erstellt.",
    generic: "Ich kann zu Virelia Kredit, Darlehensarten, Eignung, Formular, Unterlagen, konfigurierten Gebühren, Vertragsentwurf, VIR-Referenz und Nachverfolgung helfen. Ich kann keine Kreditvergabe garantieren oder entscheiden.",
    productsPrefix: "Virelia Kredit bietet derzeit sieben Kategorien rückzahlbarer Darlehen:", feesPrefix: "Die konfigurierten Bearbeitungsgebühren hängen von der gewählten Bearbeitungszeit ab:", feesSuffix: "Der Betrag gilt in der gewählten Währung. Diese Gebühren garantieren keine Genehmigung.", statusPrefix: "Der aktuelle Status Ihres Antrags ist", statusSuffix: "Die Nachverfolgung zeigt nur öffentliche Informationen.", missingPrefix: "Folgende Angaben fehlen noch:", confirmation: "Ihr Antrag wurde erfasst. Bewahren Sie VIR-Referenz und E-Mail-Adresse auf; beide werden für Nachverfolgung und private Dokumente benötigt.", application: "Sie befinden sich im Antragsformular. Ich helfe bei Feldern, Nachweisen, Gebühren und Vertragsentwurf. Bankdaten werden mir nicht übermittelt.",
  },
  es: {
    sensitive: "No puedo procesar ni transmitir datos bancarios. Introduzca el IBAN, número de cuenta o SWIFT únicamente en la etapa segura del formulario.",
    about: "Virelia Crédit es una plataforma para presentar y seguir solicitudes de préstamos reembolsables. Puede comprobar su perfil, enviar la solicitud y justificantes, revisar un proyecto de contrato y seguir el expediente con su referencia VIR. Cada expediente se estudia individualmente; la aprobación nunca es automática.",
    retired: "El préstamo para jubilados está destinado a personas jubiladas. El formulario adapta los justificantes, incluida la prueba de pensión. La aceptación depende siempre del estudio individual.",
    docs: "El expediente exige al menos un documento de identidad y un justificante de domicilio. Según la situación declarada, pueden pedirse justificantes de salario, ingresos profesionales, pensión u otros ingresos, así como documentos adicionales.",
    eligibility: "La comprobación de elegibilidad es una prueba orientativa de tres preguntas. Ayuda a saber si puede continuar con una solicitud, pero no es una decisión de crédito ni una promesa de financiación.",
    reference: "Su referencia VIR aparece inmediatamente después de enviar correctamente la solicitud. Consérvela junto con el correo utilizado; ambos son necesarios para el seguimiento.",
    tracking: "Para seguir la solicitud, abra la página de seguimiento e introduzca la referencia VIR y el correo utilizado. No se solicitan datos bancarios en esa página.",
    contract: "Virelia genera dos versiones privadas del proyecto de contrato: una estructurada con tablas y otra narrativa. Ambas se generan en el idioma guardado con el expediente. El sello APPROVED solo aparece tras un estado real de aprobación.",
    apply: "La solicitud consta de cinco etapas: datos personales, situación profesional y financiera, características del préstamo, justificantes y, finalmente, datos bancarios y revisión del proyecto de contrato. Tras confirmar se crea una referencia VIR.",
    generic: "Puedo ayudarle con Virelia Crédit, tipos de préstamos, elegibilidad, formulario, documentos, gastos configurados, proyecto de contrato, referencia VIR y seguimiento. No puedo garantizar ni decidir la concesión de un préstamo.",
    productsPrefix: "Virelia Crédit ofrece actualmente siete categorías de préstamos reembolsables:", feesPrefix: "Los gastos de tramitación configurados dependen del plazo elegido:", feesSuffix: "El importe se aplica en la moneda seleccionada. Estos gastos nunca garantizan la aprobación.", statusPrefix: "El estado actual de su expediente es", statusSuffix: "El seguimiento solo muestra información pública del expediente.", missingPrefix: "Aún debe indicar:", confirmation: "Su solicitud ha sido registrada. Conserve la referencia VIR y el correo utilizado; son necesarios para el seguimiento y los documentos privados.", application: "Está en el formulario de solicitud. Puedo ayudar con los campos, justificantes, gastos configurados o proyecto de contrato. No recibo sus datos bancarios.",
  },
  pt: {
    sensitive: "Não posso tratar nem transmitir dados bancários. Introduza o IBAN, número de conta ou SWIFT apenas na etapa segura prevista no formulário.",
    about: "A Virelia Crédit é uma plataforma para apresentar e acompanhar pedidos de crédito reembolsável. Pode verificar o seu perfil, enviar o pedido e comprovativos, consultar um projeto de contrato e acompanhar o processo com a referência VIR. Cada processo é analisado individualmente; a aprovação nunca é automática.",
    retired: "O crédito para reformados destina-se a pessoas reformadas. O formulário adapta os comprovativos, incluindo a prova de pensão. A aceitação depende sempre da análise individual do processo.",
    docs: "O processo exige pelo menos um documento de identificação e um comprovativo de morada. Conforme a situação declarada, podem ser solicitados comprovativos de salário, rendimentos profissionais, pensão ou outros rendimentos, bem como documentos adicionais.",
    eligibility: "A verificação de elegibilidade é um teste de orientação com três perguntas. Ajuda a saber se pode avançar para um pedido, mas não constitui uma decisão de crédito nem uma promessa de financiamento.",
    reference: "A sua referência VIR é apresentada imediatamente após o envio bem-sucedido do pedido. Guarde-a com o e-mail utilizado; ambos são necessários para o acompanhamento.",
    tracking: "Para acompanhar o pedido, abra a página de acompanhamento e introduza a referência VIR e o e-mail utilizado. Não são pedidos dados bancários nessa página.",
    contract: "A Virelia gera duas versões privadas do projeto de contrato: uma versão estruturada com tabelas e uma versão narrativa. Ambas são geradas no idioma guardado com o processo. O carimbo APPROVED só aparece depois de um estado real de aprovação.",
    apply: "O pedido é feito em cinco etapas: dados pessoais, situação profissional e financeira, características do crédito, documentos comprovativos e, por fim, dados bancários e revisão do projeto de contrato. Após a confirmação é criada uma referência VIR.",
    generic: "Posso ajudar sobre a Virelia Crédit, tipos de crédito, elegibilidade, formulário, documentos, encargos configurados, projeto de contrato, referência VIR e acompanhamento. Não posso garantir nem decidir a concessão de um crédito.",
    productsPrefix: "A Virelia Crédit disponibiliza atualmente sete categorias de créditos reembolsáveis:", feesPrefix: "Os encargos de tratamento configurados dependem do prazo escolhido:", feesSuffix: "O montante é aplicado na moeda selecionada. Estes encargos nunca garantem a aprovação.", statusPrefix: "O estado atual do seu processo é", statusSuffix: "O acompanhamento mostra apenas informações públicas do processo.", missingPrefix: "Ainda falta indicar:", confirmation: "O seu pedido foi registado. Guarde a referência VIR e o e-mail utilizado; são necessários para o acompanhamento e para aceder aos documentos privados.", application: "Está no formulário de pedido. Posso ajudar com campos, comprovativos, encargos configurados ou projeto de contrato. Não recebo os seus dados bancários.",
  },
  it: {
    sensitive: "Non posso trattare né trasmettere dati bancari. Inserisci IBAN, numero di conto o SWIFT solo nella fase sicura prevista dal modulo.",
    about: "Virelia Crédit è una piattaforma per presentare e seguire richieste di prestiti rimborsabili. Puoi verificare il profilo, inviare richiesta e documenti, consultare un progetto di contratto e seguire la pratica con il riferimento VIR. Ogni pratica è valutata individualmente; l'approvazione non è mai automatica.",
    retired: "Il prestito per pensionati è destinato alle persone in pensione. Il modulo adatta i documenti richiesti, compresa la prova della pensione. L'accettazione dipende sempre dalla valutazione individuale.",
    docs: "La pratica richiede almeno un documento di identità e una prova di indirizzo. In base alla situazione dichiarata possono essere richieste prove di stipendio, reddito professionale, pensione o altri redditi, oltre a documenti aggiuntivi.",
    eligibility: "La verifica di idoneità è un test orientativo di tre domande. Aiuta a capire se è possibile proseguire con una richiesta, ma non è una decisione di credito né una promessa di finanziamento.",
    reference: "Il riferimento VIR viene mostrato subito dopo l'invio riuscito. Conservalo insieme all'e-mail utilizzata; entrambi sono necessari per il monitoraggio.",
    tracking: "Per seguire la richiesta, apri la pagina di monitoraggio e inserisci il riferimento VIR e l'e-mail utilizzata. In quella pagina non vengono richiesti dati bancari.",
    contract: "Virelia genera due versioni private del progetto di contratto: una strutturata con tabelle e una narrativa. Entrambe vengono generate nella lingua salvata con la pratica. Il timbro APPROVED appare solo dopo un vero stato di approvazione.",
    apply: "La richiesta si svolge in cinque fasi: dati personali, situazione professionale e finanziaria, caratteristiche del prestito, documenti giustificativi, quindi dati bancari e revisione del progetto di contratto. Dopo la conferma viene creato un riferimento VIR.",
    generic: "Posso aiutarti su Virelia Crédit, tipi di prestito, idoneità, modulo, documenti, spese configurate, progetto di contratto, riferimento VIR e monitoraggio. Non posso garantire né decidere la concessione di un prestito.",
    productsPrefix: "Virelia Crédit offre attualmente sette categorie di prestiti rimborsabili:", feesPrefix: "Le spese di elaborazione configurate dipendono dal tempo scelto:", feesSuffix: "L'importo si applica nella valuta selezionata. Queste spese non garantiscono mai l'approvazione.", statusPrefix: "Lo stato attuale della pratica è", statusSuffix: "Il monitoraggio mostra solo informazioni pubbliche della pratica.", missingPrefix: "Devi ancora indicare:", confirmation: "La richiesta è stata registrata. Conserva il riferimento VIR e l'e-mail utilizzata; sono necessari per il monitoraggio e i documenti privati.", application: "Sei nel modulo di richiesta. Posso aiutare con campi, documenti, spese configurate o progetto di contratto. Non ricevo i tuoi dati bancari.",
  },
  hr: {
    sensitive: "Ne mogu obrađivati ni prenositi bankovne podatke. IBAN, broj računa ili SWIFT unesite samo u sigurnom koraku obrasca.",
    about: "Virelia Crédit je platforma za podnošenje i praćenje zahtjeva za povratne kredite. Možete provjeriti profil, poslati zahtjev i dokumente, pregledati nacrt ugovora i pratiti predmet pomoću VIR reference. Svaki se zahtjev razmatra pojedinačno; odobrenje nikada nije automatsko.",
    retired: "Kredit za umirovljenike namijenjen je umirovljenim osobama. Obrazac prilagođava potrebne dokaze, uključujući dokaz o mirovini. Prihvaćanje uvijek ovisi o pojedinačnoj analizi.",
    docs: "Zahtjev traži najmanje identifikacijski dokument i dokaz adrese. Ovisno o prijavljenoj situaciji mogu se tražiti dokazi o plaći, profesionalnim prihodima, mirovini ili drugim prihodima te dodatni dokumenti.",
    eligibility: "Provjera prihvatljivosti orijentacijski je test od tri pitanja. Pomaže utvrditi možete li nastaviti sa zahtjevom, ali nije kreditna odluka ni obećanje financiranja.",
    reference: "VIR referenca prikazuje se odmah nakon uspješnog slanja zahtjeva. Sačuvajte je s e-poštom korištenom pri prijavi; oboje je potrebno za praćenje.",
    tracking: "Za praćenje otvorite stranicu za praćenje i unesite VIR referencu i korištenu e-poštu. Na toj se stranici ne traže bankovni podaci.",
    contract: "Virelia izrađuje dvije privatne verzije nacrta ugovora: strukturiranu s tablicama i narativnu. Obje se generiraju na jeziku spremljenom uz zahtjev. Pečat APPROVED pojavljuje se tek nakon stvarnog statusa odobrenja.",
    apply: "Zahtjev ima pet koraka: osobni podaci, profesionalna i financijska situacija, podaci o kreditu, popratni dokumenti, zatim bankovni podaci i pregled nacrta ugovora. Nakon potvrde stvara se VIR referenca.",
    generic: "Mogu pomoći s Virelia Crédit, vrstama kredita, prihvatljivošću, obrascem, dokumentima, konfiguriranim naknadama, nacrtom ugovora, VIR referencom i praćenjem. Ne mogu jamčiti niti odlučiti o odobrenju kredita.",
    productsPrefix: "Virelia Crédit trenutno nudi sedam kategorija povratnih kredita:", feesPrefix: "Konfigurirane naknade za obradu ovise o odabranom roku:", feesSuffix: "Iznos se primjenjuje u odabranoj valuti. Naknade nikada ne jamče odobrenje.", statusPrefix: "Trenutačni status vašeg zahtjeva je", statusSuffix: "Praćenje prikazuje samo javne informacije o zahtjevu.", missingPrefix: "Još trebate navesti:", confirmation: "Vaš je zahtjev zabilježen. Sačuvajte VIR referencu i korištenu e-poštu; potrebni su za praćenje i privatne dokumente.", application: "Nalazite se u obrascu zahtjeva. Mogu pomoći s poljima, dokumentima, naknadama ili nacrtom ugovora. Bankovni podaci mi se ne šalju.",
  },
} as const;

const STATUS_LABELS: Record<SupportedLocale, Record<string, string>> = {
  fr: { nouvelle_demande: "Nouvelle demande", dossier_en_verification: "Dossier en vérification", documents_a_completer: "Documents à compléter", complement_requis: "Complément requis", en_analyse: "En analyse", contrat_en_preparation: "Contrat en préparation", contrat_a_valider: "Contrat à valider", approuvee: "Approuvée", acceptee: "Acceptée", virement_en_preparation: "Virement en préparation", terminee: "Terminée", refusee: "Refusée", archivee: "Archivée" },
  en: { nouvelle_demande: "New application", dossier_en_verification: "Application under verification", documents_a_completer: "Documents to complete", complement_requis: "Additional information required", en_analyse: "Under review", contrat_en_preparation: "Agreement in preparation", contrat_a_valider: "Agreement to validate", approuvee: "Approved", acceptee: "Accepted", virement_en_preparation: "Transfer in preparation", terminee: "Completed", refusee: "Declined", archivee: "Archived" },
  de: { nouvelle_demande: "Neuer Antrag", dossier_en_verification: "Antrag wird geprüft", documents_a_completer: "Unterlagen zu ergänzen", complement_requis: "Ergänzung erforderlich", en_analyse: "In Prüfung", contrat_en_preparation: "Vertrag in Vorbereitung", contrat_a_valider: "Vertrag zu bestätigen", approuvee: "Genehmigt", acceptee: "Angenommen", virement_en_preparation: "Überweisung in Vorbereitung", terminee: "Abgeschlossen", refusee: "Abgelehnt", archivee: "Archiviert" },
  es: { nouvelle_demande: "Nueva solicitud", dossier_en_verification: "Expediente en verificación", documents_a_completer: "Documentos por completar", complement_requis: "Información adicional requerida", en_analyse: "En análisis", contrat_en_preparation: "Contrato en preparación", contrat_a_valider: "Contrato por validar", approuvee: "Aprobada", acceptee: "Aceptada", virement_en_preparation: "Transferencia en preparación", terminee: "Finalizada", refusee: "Rechazada", archivee: "Archivada" },
  pt: { nouvelle_demande: "Novo pedido", dossier_en_verification: "Processo em verificação", documents_a_completer: "Documentos a completar", complement_requis: "Complemento necessário", en_analyse: "Em análise", contrat_en_preparation: "Contrato em preparação", contrat_a_valider: "Contrato para validar", approuvee: "Aprovado", acceptee: "Aceite", virement_en_preparation: "Transferência em preparação", terminee: "Concluído", refusee: "Recusado", archivee: "Arquivado" },
  it: { nouvelle_demande: "Nuova richiesta", dossier_en_verification: "Pratica in verifica", documents_a_completer: "Documenti da completare", complement_requis: "Integrazione richiesta", en_analyse: "In analisi", contrat_en_preparation: "Contratto in preparazione", contrat_a_valider: "Contratto da validare", approuvee: "Approvata", acceptee: "Accettata", virement_en_preparation: "Trasferimento in preparazione", terminee: "Completata", refusee: "Rifiutata", archivee: "Archiviata" },
  hr: { nouvelle_demande: "Novi zahtjev", dossier_en_verification: "Zahtjev u provjeri", documents_a_completer: "Dokumenti za dopunu", complement_requis: "Potrebna dopuna", en_analyse: "U analizi", contrat_en_preparation: "Ugovor u pripremi", contrat_a_valider: "Ugovor za potvrdu", approuvee: "Odobreno", acceptee: "Prihvaćeno", virement_en_preparation: "Prijenos u pripremi", terminee: "Završeno", refusee: "Odbijeno", archivee: "Arhivirano" },
};

function feesAnswer(locale: SupportedLocale) {
  const copy = COPY[locale];
  const lines = Object.entries(PROCESSING_FEE_POLICY.tiers).map(
    ([speed, amount]) => `${localizeSpeed(speed, locale)}: ${amount}`,
  );
  return `${copy.feesPrefix} ${lines.join(", ")}. ${copy.feesSuffix}`;
}

function statusAnswer(status: string | undefined, locale: SupportedLocale) {
  const copy = COPY[locale];
  if (status) {
    const label = STATUS_LABELS[locale][status] ?? status.replaceAll("_", " ");
    return `${copy.statusPrefix} “${label}”. ${copy.statusSuffix}`;
  }
  return copy.tracking;
}

function hasAny(q: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(q));
}

export function answerFromVireliaKnowledge(
  message: string,
  ctx: AssistantKnowledgeContext = {},
  localeInput = "fr",
): string {
  const locale = normalizeLocale(localeInput) ?? "fr";
  const copy = COPY[locale];

  if (containsSensitiveBankData(message)) return copy.sensitive;

  const q = normalize(message);
  const missing = ctx.missingFields ?? [];

  if (hasAny(q, [/\bvirelia\b.*\b(quoi|qui|what|who|was|wer|que|quien|qué|quem|cosa|chi|sto|tko)\b/, /\b(qui est|c'est qui|what is|who is|was ist|qu[eé] es|quem [eé]|cos'?è|sto je)\b.*\bvirelia\b/]) || q === "virelia") {
    return copy.about;
  }

  if (hasAny(q, [/type.*(pret|loan|darlehen|prestamo|credito|prestito|kredit)/, /(solutions|tipos|tipi|vrste).*\b(pret|loan|credito|prestito|kredit)/])) {
    const products = PRODUCT_CODES.map((code) => localizeProgram(code, locale)).join(", ");
    return `${copy.productsPrefix} ${products}.`;
  }

  if (hasAny(q, [/retrait|pension|retir|jubil|reform|pensionat|umirovl/])) return copy.retired;
  if (hasAny(q, [/document|justific|piece|proof|unterlag|nachweis|comprov|documento|dokumen/])) return copy.docs;
  if (hasAny(q, [/eligibil|eligible|eignung|elegibil|idone|prihvatljiv/])) return copy.eligibility;
  if (hasAny(q, [/reference|referenz|referencia|refer[eê]ncia|riferimento|referenca|vir-/])) {
    return `${copy.reference}${ctx.reference ? ` ${ctx.reference}` : ""}`;
  }
  if (hasAny(q, [/suiv|track|status|statut|nachverfolg|seguim|acompan|monitor|pracen|praćen/])) return statusAnswer(ctx.status, locale);
  if (hasAny(q, [/contrat|contract|agreement|vertrag|contrato|ugovor|pdf/])) return copy.contract;
  if (hasAny(q, [/frais|fee|cost|gebuhr|gebühr|gasto|encargo|spes|naknad|delai|processing|rok|prazo|plazo/])) return feesAnswer(locale);
  if (hasAny(q, [/demande|application|antrag|solicitud|pedido|richiesta|zahtjev|formulaire|form|formular|modulo|obrazac/])) return copy.apply;

  if (missing.length) return `${copy.missingPrefix} ${missing.join(", ")}.`;
  if (ctx.page === "confirmation") return `${copy.confirmation}${ctx.reference ? ` ${ctx.reference}` : ""}`;
  if (ctx.page === "tracking" && ctx.status) return statusAnswer(ctx.status, locale);
  if (ctx.page === "application") return copy.application;
  return copy.generic;
}

const productKnowledge = PRODUCT_CODES.map((code) => dossierValues("fr").programs[code]).join(", ");
export const VIRELIA_ASSISTANT_KNOWLEDGE = `
Virelia Crédit is a repayable-loan application and tracking platform.
Supported active locales: fr, en, de, es, pt, it, hr. Always follow the active locale explicitly supplied by the application.
Journey: eligibility orientation, five-step application, supporting documents, private draft agreements, VIR reference, tracking with reference + email.
Products: ${productKnowledge}.
Configured processing fees: ${Object.entries(PROCESSING_FEE_POLICY.tiers).map(([speed, amount]) => `${speed}=${amount}`).join(", ")}.
Two private draft agreement formats exist: structured and narrative. Their language is the language stored with the application. APPROVED is reserved for a genuinely approved status.
Never request, return or transmit IBAN, account number, identity documents, private documents, internal notes or secrets.
`;
