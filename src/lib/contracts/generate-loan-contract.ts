import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
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
  /** APPROVED is never shown on a pre-validation draft. */
  approved?: boolean;
}

// Official Virelia document palette: blue #0B2A5B, gold #D4AF37, white #FFFFFF.
const NAVY = rgb(11 / 255, 42 / 255, 91 / 255);
const GOLD = rgb(212 / 255, 175 / 255, 55 / 255);
const WHITE = rgb(1, 1, 1);

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(value);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(value, "base64"));
}

function safe(value?: string | null) {
  return value?.trim() || "—";
}

function humanDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR");
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const clean = safe(text).replace(/\s+/g, " ");
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }

    // Break exceptionally long tokens (IBAN, e-mail, URL-like values) instead of overflowing.
    let chunk = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(chunk + char, size) <= maxWidth) chunk += char;
      else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  }

  if (current) lines.push(current);
  return lines.length ? lines : ["—"];
}

function cappedLines(font: PDFFont, text: string, size: number, width: number, maxLines: number) {
  const lines = wrap(font, text, size, width);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1] || "";
  while (last && font.widthOfTextAtSize(`${last}…`, size) > width) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

function centerText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  width: number,
  color = NAVY,
  opacity = 1,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color, opacity });
}

function drawFitImage(
  page: PDFPage,
  image: PDFImage,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  opacity = 1,
) {
  const dims = image.scaleToFit(maxWidth, maxHeight);
  page.drawImage(image, {
    x: x + (maxWidth - dims.width) / 2,
    y: y + (maxHeight - dims.height) / 2,
    width: dims.width,
    height: dims.height,
    opacity,
  });
}

async function embedOfficialAssets(doc: PDFDocument) {
  return {
    seal: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.sealJpegBase64)),
    director: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.directorSignatureJpegBase64)),
    vicePresident: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.vicePresidentSignatureJpegBase64)),
    approved: await doc.embedJpg(decodeBase64(CONTRACT_ASSETS.approvedStampJpegBase64)),
  };
}

function drawFrame(page: PDFPage, width: number, height: number) {
  page.drawRectangle({ x: 10, y: 10, width: width - 20, height: height - 20, color: WHITE });
  page.drawRectangle({ x: 12, y: 12, width: width - 24, height: height - 24, borderColor: NAVY, borderWidth: 1.4 });
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: GOLD, borderWidth: 0.65 });
}

function drawHeader(
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  seal: PDFImage,
  input: LoanContractInput,
  width: number,
) {
  drawFitImage(page, seal, 31, 739, 82, 82);
  centerText(page, bold, "VIRELIA CRÉDIT", 790, 18.5, width, NAVY);
  page.drawLine({ start: { x: 181, y: 781 }, end: { x: 414, y: 781 }, thickness: 0.7, color: GOLD });
  centerText(page, bold, "PROJET DE CONTRAT DE PRÊT", 758, 15.2, width, NAVY);
  centerText(page, regular, "Soumis à validation du dossier", 739, 9.2, width, GOLD);
  page.drawLine({ start: { x: 137, y: 728 }, end: { x: 552, y: 728 }, thickness: 0.7, color: GOLD });

  page.drawText(`Référence : ${input.reference || "attribuée après enregistrement"}`, {
    x: 141,
    y: 712,
    size: 7.4,
    font: bold,
    color: NAVY,
  });
  page.drawText(`Date : ${humanDate(input.confirmationDate)}`, {
    x: 412,
    y: 712,
    size: 7.4,
    font: bold,
    color: NAVY,
  });
}

function drawWatermark(page: PDFPage, seal: PDFImage, width: number, height: number) {
  drawFitImage(page, seal, width / 2 - 155, height / 2 - 155, 310, 310, 0.05);
}

function sectionTitle(page: PDFPage, bold: PDFFont, text: string, x: number, y: number) {
  page.drawText(text.toUpperCase(), { x, y, size: 8.4, font: bold, color: NAVY });
  page.drawLine({ start: { x, y: y - 4 }, end: { x: x + 62, y: y - 4 }, thickness: 1, color: GOLD });
}

