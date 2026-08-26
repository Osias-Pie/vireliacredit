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
  employment_status: z.enum([
    "employee",
    "self_employed",
    "business_owner",
    "retired",
    "other",
  ]),
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
  files: z.array(fileSchema).max(8).default([]),
  contract_confirmed: z.literal(true),
});

export type ApplicationInput = z.input<typeof schema>;

async function serverSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const service = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const pub = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url) throw new Error("supabase_config_missing");
  const key = service || pub;
  if (!key) throw new Error("supabase_config_missing");
  return {
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    }),
    canStorage: Boolean(service),
  };
}

function decodeBase64(data: string): Uint8Array {
  const clean = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  return Uint8Array.from(Buffer.from(clean, "base64"));
}

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { client, canStorage } = await serverSupabase();

    const fee =
      data.processing_fee ??
      getProcessingFee(data.program, data.processing_speed as ProcessingSpeed)?.amount ??
      null;

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

    const { data: created, error } = await client.rpc("submit_application", {
      p: payload,
    });

    if (error) {
      console.error("[submitApplication] rpc error", error.message);
      throw new Error("insert_failed");
    }

    const result = created as { id?: string; reference?: string } | string | null;
    const reference =
      typeof result === "string" ? result : result?.reference;
    const applicationId = typeof result === "object" && result ? result.id : null;

    if (!reference) throw new Error("insert_failed");

    const documentMeta: { key: string; filename: string; path: string }[] = [];

    if (canStorage && applicationId) {
      for (const file of data.files) {
        const ext = file.filename.includes(".")
          ? file.filename.slice(file.filename.lastIndexOf("."))
          : "";
        const path = `${applicationId}/${file.key}${ext}`;
        const bytes = decodeBase64(file.contentBase64);
        const { error: upErr } = await client.storage
          .from("application-documents")
          .upload(path, bytes, {
            contentType: file.mime || "application/octet-stream",
            upsert: true,
          });
        if (upErr) {
          console.error("[submitApplication] document upload failed");
          continue;
        }
        documentMeta.push({ key: file.key, filename: file.filename, path });
      }

      const pdf = await generateLoanContractPdf({
        firstName: data.first_name,
        lastName: data.last_name,
        birthDate: data.birth_date,
        nationality: data.nationality || "—",
        address: data.address,
        phone: data.phone,
        email: data.email,
        programLabel: data.program_label || data.program,
        purpose: data.purpose,
        amountLabel: `${data.amount} ${data.currency}`,
        currency: data.currency,
        durationMonths: String(data.duration_months),
        processingSpeedLabel: data.speed_label || data.processing_speed,
        processingFeeLabel: fee != null ? `${fee} ${data.currency}` : "—",
        bankName: data.bank_name,
        accountHolderName: data.account_holder_name,
        ibanAccountNumber: data.iban_account_number,
        swiftBic: data.swift_bic || "",
        confirmationDate: new Date().toISOString().slice(0, 10),
      });

      const contractPath = `${applicationId}/contract-draft.pdf`;
      const { error: cErr } = await client.storage.from("contracts").upload(contractPath, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (cErr) console.error("[submitApplication] contract upload failed");

      await client
        .from("applications")
        .update({
          documents: documentMeta,
          contract_path: cErr ? null : contractPath,
        })
        .eq("id", applicationId);
    }

    return { reference, status: "nouvelle_demande" as const };
  });
