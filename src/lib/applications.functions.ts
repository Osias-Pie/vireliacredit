import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateLoanContractPdf } from "@/lib/contracts/generate-loan-contract";
import { getProcessingFee } from "@/config/loans";
import type { ProcessingSpeed } from "@/config/loans";
import { normalizeLocale } from "@/lib/i18n/locale-core";
import { dossierValues, localizeEmployment } from "@/lib/i18n/application-values";

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
  locale: z.enum(["fr", "en", "de", "es", "pt", "it", "hr"]).optional(),
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

function safeLog(stage: string, error?: unknown, extra: Record<string, unknown> = {}) {
  const technical = error instanceof Error
    ? { name: error.name, message: error.message.slice(0, 500) }
    : error && typeof error === "object"
      ? { code: String((error as { code?: unknown }).code ?? "unknown"), message: String((error as { message?: unknown }).message ?? "").slice(0, 500) }
      : { message: String(error ?? "").slice(0, 500) };
  console.error("[Virelia submission]", { stage, ...technical, ...extra });
}

function isOpaqueSupabaseKey(value: string) {
  return value.startsWith("sb_secret_") || value.startsWith("sb_publishable_");
}

function createServerFetch(apiKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isOpaqueSupabaseKey(apiKey) && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);
    return fetch(input, { ...init, headers });
  };
}

async function serverSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !service) {
    safeLog("server_config", new Error("missing server Supabase URL or secret key"));
    throw new Error("server_configuration_missing");
  }
  return createClient(url, service, {
    global: { fetch: createServerFetch(service) },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

function decodeBase64(data: string): Uint8Array {
  const clean = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  return Uint8Array.from(Buffer.from(clean, "base64"));
}

async function removeUploadedObjects(client: Awaited<ReturnType<typeof serverSupabase>>, applicationId: string) {
  try {
    const { data: docs } = await client.storage.from("application-documents").list(applicationId);
    if (docs?.length) {
      await client.storage.from("application-documents").remove(docs.map((file) => `${applicationId}/${file.name}`));
    }
    await client.storage.from("contracts").remove([`${applicationId}/contract-draft.pdf`]);
  } catch (error) {
    safeLog("cleanup", error, { applicationId });
  }
}

async function resolveCreatedApplication(
  client: Awaited<ReturnType<typeof serverSupabase>>,
  created: unknown,
): Promise<{ id: string; reference: string }> {
  if (created && typeof created === "object") {
    const obj = created as { id?: unknown; reference?: unknown };
    if (typeof obj.id === "string" && typeof obj.reference === "string") {
      return { id: obj.id, reference: obj.reference };
    }
  }

  if (typeof created === "string" && created.startsWith("VIR-")) {
    const { data, error } = await client
      .from("applications")
      .select("id, reference")
      .eq("reference", created)
      .maybeSingle();
    if (error) {
      safeLog("resolve_legacy_rpc", error, { referencePrefix: created.slice(0, 9) });
      throw new Error("submission_schema_outdated");
    }
    if (data?.id && data.reference) return { id: data.id, reference: data.reference };
  }

  safeLog("rpc_response", new Error("submit_application returned an unsupported response shape"));
  throw new Error("submission_rpc_invalid_response");
}

async function ensureBankDetails(
  client: Awaited<ReturnType<typeof serverSupabase>>,
  applicationId: string,
  data: z.infer<typeof schema>,
) {
  const { error } = await client.from("application_bank_details").upsert(
    {
      application_id: applicationId,
      bank_name: data.bank_name,
      account_holder_name: data.account_holder_name,
      iban_account_number: data.iban_account_number,
      swift_bic: data.swift_bic || null,
    },
    { onConflict: "application_id" },
  );
  if (error) {
    safeLog("bank_details", error, { applicationId });
    throw new Error("bank_details_storage_failed");
  }
}

async function ensureInitialHistory(
  client: Awaited<ReturnType<typeof serverSupabase>>,
  applicationId: string,
  locale: ReturnType<typeof normalizeLocale>,
) {
  const { data, error } = await client
    .from("application_status_history")
    .select("id")
    .eq("application_id", applicationId)
    .limit(1);
  if (error) {
    safeLog("history_read", error, { applicationId });
    throw new Error("status_history_unavailable");
  }
  if (data?.length) return;

  const activeLocale = locale ?? "fr";
  const { error: insertError } = await client.from("application_status_history").insert({
    application_id: applicationId,
    status: "nouvelle_demande",
    public_message: dossierValues(activeLocale).received,
  });
  if (insertError) {
    safeLog("history_insert", insertError, { applicationId });
    throw new Error("status_history_failed");
  }
}

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const client = await serverSupabase();
    const applicationLocale = normalizeLocale(data.locale ?? data.language) ?? "fr";
    const values = dossierValues(applicationLocale);
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
      language: applicationLocale,
      bank_name: data.bank_name,
      account_holder_name: data.account_holder_name,
      iban_account_number: data.iban_account_number,
      swift_bic: data.swift_bic ?? "",
    };

    const { data: created, error: rpcError } = await client.rpc("submit_application", { p: payload });
    if (rpcError) {
      safeLog("rpc_submit_application", rpcError, { program: data.program, currency: data.currency });
      throw new Error("application_creation_failed");
    }

    const { id: applicationId, reference } = await resolveCreatedApplication(client, created);
    const documentMeta: { key: string; filename: string; path: string }[] = [];

    try {
      await ensureBankDetails(client, applicationId, data);
      await ensureInitialHistory(client, applicationId, applicationLocale);

      for (const file of data.files) {
        const ext = file.filename.includes(".") ? file.filename.slice(file.filename.lastIndexOf(".")) : "";
        const path = `${applicationId}/${file.key}${ext}`;
        const bytes = decodeBase64(file.contentBase64);
        const { error: uploadError } = await client.storage
          .from("application-documents")
          .upload(path, bytes, { contentType: file.mime || "application/octet-stream", upsert: true });
        if (uploadError) {
          safeLog("document_upload", uploadError, { applicationId, documentKey: file.key });
          throw new Error("document_upload_failed");
        }
        documentMeta.push({ key: file.key, filename: file.filename, path });
      }

      const contractInput = {
        reference,
        locale: applicationLocale,
        firstName: data.first_name,
        lastName: data.last_name,
        birthDate: data.birth_date,
        nationality: data.nationality || "—",
        address: data.address,
        phone: data.phone,
        email: data.email,
        employmentLabel: localizeEmployment(data.employment_status, applicationLocale),
        incomeLabel: data.income != null ? `${data.income} ${data.currency}` : values.notProvided,
        monthlyChargesLabel:
          data.monthly_charges != null ? `${data.monthly_charges} ${data.currency}` : values.notProvided,
        programLabel: data.program_label || data.program,
        purpose: data.purpose,
        amountLabel: `${data.amount} ${data.currency}`,
        currency: data.currency,
        durationMonths: String(data.duration_months),
        processingSpeedLabel: data.speed_label || data.processing_speed,
        processingFeeLabel: fee != null ? `${fee} ${data.currency}` : values.notApplicable,
        bankName: data.bank_name,
        accountHolderName: data.account_holder_name,
        ibanAccountNumber: data.iban_account_number,
        swiftBic: data.swift_bic || "",
        confirmationDate: new Date().toISOString().slice(0, 10),
        approved: false,
      } as const;

      let structuredPdf: Uint8Array;
      let narrativePdf: Uint8Array;
      try {
        [structuredPdf, narrativePdf] = await Promise.all([
          generateLoanContractPdf({ ...contractInput, layout: "structured" }),
          generateLoanContractPdf({ ...contractInput, layout: "narrative" }),
        ]);
      } catch (error) {
        safeLog("contract_generation", error, { applicationId });
        throw new Error("contract_generation_failed");
      }

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
      if (structuredError || narrativeError) {
        safeLog("contract_upload", structuredError || narrativeError, { applicationId });
        throw new Error("contract_upload_failed");
      }

      documentMeta.push({
        key: "contract_narrative",
        filename: "Virelia — narrative contract.pdf",
        path: narrativePath,
      });

      const { error: updateError } = await client
        .from("applications")
        .update({
          documents: documentMeta,
          contract_path: structuredPath,
          locale: applicationLocale,
          language: applicationLocale,
        })
        .eq("id", applicationId);
      if (updateError) {
        safeLog("application_finalize", updateError, { applicationId });
        throw new Error("application_finalize_failed");
      }
    } catch (error) {
      await removeUploadedObjects(client, applicationId);
      const { error: deleteError } = await client.from("applications").delete().eq("id", applicationId);
      if (deleteError) safeLog("rollback_application", deleteError, { applicationId });
      throw error;
    }

    console.info("[Virelia submission] completed", {
      applicationId,
      referencePrefix: reference.slice(0, 9),
      locale: applicationLocale,
      documents: data.files.length,
      contracts: 2,
    });
    return { reference, status: "nouvelle_demande" as const, locale: applicationLocale };
  });