function drawTable(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  x: number,
  topY: number,
  width: number,
  rows: Array<[string, string, number?]>,
  labelWidth = 88,
) {
  const size = 6.65;
  let y = topY;
  for (const [label, value, maxLines = 2] of rows) {
    const lines = cappedLines(regular, safe(value), size, width - labelWidth - 12, maxLines);
    const rowHeight = Math.max(17, lines.length * 8.1 + 5.5);
    page.drawRectangle({
      x,
      y: y - rowHeight,
      width,
      height: rowHeight,
      borderColor: GOLD,
      borderWidth: 0.38,
      borderOpacity: 0.65,
      color: WHITE,
      opacity: 0.82,
    });
    page.drawLine({
      start: { x: x + labelWidth, y },
      end: { x: x + labelWidth, y: y - rowHeight },
      thickness: 0.35,
      color: GOLD,
      opacity: 0.65,
    });
    page.drawText(label, { x: x + 5, y: y - 11.2, size: 6.35, font: bold, color: NAVY });
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: x + labelWidth + 5,
        y: y - 11.2 - index * 8.1,
        size,
        font: regular,
        color: NAVY,
        opacity: 0.92,
      });
    });
    y -= rowHeight;
  }
  return y;
}

function drawStructured(page: PDFPage, regular: PDFFont, bold: PDFFont, input: LoanContractInput) {
  const leftX = 42;
  const colW = 249;
  const rightX = 303;

  const intro = `Monsieur / Madame ${safe(`${input.firstName} ${input.lastName}`)}, né(e) le ${safe(input.birthDate)}, a soumis auprès de Virelia Crédit une demande de ${safe(input.programLabel)} d’un montant de ${safe(input.amountLabel)}, destinée à ${safe(input.purpose)}. Le présent document constitue un projet pré-contractuel soumis à l’étude complète du dossier.`;
  cappedLines(regular, intro, 7.15, 500, 4).forEach((line, i) => {
    page.drawText(line, { x: 48, y: 687 - i * 8.9, size: 7.15, font: regular, color: NAVY, opacity: 0.94 });
  });

  sectionTitle(page, bold, "1. Demandeur", leftX, 646);
  sectionTitle(page, bold, "2. Objet de la demande", rightX, 646);

  const firstBottom = Math.min(
    drawTable(page, regular, bold, leftX, 634, colW, [
      ["Nom complet", `${input.firstName} ${input.lastName}`],
      ["Naissance", input.birthDate],
      ["Nationalité", input.nationality],
      ["Adresse", input.address, 3],
      ["Téléphone", input.phone],
      ["E-mail", input.email, 2],
    ], 84),
    drawTable(page, regular, bold, rightX, 634, colW, [
      ["Type de prêt", input.programLabel],
      ["Montant demandé", input.amountLabel],
      ["Durée souhaitée", `${input.durationMonths} mois`],
      ["Objet", input.purpose, 3],
      ["Délai demandé", input.processingSpeedLabel],
      ["Frais de dossier", input.processingFeeLabel, 2],
    ], 88),
  );

  const secondTitleY = firstBottom - 17;
  sectionTitle(page, bold, "3. Conditions déclarées", leftX, secondTitleY);
  sectionTitle(page, bold, "4. Coordonnées de versement", rightX, secondTitleY);

  const secondBottom = Math.min(
    drawTable(page, regular, bold, leftX, secondTitleY - 12, colW, [
      ["Situation", input.employmentLabel || "Situation déclarée"],
      ["Revenus", input.incomeLabel || "Non renseigné"],
      ["Charges", input.monthlyChargesLabel || "Non renseigné"],
      ["Engagement", "Informations exactes et justificatifs requis", 2],
    ], 88),
    drawTable(page, regular, bold, rightX, secondTitleY - 12, colW, [
      ["Banque", input.bankName, 2],
      ["Titulaire", input.accountHolderName, 2],
      ["IBAN / compte", input.ibanAccountNumber, 2],
      ["SWIFT / BIC", input.swiftBic || "Non renseigné"],
    ], 88),
  );

  const conditionY = secondBottom - 17;
  sectionTitle(page, bold, "5. Conditions essentielles", leftX, conditionY);
  const boxTop = conditionY - 12;
  const boxHeight = 42;
  page.drawRectangle({
    x: leftX,
    y: boxTop - boxHeight,
    width: 510,
    height: boxHeight,
    borderColor: GOLD,
    borderWidth: 0.5,
    color: WHITE,
    opacity: 0.88,
  });
  const items = [
    ["Montant", input.amountLabel],
    ["Durée", `${input.durationMonths} mois`],
    ["Traitement", input.processingSpeedLabel],
    ["Frais", input.processingFeeLabel],
    ["Décision", "Après étude"],
  ] as const;
  const cell = 102;
  items.forEach(([label, value], index) => {
    const cellX = leftX + index * cell;
    if (index) {
      page.drawLine({ start: { x: cellX, y: boxTop }, end: { x: cellX, y: boxTop - boxHeight }, thickness: 0.35, color: GOLD, opacity: 0.65 });
    }
    page.drawText(label, { x: cellX + 5, y: boxTop - 11, size: 6.15, font: bold, color: NAVY });
    cappedLines(regular, value, 6.25, cell - 10, 2).forEach((line, i) => {
      page.drawText(line, { x: cellX + 5, y: boxTop - 23 - i * 7.4, size: 6.25, font: regular, color: NAVY, opacity: 0.9 });
    });
  });

  const validationY = boxTop - boxHeight - 17;
  sectionTitle(page, bold, "6. Validation documentaire", leftX, validationY);
  const note = "Le demandeur confirme l’exactitude des informations communiquées. Des documents complémentaires peuvent être demandés selon la nature de la demande et l’étude du dossier. Ce projet de contrat ne vaut ni accord automatique, ni promesse de décaissement, ni engagement définitif de Virelia Crédit.";
  cappedLines(regular, note, 6.65, 500, 4).forEach((line, i) => {
    page.drawText(line, { x: leftX, y: validationY - 15 - i * 8, size: 6.65, font: regular, color: NAVY, opacity: 0.9 });
  });
}

