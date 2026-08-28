import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { CONTRACT_ASSETS } from "./official-assets";
import { getContractCopy, type ContractCopy, type ContractNarrativeValues } from "./contract-translations";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n/locale-core";

export type ContractLayout = "structured" | "narrative";

export interface LoanContractInput {
  reference?: string;
  locale?: SupportedLocale | string;
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

const NAVY = rgb(11 / 255, 42 / 255, 91 / 255);
const GOLD = rgb(212 / 255, 175 / 255, 55 / 255);
const WHITE = rgb(1, 1, 1);

function resolveContractLocale(input: LoanContractInput): SupportedLocale {
  const explicit = normalizeLocale(input.locale);
  if (explicit) return explicit;
  if (typeof document !== "undefined") {
    const documentLocale = normalizeLocale(document.documentElement.lang);
    if (documentLocale) return documentLocale;
  }
  return "fr";
}

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

function humanDate(value: string, localeTag: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(localeTag);
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
  copy: ContractCopy,
  width: number,
) {
  drawFitImage(page, seal, 31, 739, 82, 82);
  centerText(page, bold, copy.brand, 790, 18.5, width, NAVY);
  page.drawLine({ start: { x: 181, y: 781 }, end: { x: 414, y: 781 }, thickness: 0.7, color: GOLD });
  centerText(page, bold, copy.title, 758, 15.2, width, NAVY);
  centerText(page, regular, copy.subtitle, 739, 9.2, width, GOLD);
  page.drawLine({ start: { x: 137, y: 728 }, end: { x: 552, y: 728 }, thickness: 0.7, color: GOLD });

  page.drawText(`${copy.reference} : ${input.reference || copy.assignedAfterRegistration}`, {
    x: 141,
    y: 712,
    size: 7.4,
    font: bold,
    color: NAVY,
  });
  page.drawText(`${copy.date} : ${humanDate(input.confirmationDate, copy.localeTag)}`, {
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

function narrativeValues(input: LoanContractInput, copy: ContractCopy): ContractNarrativeValues {
  return {
    name: safe(`${input.firstName} ${input.lastName}`),
    birthDate: safe(input.birthDate),
    nationality: safe(input.nationality),
    address: safe(input.address),
    program: safe(input.programLabel),
    amount: safe(input.amountLabel),
    duration: safe(input.durationMonths),
    purpose: safe(input.purpose),
    situation: safe(input.employmentLabel || copy.declaredSituation),
    income: safe(input.incomeLabel || copy.notProvided),
    charges: safe(input.monthlyChargesLabel || copy.notProvided),
    speed: safe(input.processingSpeedLabel),
    fee: safe(input.processingFeeLabel),
    holder: safe(input.accountHolderName),
    bank: safe(input.bankName),
    account: safe(input.ibanAccountNumber),
    swift: input.swiftBic || undefined,
  };
}

function drawStructured(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  input: LoanContractInput,
  copy: ContractCopy,
) {
  const leftX = 42;
  const colW = 249;
  const rightX = 303;
  const v = narrativeValues(input, copy);

  cappedLines(regular, copy.intro(v), 7.15, 500, 4).forEach((line, i) => {
    page.drawText(line, { x: 48, y: 687 - i * 8.9, size: 7.15, font: regular, color: NAVY, opacity: 0.94 });
  });

  sectionTitle(page, bold, copy.sections[0], leftX, 646);
  sectionTitle(page, bold, copy.sections[1], rightX, 646);

  const firstBottom = Math.min(
    drawTable(page, regular, bold, leftX, 634, colW, [
      [copy.labels.fullName, `${input.firstName} ${input.lastName}`],
      [copy.labels.birth, input.birthDate],
      [copy.labels.nationality, input.nationality],
      [copy.labels.address, input.address, 3],
      [copy.labels.phone, input.phone],
      [copy.labels.email, input.email, 2],
    ], 84),
    drawTable(page, regular, bold, rightX, 634, colW, [
      [copy.labels.loanType, input.programLabel],
      [copy.labels.requestedAmount, input.amountLabel],
      [copy.labels.desiredDuration, `${input.durationMonths} ${copy.months}`],
      [copy.labels.purpose, input.purpose, 3],
      [copy.labels.requestedTime, input.processingSpeedLabel],
      [copy.labels.processingFee, input.processingFeeLabel, 2],
    ], 88),
  );

  const secondTitleY = firstBottom - 17;
  sectionTitle(page, bold, copy.sections[2], leftX, secondTitleY);
  sectionTitle(page, bold, copy.sections[3], rightX, secondTitleY);

  const secondBottom = Math.min(
    drawTable(page, regular, bold, leftX, secondTitleY - 12, colW, [
      [copy.labels.situation, input.employmentLabel || copy.declaredSituation],
      [copy.labels.income, input.incomeLabel || copy.notProvided],
      [copy.labels.charges, input.monthlyChargesLabel || copy.notProvided],
      [copy.labels.commitment, copy.commitment, 2],
    ], 88),
    drawTable(page, regular, bold, rightX, secondTitleY - 12, colW, [
      [copy.labels.bank, input.bankName, 2],
      [copy.labels.holder, input.accountHolderName, 2],
      [copy.labels.account, input.ibanAccountNumber, 2],
      [copy.labels.swift, input.swiftBic || copy.notProvided],
    ], 88),
  );

  const conditionY = secondBottom - 17;
  sectionTitle(page, bold, copy.sections[4], leftX, conditionY);
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
    [copy.labels.amount, input.amountLabel],
    [copy.labels.duration, `${input.durationMonths} ${copy.months}`],
    [copy.labels.processing, input.processingSpeedLabel],
    [copy.labels.fees, input.processingFeeLabel],
    [copy.labels.decision, copy.afterReview],
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
  sectionTitle(page, bold, copy.sections[5], leftX, validationY);
  cappedLines(regular, copy.validationNote, 6.65, 500, 4).forEach((line, i) => {
    page.drawText(line, { x: leftX, y: validationY - 15 - i * 8, size: 6.65, font: regular, color: NAVY, opacity: 0.9 });
  });
}

function drawNarrative(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  input: LoanContractInput,
  copy: ContractCopy,
) {
  let y = 685;
  const x = 50;
  const maxWidth = 495;
  const v = narrativeValues(input, copy);

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

  heading("1", copy.narrativeSections[0]);
  paragraph(copy.narrativeIdentity(v), 7);

  heading("2", copy.narrativeSections[1]);
  paragraph(copy.narrativePurpose(v), 8);

  heading("3", copy.narrativeSections[2]);
  paragraph(copy.narrativeFees(v), 8);

  heading("4", copy.narrativeSections[3]);
  paragraph(copy.narrativeBank(v), 7);

  heading("5", copy.narrativeSections[4]);
  paragraph(copy.narrativeValidation, 8, 4);
}

function drawSignatures(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  director: PDFImage,
  vicePresident: PDFImage,
  approvedStamp: PDFImage,
  showApproved: boolean,
  copy: ContractCopy,
) {
  page.drawLine({ start: { x: 298, y: 139 }, end: { x: 298, y: 51 }, thickness: 0.45, color: GOLD });

  page.drawText(copy.forVirelia, { x: 84, y: 130, size: 8.1, font: bold, color: NAVY });
  page.drawText(copy.directorGeneral, { x: 110, y: 117, size: 7.3, font: regular, color: GOLD });
  drawFitImage(page, director, 61, 55, 184, 66);
  page.drawLine({ start: { x: 69, y: 54 }, end: { x: 237, y: 54 }, thickness: 0.45, color: GOLD });

  page.drawText(copy.institutionalValidation, { x: 341, y: 130, size: 8.1, font: bold, color: NAVY });
  page.drawText(copy.vicePresident, { x: 399, y: 117, size: 7.3, font: regular, color: GOLD });
  drawFitImage(page, vicePresident, 326, 54, showApproved ? 125 : 190, 70);
  if (showApproved) drawFitImage(page, approvedStamp, 430, 51, 96, 82, 0.94);
  page.drawLine({ start: { x: 329, y: 54 }, end: { x: 526, y: 54 }, thickness: 0.45, color: GOLD });

  const footer = showApproved ? copy.approvedNote : copy.draftNote;
  const footerLines = cappedLines(regular, footer, 6.3, 400, 2);
  footerLines.forEach((line, index) => {
    const textWidth = regular.widthOfTextAtSize(line, 6.3);
    page.drawText(line, {
      x: (595.28 - textWidth) / 2,
      y: 31 - index * 7,
      size: 6.3,
      font: regular,
      color: NAVY,
      opacity: 0.68,
    });
  });
}

export async function generateLoanContractPdf(input: LoanContractInput): Promise<Uint8Array> {
  const locale = resolveContractLocale(input);
  const copy = getContractCopy(locale);
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const assets = await embedOfficialAssets(doc);
  const { width, height } = page.getSize();

  drawFrame(page, width, height);
  drawWatermark(page, assets.seal, width, height);
  drawHeader(page, bold, regular, assets.seal, input, copy, width);

  if ((input.layout ?? "structured") === "narrative") drawNarrative(page, regular, bold, input, copy);
  else drawStructured(page, regular, bold, input, copy);

  drawSignatures(
    page,
    regular,
    bold,
    assets.director,
    assets.vicePresident,
    assets.approved,
    input.approved === true,
    copy,
  );

  return doc.save();
}
