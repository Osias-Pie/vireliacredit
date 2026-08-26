import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { CONTRACT_ASSETS } from "./official-assets";

export type ContractLayout = "structured" | "narrative";

export interface LoanContractInput {
  reference?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  employmentLabel?: string;
  incomeLabel?: string;
  monthlyChargesLabel?: string;
  programLabel: string;
  purpose: string;
  amountLabel: string;
  currency: string;
  durationMonths: string;
  processingSpeedLabel: string;
  processingFeeLabel: string;
  bankName: string;
  accountHolderName: string;
  ibanAccountNumber: string;
  swiftBic: string;
  confirmationDate: string;
  layout?: ContractLayout;
}

const NAVY = rgb(0.035, 0.118, 0.23);
const BLUE = rgb(0.082, 0.369, 0.937);
const GOLD = rgb(0.76, 0.59, 0.27);
const INK = rgb(0.08, 0.12, 0.2);
const MUTED = rgb(0.38, 0.42, 0.48);
const LINE = rgb(0.84, 0.78, 0.65);
const PAPER = rgb(0.992, 0.986, 0.97);

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(value);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(value, "base64"));
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const clean = (text || "—").replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["—"];
}

function centerText(page: PDFPage, font: PDFFont, text: string, y: number, size: number, width: number, color = NAVY) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
}

function safe(value?: string | null) {
  return value?.trim() || "—";
}

function humanDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR");
}

function drawTable(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  x: number,
  topY: number,
  width: number,
  rows: Array<[string, string]>,
  labelWidth = 112,
) {
  const size = 7.2;
  let y = topY;
  for (const [label, value] of rows) {
    const valueLines = wrap(font, safe(value), size, width - labelWidth - 12);
    const rowHeight = Math.max(18, valueLines.length * 9 + 6);
    page.drawRectangle({ x, y: y - rowHeight, width, height: rowHeight, borderColor: LINE, borderWidth: 0.55 });
    page.drawLine({ start: { x: x + labelWidth, y }, end: { x: x + labelWidth, y: y - rowHeight }, thickness: 0.45, color: LINE });
    page.drawText(label, { x: x + 6, y: y - 12, size: 6.9, font: bold, color: NAVY });
    valueLines.forEach((line, i) => page.drawText(line, { x: x + labelWidth + 6, y: y - 12 - i * 9, size, font, color: INK }));
    y -= rowHeight;
  }
  return y;
}

function sectionTitle(page: PDFPage, bold: PDFFont, text: string, x: number, y: number) {
  page.drawText(text.toUpperCase(), { x, y, size: 8.5, font: bold, color: NAVY });
  page.drawLine({ start: { x, y: y - 4 }, end: { x: x + 58, y: y - 4 }, thickness: 1.2, color: GOLD });
}

async function embedOfficialAssets(doc: PDFDocument) {
  return {
    seal: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.sealJpegBase64)),
    director: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.directorSignatureJpegBase64)),
    vicePresident: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.vicePresidentSignatureJpegBase64)),
    approved: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.approvedStampJpegBase64)),
  };
}

function drawBrandFrame(page: PDFPage, width: number, height: number) {
  page.drawRectangle({ x: 12, y: 12, width: width - 24, height: height - 24, borderColor: NAVY, borderWidth: 1.4 });
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: GOLD, borderWidth: 0.55 });
}

function drawHeader(
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  width: number,
  seal: Awaited<ReturnType<PDFDocument["embedJpg"]>>,
  input: LoanContractInput,
) {
  page.drawImage(seal, { x: 36, y: 742, width: 72, height: 72 });
  centerText(page, bold, "VIRELIA CRÉDIT", 787, 17, width, NAVY);
  centerText(page, bold, "PROJET DE CONTRAT DE PRÊT", 758, 15.5, width, NAVY);
  centerText(page, regular, "Soumis à validation du dossier", 739, 9, width, GOLD);
  page.drawLine({ start: { x: 137, y: 729 }, end: { x: width - 40, y: 729 }, thickness: 0.8, color: GOLD });
  page.drawText(`Référence : ${input.reference || "PROJET – attribuée après enregistrement"}`, { x: 140, y: 714, size: 7.5, font: bold, color: NAVY });
  page.drawText(`Date : ${humanDate(input.confirmationDate)}`, { x: 405, y: 714, size: 7.5, font: bold, color: NAVY });
}

function drawWatermark(page: PDFPage, seal: Awaited<ReturnType<PDFDocument["embedJpg"]>>, width: number, height: number) {
  page.drawImage(seal, { x: width / 2 - 150, y: height / 2 - 150, width: 300, height: 300, opacity: 0.055 });
}

