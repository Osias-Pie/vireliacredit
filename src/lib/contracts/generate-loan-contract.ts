import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface LoanContractInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
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
}

const NAVY = rgb(0.043, 0.145, 0.271);
const GOLD = rgb(0.72, 0.58, 0.28);
const INK = rgb(0.12, 0.14, 0.18);
const MUTED = rgb(0.35, 0.38, 0.42);

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function generateLoanContractPdf(input: LoanContractInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 42;
  let y = height - 36;

  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: NAVY });
  page.drawRectangle({ x: 0, y: height - 12, width, height: 4, color: GOLD });

  const title = (text: string, size: number, font = bold, color = NAVY) => {
    page.drawText(text, { x: margin, y, size, font, color });
    y -= size + 6;
  };

  title("VIRELIA CRÉDIT", 16);
  title("PROJET DE CONTRAT DE PRÊT", 13);
  page.drawText("Soumis à validation du dossier", {
    x: margin,
    y,
    size: 9,
    font: bold,
    color: GOLD,
  });
  y -= 16;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.6,
    color: GOLD,
  });
  y -= 14;

  const section = (label: string) => {
    y -= 4;
    page.drawText(label.toUpperCase(), { x: margin, y, size: 8, font: bold, color: NAVY });
    y -= 12;
  };

  const row = (label: string, value: string) => {
    const labelW = 128;
    page.drawText(label, { x: margin, y, size: 8, font: regular, color: MUTED });
    const lines = wrap(regular, value || "—", 8, width - margin - margin - labelW);
    lines.forEach((line, i) => {
      page.drawText(line, { x: margin + labelW, y: y - i * 10, size: 8, font: bold, color: INK });
    });
    y -= Math.max(12, lines.length * 10 + 2);
  };

  const paragraph = (text: string, pg: PDFPage) => {
    const lines = wrap(regular, text, 8, width - margin * 2);
    lines.forEach((line) => {
      pg.drawText(line, { x: margin, y, size: 8, font: regular, color: INK });
      y -= 11;
    });
  };

  section("Demandeur");
  row("Nom", input.lastName);
  row("Prénom", input.firstName);
  row("Date de naissance", input.birthDate);
  row("Nationalité", input.nationality);
  row("Adresse", input.address);
  row("Téléphone", input.phone);
  row("Email", input.email);

  section("Prêt demandé");
  row("Type de prêt", input.programLabel);
  row("Objet", input.purpose);
  row("Montant", input.amountLabel);
  row("Devise", input.currency);
  row("Durée", `${input.durationMonths} mois`);
  row("Délai demandé", input.processingSpeedLabel);
  row("Frais de traitement", input.processingFeeLabel);

  section("Coordonnées bancaires déclarées");
  row("Banque", input.bankName);
  row("Titulaire", input.accountHolderName);
  row("IBAN / compte", input.ibanAccountNumber);
  row("SWIFT / BIC", input.swiftBic || "Non applicable");

  section("Conditions essentielles");
  paragraph(
    "Il s'agit d'un prêt remboursable. L'octroi reste soumis à l'étude du dossier et des justificatifs transmis. Les informations fournies doivent être exactes. Les conditions définitives seront confirmées après validation. L'envoi de cette demande ne constitue pas une acceptation automatique du financement.",
    page,
  );

  y -= 6;
  section("Confirmation");
  row("Date", input.confirmationDate);
  paragraph("Projet consulté et informations confirmées par le demandeur.", page);

  y -= 8;
  page.drawText("Document généré automatiquement — aucune signature électronique n'est apposée.", {
    x: margin,
    y: Math.max(28, y),
    size: 7,
    font: regular,
    color: MUTED,
  });
  page.drawRectangle({ x: 0, y: 0, width, height: 6, color: NAVY });

  return doc.save();
}