function drawNarrative(page: PDFPage, regular: PDFFont, bold: PDFFont, input: LoanContractInput) {
  let y = 685;
  const x = 50;
  const maxWidth = 495;

  const heading = (number: string, title: string) => {
    page.drawText(`${number}. ${title.toUpperCase()}`, { x, y, size: 8.8, font: bold, color: NAVY });
    page.drawLine({ start: { x, y: y - 4 }, end: { x: x + 72, y: y - 4 }, thickness: 0.8, color: GOLD });
    y -= 17;
  };

  const paragraph = (text: string, maxLines = 7, gap = 8) => {
    const lines = cappedLines(regular, text, 7.25, maxWidth, maxLines);
    for (const line of lines) {
      page.drawText(line, { x, y, size: 7.25, font: regular, color: NAVY, opacity: 0.94 });
      y -= 9.1;
    }
    y -= gap;
  };

  heading("1", "Identité et demande");
  paragraph(
    `Monsieur / Madame ${safe(`${input.firstName} ${input.lastName}`)}, né(e) le ${safe(input.birthDate)} et de nationalité ${safe(input.nationality)}, domicilié(e) à ${safe(input.address)}, a transmis à Virelia Crédit une demande de ${safe(input.programLabel)}. Le montant demandé est de ${safe(input.amountLabel)} pour une durée souhaitée de ${safe(input.durationMonths)} mois.`,
    7,
  );

  heading("2", "Objet et conditions déclarées");
  paragraph(
    `La demande est destinée à l’objet suivant : ${safe(input.purpose)}. La situation déclarée est « ${safe(input.employmentLabel)} ». Les revenus mensuels déclarés sont ${safe(input.incomeLabel)} et les charges mensuelles déclarées sont ${safe(input.monthlyChargesLabel)}. Ces informations seront vérifiées dans le cadre de l’étude du dossier.`,
    8,
  );

  heading("3", "Traitement et frais");
  paragraph(
    `Le délai de traitement demandé est ${safe(input.processingSpeedLabel)}. Les frais de traitement correspondants sont ${safe(input.processingFeeLabel)}. Ces frais proviennent de la grille configurée dans la plateforme et ne constituent ni une garantie d’acceptation ni une décision de crédit. Les conditions financières définitives ne sont établies qu’après l’étude du dossier lorsqu’elles sont disponibles.`,
    8,
  );

  heading("4", "Coordonnées de versement déclarées");
  paragraph(
    `Le demandeur a indiqué le compte au nom de ${safe(input.accountHolderName)}, auprès de ${safe(input.bankName)}, avec la référence de compte / IBAN ${safe(input.ibanAccountNumber)}${input.swiftBic ? ` et le code SWIFT / BIC ${input.swiftBic}` : ""}. Ces données sont conservées dans les espaces privés prévus pour le dossier et ne sont pas exposées dans le suivi public.`,
    7,
  );

  heading("5", "Validation documentaire");
  paragraph(
    "Le demandeur confirme avoir relu le présent projet et certifie l’exactitude des informations communiquées. Des documents complémentaires peuvent être demandés selon la nature de la demande et l’étude du dossier. Ce document reste un PROJET DE CONTRAT DE PRÊT soumis à validation du dossier. Il ne vaut ni acceptation automatique, ni promesse de décaissement, ni engagement définitif de Virelia Crédit.",
    8,
    4,
  );
}

