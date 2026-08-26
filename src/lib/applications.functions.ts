import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateLoanContractPdf } from "@/lib/contracts/generate-loan-contract";
import { getProcessingFee } from "@/config/loans";
import type { ProcessingSpeed } from "@/config/loans";

const num = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v === "" || v == null) return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
  });

const fileSchema = z.object({
  key: z.string().max(80),
  filename: z.string().max(200),
  mime: z.string().max(120),
  contentBase64: z.string().min(8).max(16_000_000),
});

const schema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  birth_date: z.string().min(4).max(20),
  country: z.string().trim().min(1).max(100),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(200),
  employment_status: z.enum(["employee", "self_employed", "business_owner", "retired", "other"]),
  employment_details: z.record(z.string(), z.string().max(300)).default({}),
  income: num,
  other_income: num,
  monthly_charges: num,
  program: z.string().trim().min(1).max(100),
  amount: z.number().positive().max(1_000_000_000),
  currency: z.string().trim().min(2).max(10),
  duration_months: z.number().int().positive().max(600),
  purpose: z.string().trim().min(10).max(4000),
  processing_speed: z.string().trim().max(50),
  processing_fee: num,
  language: z.string().trim().max(5).optional(),
  program_label: z.string().trim().max(120).optional(),
  speed_label: z.string().trim().max(120).optional(),
  bank_name: z.string().trim().min(2).max(120),
  account_holder_name: z.string().trim().min(2).max(160),
  iban_account_number: z.string().trim().min(6).max(64),
  swift_bic: z.string().trim().max(20).optional().or(z.literal("")),
  contract_layout: z.enum(["structured", "narrative"]).default("structured"),
  files: z.array(fileSchema).max(8).default([]),
  contract_confirmed: z.literal(true),
});

export type ApplicationInput = z.input<typeof schema>;

const EMPLOYMENT_LABELS: Record<string, string> = {
  employee: "Salarié",
  self_employed: "Indépendant",
  business_owner: "Chef d’entreprise",
  retired: "Retraité",
  other: "Autre situation",
};

async function serverSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const service = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !service) throw new Error("supabase_server_config_missing");
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

function decodeBase64(data: string): Uint8Array {
  const clean = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  return Uint8Array.from(Buffer.from(clean, "base64"));
}

async function removeUploadedObjects(client: Awaited<ReturnType<typeof serverSupabase>>, applicationId: string) {
  const { data: docs } = await client.storage.from("application-documents").list(applicationId);
  if (docs?.length) {
    await client.storage.from("application-documents").remove(docs.map((file) => `${applicationId}/${file.name}`));
  }
  await client.storage.from("contracts").remove([`${applicationId}/contract-draft.pdf`]);
}

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const client = await serverSupabase();
    const fee = data.processing_fee ?? getProcessingFee(data.program, data.processing_speed as ProcessingSpeed)?.amount ?? null;

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.birth_date,
      country: data.country,
      country_of_residence: data.country,
      nationality: data.nationality ?? "",
      address: data.address,
      phone: data.phone,
      email: data.email,
      employment_status: data.employment_status,
      employment_details: data.employment_details ?? {},
      income: data.income ?? "",
      other_income: data.other_income ?? "",
      monthly_charges: data.monthly_charges ?? "",
      program: data.program,
      amount: data.amount,
      currency: data.currency,
      duration_months: data.duration_months,
      purpose: data.purpose,
      processing_speed: data.processing_speed,
      processing_fee: fee ?? "",
      documents: [],
      language: data.language ?? "",
      bank_name: data.bank_name,
      account_holder_name: data.account_holder_name,
      iban_account_number: data.iban_account_number,
      swift_bic: data.swift_bic ?? "",
    };

    const { data: created, error } = await client.rpc("submit_application", { p: payload });
    if (error) {
      console.error("[submitApplication] application creation failed");
      throw new Error("insert_failed");
    }

    const result = created as { id?: string; reference?: string } | string | null;
    const reference = typeof result === "string" ? result : result?.reference;
    const applicationId = typeof result === "object" && result ? result.id : null;
    if (!reference || !applicationId) throw new Error("insert_failed");

    const documentMeta: { key: string; filename: string; path: string }[] = [];

    try {
      for (const file of data.files) {
        const ext = file.filename.includes(".") ? file.filename.slice(file.filename.lastIndexOf(".")) : "";
        const path = `${applicationId}/${file.key}${ext}`;
        const bytes = decodeBase64(file.contentBase64);
        const { error: uploadError } = await client.storage
          .from("application-documents")
          .upload(path, bytes, { contentType: file.mime || "application/octet-stream", upsert: true });
        if (uploadError) throw new Error("document_upload_failed");
        documentMeta.push({ key: file.key, filename: file.filename, path });
      }

      const contractInput = {
        reference,
        firstName: data.first_name,
        lastName: data.last_name,
        birthDate: data.birth_date,
        nationality: data.nationality || "—",
        address: data.address,
        phone: data.phone,
        email: data.email,
        employmentLabel: EMPLOYMENT_LABELS[data.employment_status] ?? data.employment_status,
        incomeLabel: data.income != null ? `${data.income} ${data.currency}` : "Non renseigné",
        monthlyChargesLabel: data.monthly_charges != null ? `${data.monthly_charges} ${data.currency}` : "Non renseigné",
        programLabel: data.program_label || data.program,
        purpose: data.purpose,
        amountLabel: `${data.amount} ${data.currency}`,
        currency: data.currency,
        durationMonths: String(data.duration_months),
        processingSpeedLabel: data.speed_label || data.processing_speed,
        processingFeeLabel: fee != null ? `${fee} ${data.currency}` : "Non applicable",
        bankName: data.bank_name,
        accountHolderName: data.account_holder_name,
        ibanAccountNumber: data.iban_account_number,
        swiftBic: data.swift_bic || "",
        confirmationDate: new Date().toISOString().slice(0, 10),
      } as const;

      const [structuredPdf, narrativePdf] = await Promise.all([
        generateLoanContractPdf({ ...contractInput, layout: "structured" }),
        generateLoanContractPdf({ ...contractInput, layout: "narrative" }),
      ]);

      const structuredPath = `${applicationId}/contract-draft.pdf`;
      const narrativePath = `${applicationId}/contract-narrative.pdf`;

      const [{ error: structuredError }, { error: narrativeError }] = await Promise.all([
        client.storage.from("contracts").upload(structuredPath, structuredPdf, {
          contentType: "application/pdf",
          upsert: true,
        }),
        client.storage.from("application-documents").upload(narrativePath, narrativePdf, {
          contentType: "application/pdf",
          upsert: true,
        }),
      ]);
      if (structuredError || narrativeError) throw new Error("contract_upload_failed");

      documentMeta.push({
        key: "contract_narrative",
        filename: "Projet de contrat — version narrative.pdf",
        path: narrativePath,
      });

      const { error: updateError } = await client
        .from("applications")
        .update({ documents: documentMeta, contract_path: structuredPath })
        .eq("id", applicationId);
      if (updateError) throw new Error("application_finalize_failed");
    } catch (error) {
      await removeUploadedObjects(client, applicationId);
      await client.from("applications").delete().eq("id", applicationId);
      console.error("[submitApplication] secure file finalization failed");
      throw error;
    }

    return { reference, status: "nouvelle_demande" as const };
  });