function drawSignatures(
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  director: Awaited<ReturnType<PDFDocument["embedJpg"]>>,
  vicePresident: Awaited<ReturnType<PDFDocument["embedJpg"]>>,
  approved: Awaited<ReturnType<PDFDocument["embedJpg"]>>,
) {
  page.drawLine({ start: { x: 298, y: 128 }, end: { x: 298, y: 52 }, thickness: 0.45, color: GOLD });

  page.drawText("POUR VIRELIA CRÉDIT", { x: 88, y: 118, size: 8.4, font: bold, color: NAVY });
  page.drawText("Directeur Général", { x: 113, y: 106, size: 7.2, font: regular, color: GOLD });
  page.drawImage(director, { x: 76, y: 57, width: 142, height: 66 });
  page.drawLine({ start: { x: 69, y: 54 }, end: { x: 229, y: 54 }, thickness: 0.45, color: GOLD });

  page.drawText("VALIDATION INSTITUTIONNELLE", { x: 344, y: 118, size: 8.4, font: bold, color: NAVY });
  page.drawText("Vice-Président", { x: 397, y: 106, size: 7.2, font: regular, color: GOLD });
  page.drawImage(vicePresident, { x: 338, y: 56, width: 92, height: 82 });
  page.drawImage(approved, { x: 424, y: 53, width: 93, height: 78, opacity: 0.93 });
  page.drawLine({ start: { x: 335, y: 54 }, end: { x: 516, y: 54 }, thickness: 0.45, color: GOLD });

  page.drawText("Document de référence pré-contractuel — ne constitue pas un engagement définitif de Virelia Crédit.", {
    x: 99,
    y: 30,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
}

function drawStructured(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  input: LoanContractInput,
) {
  const leftX = 42;
  const gap = 12;
  const colW = 249;
  const rightX = leftX + colW + gap;

  const intro = `Monsieur / Madame ${safe(`${input.firstName} ${input.lastName}`)}, né(e) le ${safe(input.birthDate)}, a soumis auprès de Virelia Crédit une demande de ${safe(input.programLabel)} d’un montant de ${safe(input.amountLabel)}, destinée à ${safe(input.purpose)}.`;
  wrap(regular, intro, 7.4, 500).slice(0, 3).forEach((line, i) => page.drawText(line, { x: 48, y: 687 - i * 9.5, size: 7.4, font: regular, color: INK }));

  sectionTitle(page, bold, "1. Demandeur", leftX, 650);
  sectionTitle(page, bold, "2. Objet de la demande", rightX, 650);

  const y1 = drawTable(page, regular, bold, leftX, 638, colW, [
    ["Nom complet", `${input.firstName} ${input.lastName}`],
    ["Naissance", input.birthDate],
    ["Nationalité", input.nationality],
    ["Adresse", input.address],
    ["Téléphone", input.phone],
    ["E-mail", input.email],
  ], 87);
  const y2 = drawTable(page, regular, bold, rightX, 638, colW, [
    ["Type de prêt", input.programLabel],
    ["Montant demandé", input.amountLabel],
    ["Durée souhaitée", `${input.durationMonths} mois`],
    ["Objet", input.purpose],
    ["Délai demandé", input.processingSpeedLabel],
    ["Frais de dossier", input.processingFeeLabel],
  ], 91);

  const nextY = Math.min(y1, y2) - 20;
  sectionTitle(page, bold, "3. Conditions déclarées", leftX, nextY);
  sectionTitle(page, bold, "4. Coordonnées de versement", rightX, nextY);

  const c1 = drawTable(page, regular, bold, leftX, nextY - 12, colW, [
    ["Situation", input.employmentLabel || "Situation déclarée dans le dossier"],
    ["Revenus déclarés", input.incomeLabel || "Voir dossier"],
    ["Charges déclarées", input.monthlyChargesLabel || "Voir dossier"],
    ["Engagement", "Informations exactes et justificatifs requis"],
  ], 91);
  const c2 = drawTable(page, regular, bold, rightX, nextY - 12, colW, [
    ["Banque", input.bankName],
    ["Titulaire", input.accountHolderName],
    ["IBAN / compte", input.ibanAccountNumber],
    ["SWIFT / BIC", input.swiftBic || "Non renseigné"],
  ], 91);

  const condY = Math.min(c1, c2) - 18;
  sectionTitle(page, bold, "5. Conditions essentielles", leftX, condY);
  const boxTop = condY - 12;
  page.drawRectangle({ x: leftX, y: boxTop - 45, width: 510, height: 45, borderColor: LINE, borderWidth: 0.6, color: PAPER, opacity: 0.84 });
  const conditions = [
    ["Montant", input.amountLabel],
    ["Durée", `${input.durationMonths} mois`],
    ["Traitement", input.processingSpeedLabel],
    ["Frais", input.processingFeeLabel],
    ["Décision", "Après étude du dossier"],
  ] as const;
  const cw = 102;
  conditions.forEach(([label, value], index) => {
    const x = leftX + index * cw;
    if (index) page.drawLine({ start: { x, y: boxTop }, end: { x, y: boxTop - 45 }, thickness: 0.4, color: LINE });
    page.drawText(label, { x: x + 5, y: boxTop - 12, size: 6.5, font: bold, color: NAVY });
    wrap(regular, value, 6.5, cw - 10).slice(0, 2).forEach((line, i) => page.drawText(line, { x: x + 5, y: boxTop - 25 - i * 8, size: 6.5, font: regular, color: INK }));
  });

  const valY = boxTop - 62;
  sectionTitle(page, bold, "6. Validation documentaire", leftX, valY);
  const note = "Le présent projet reprend les informations communiquées par le demandeur. Il reste soumis à l’étude du dossier, à la vérification des pièces justificatives et aux conditions applicables de la plateforme. Aucun accord de financement n’est garanti par ce document.";
  wrap(regular, note, 6.8, 500).slice(0, 4).forEach((line, i) => page.drawText(line, { x: leftX, y: valY - 16 - i * 8.2, size: 6.8, font: regular, color: INK }));
}

function drawNarrative(page: PDFPage, regular: PDFFont, bold: PDFFont, input: LoanContractInput) {
  let y = 683;
  const x = 52;
  const maxWidth = 491;
  const para = (text: string, size = 7.6, gap = 7) => {
    const lines = wrap(regular, text, size, maxWidth);
    lines.forEach((line) => {
      page.drawText(line, { x, y, size, font: regular, color: INK });
      y -= size + 2.2;
    });
    y -= gap;
  };
  const heading = (n: string, title: string) => {
    page.drawText(`${n}. ${title.toUpperCase()}`, { x, y, size: 9, font: bold, color: NAVY });
    page.drawLine({ start: { x, y: y - 4 }, end: { x: x + 72, y: y - 4 }, thickness: 1.1, color: GOLD });
    y -= 18;
  };

  para(`Monsieur / Madame ${safe(`${input.firstName} ${input.lastName}`)}, né(e) le ${safe(input.birthDate)}, a transmis à Virelia Crédit une demande de ${safe(input.programLabel)} d’un montant de ${safe(input.amountLabel)}. Le financement demandé est destiné à : ${safe(input.purpose)}.`);

  heading("1", "Identification du demandeur");
  para(`Le demandeur déclare résider à l’adresse suivante : ${safe(input.address)}. Il peut être contacté au ${safe(input.phone)} et à l’adresse électronique ${safe(input.email)}. Nationalité déclarée : ${safe(input.nationality)}.`);

  heading("2", "Situation et demande");
  para(`Situation professionnelle déclarée : ${safe(input.employmentLabel)}. Revenus déclarés : ${safe(input.incomeLabel)}. Charges mensuelles déclarées : ${safe(input.monthlyChargesLabel)}. La durée souhaitée est de ${safe(input.durationMonths)} mois, avec un délai de traitement demandé « ${safe(input.processingSpeedLabel)} ».`);

  heading("3", "Frais de dossier et conditions de traitement");
  para(`Les frais de dossier applicables à la demande sont ceux déterminés par la grille de la plateforme pour le délai choisi : ${safe(input.processingFeeLabel)}. Ces frais ne constituent pas une garantie d’accord. Le dossier reste soumis à vérification, analyse et décision.`);

  heading("4", "Coordonnées de versement déclarées");
  para(`Banque : ${safe(input.bankName)}. Titulaire du compte : ${safe(input.accountHolderName)}. IBAN / numéro de compte : ${safe(input.ibanAccountNumber)}. SWIFT / BIC : ${safe(input.swiftBic || "Non renseigné")}. Ces données sont intégrées uniquement au document privé personnalisé et ne sont pas destinées à l’espace public de suivi.`);

  heading("5", "Validation documentaire");
  para("Le demandeur confirme l’exactitude des informations transmises et accepte que des pièces complémentaires puissent être demandées. Ce document est un projet pré-contractuel soumis à validation du dossier. Il ne vaut ni acceptation automatique du prêt, ni promesse de décaissement, ni engagement définitif de Virelia Crédit.", 7.4, 4);
}

export async function generateLoanContractPdf(input: LoanContractInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const assets = await embedOfficialAssets(doc);

  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });
  drawBrandFrame(page, width, height);
  drawWatermark(page, assets.seal, width, height);
  drawHeader(page, bold, regular, width, assets.seal, input);

  if ((input.layout ?? "structured") === "narrative") drawNarrative(page, regular, bold, input);
  else drawStructured(page, regular, bold, input);

  drawSignatures(page, bold, regular, assets.director, assets.vicePresident, assets.approved);
  return doc.save();
}