function drawSignatures(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  director: PDFImage,
  vicePresident: PDFImage,
  approvedStamp: PDFImage,
  showApproved: boolean,
) {
  page.drawLine({ start: { x: 298, y: 139 }, end: { x: 298, y: 51 }, thickness: 0.45, color: GOLD });

  page.drawText("POUR VIRELIA CRÉDIT", { x: 84, y: 130, size: 8.1, font: bold, color: NAVY });
  page.drawText("Directeur Général", { x: 110, y: 117, size: 7.3, font: regular, color: GOLD });
  drawFitImage(page, director, 61, 55, 184, 66);
  page.drawLine({ start: { x: 69, y: 54 }, end: { x: 237, y: 54 }, thickness: 0.45, color: GOLD });

  page.drawText("VALIDATION INSTITUTIONNELLE", { x: 341, y: 130, size: 8.1, font: bold, color: NAVY });
  page.drawText("Vice-Président", { x: 399, y: 117, size: 7.3, font: regular, color: GOLD });
  drawFitImage(page, vicePresident, 326, 54, showApproved ? 125 : 190, 70);
  if (showApproved) drawFitImage(page, approvedStamp, 430, 51, 96, 82, 0.94);
  page.drawLine({ start: { x: 329, y: 54 }, end: { x: 526, y: 54 }, thickness: 0.45, color: GOLD });

  page.drawText(
    showApproved
      ? "Dossier approuvé — validation institutionnelle apposée selon le statut réel du dossier."
      : "Document de référence pré-contractuel — soumis à validation du dossier.",
    { x: showApproved ? 142 : 169, y: 31, size: 6.3, font: regular, color: NAVY, opacity: 0.68 },
  );
}

export async function generateLoanContractPdf(input: LoanContractInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const assets = await embedOfficialAssets(doc);
  const { width, height } = page.getSize();

  drawFrame(page, width, height);
  drawWatermark(page, assets.seal, width, height);
  drawHeader(page, bold, regular, assets.seal, input, width);

  if ((input.layout ?? "structured") === "narrative") drawNarrative(page, regular, bold, input);
  else drawStructured(page, regular, bold, input);

  drawSignatures(
    page,
    regular,
    bold,
    assets.director,
    assets.vicePresident,
    assets.approved,
    input.approved === true,
  );

  return doc.save();
}