const contractDownloadSchema = z.object({
  reference: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(200),
});

export const getApplicationContractDownloads = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contractDownloadSchema.parse(data))
  .handler(async ({ data }) => {
    const client = await serverSupabase();
    const { data: app, error } = await client
      .from("applications")
      .select("id, reference, email, contract_path, documents")
      .ilike("reference", data.reference)
      .ilike("email", data.email)
      .maybeSingle();

    if (error) {
      safeLog("contract_download_lookup", error);
      throw new Error("contract_lookup_failed");
    }
    if (!app) return null;

    const docs = Array.isArray(app.documents) ? app.documents : [];
    const narrativePath = docs.find(
      (item) => item && typeof item === "object" && (item as { key?: unknown }).key === "contract_narrative",
    );
    const narrative =
      narrativePath && typeof narrativePath === "object"
        ? String((narrativePath as { path?: unknown }).path || "")
        : "";
    const structured = app.contract_path || `${app.id}/contract-draft.pdf`;

    const [structuredResult, narrativeResult] = await Promise.all([
      client.storage.from("contracts").createSignedUrl(structured, 60 * 10),
      narrative
        ? client.storage.from("application-documents").createSignedUrl(narrative, 60 * 10)
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (structuredResult.error) safeLog("contract_download_structured_sign", structuredResult.error);
    if (narrativeResult.error) safeLog("contract_download_narrative_sign", narrativeResult.error);

    return {
      structuredUrl: structuredResult.data?.signedUrl ?? null,
      narrativeUrl: narrativeResult.data?.signedUrl ?? null,
      expiresInSeconds: 600,
    };
  });
