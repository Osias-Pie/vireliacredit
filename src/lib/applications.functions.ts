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
      ? {
          code: String((error as { code?: unknown }).code ?? "unknown"),
          message: String((error as { message?: unknown }).message ?? "").slice(0, 500),
        }
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
    safeLog("SUPABASE_SERVER_CONFIG", new Error("missing server Supabase URL or secret key"), {
      missingUrl: !url,
      missingSecret: !service,
    });
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

async function findApplicationByReference(
  client: Awaited<ReturnType<typeof serverSupabase>>,
  reference: string,
): Promise<{ id: string; reference: string } | null> {
  const { data, error } = await client
    .from("applications")
    .select("id, reference")
    .eq("reference", reference)
    .maybeSingle();
  if (error) {
    safeLog("SUBMIT_RPC", error, { step: "resolve_reference", referencePrefix: reference.slice(0, 9) });
    throw new Error("submission_schema_outdated");
  }
  return data?.id && data.reference ? { id: data.id, reference: data.reference } : null;
}

async function resolveCreatedApplication(
  client: Awaited<ReturnType<typeof serverSupabase>>,
  created: unknown,
): Promise<{ id: string; reference: string }> {
  let value = created;

  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      value = JSON.parse(value);
    } catch {
      // Keep the original value and continue through the legacy checks below.
    }
  }

  if (Array.isArray(value) && value.length === 1) value = value[0];

  if (value && typeof value === "object") {
    const obj = value as { id?: unknown; reference?: unknown };
    if (typeof obj.id === "string" && typeof obj.reference === "string") {
      return { id: obj.id, reference: obj.reference };
    }
    if (typeof obj.reference === "string" && obj.reference.startsWith("VIR-")) {
      const resolved = await findApplicationByReference(client, obj.reference);
      if (resolved) return resolved;
    }
  }

  if (typeof value === "string" && value.startsWith("VIR-")) {
    const resolved = await findApplicationByReference(client, value);
    if (resolved) return resolved;
  }

  safeLog("SUBMIT_RPC", new Error("submit_application returned an unsupported response shape"), {
    step: "resolve_response",
    responseType: Array.isArray(created) ? "array" : typeof created,
  });
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
  if (error) throw error;
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
  if (error) throw error;
  if (data?.length) return;

  const activeLocale = locale ?? "fr";
  const { error: insertError } = await client.from("application_status_history").insert({
    application_id: applicationId,
    status: "nouvelle_demande",
    public_message: dossierValues(activeLocale).received,
  });
  if (insertError) throw insertError;
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
      safeLog("SUBMIT_RPC", rpcError, { step: "create_application", program: data.program, currency: data.currency });
      throw new Error("application_creation_failed");
    }

    const { id: applicationId, reference } = await resolveCreatedApplication(client, created);
    const documentMeta: { key: string; filename: string; path: string }[] = [];
    const postProcessingWarnings: string[] = [];

    const warn = (step: string, error: unknown, extra: Record<string, unknown> = {}) => {
      postProcessingWarnings.push(step);
      safeLog("SUBMIT_POST_PROCESSING", error, { applicationId, step, ...extra });
    };

    // From this point onward the application already exists. Secondary failures must never
    // delete it or throw a generic error that encourages the user to submit a duplicate.
    try {
      await ensureBankDetails(client, applicationId, data);
    } catch (error) {
      warn("BANK_DETAILS", error);
    }

    try {
      await ensureInitialHistory(client, applicationId, applicationLocale);
    } catch (error) {
      warn("STATUS_HISTORY", error);
    }

    for (const file of data.files) {
      try {
        const ext = file.filename.includes(".") ? file.filename.slice(file.filename.lastIndexOf(".")) : "";
        const path = `${applicationId}/${file.key}${ext}`;
        const bytes = decodeBase64(file.contentBase64);
        const { error: uploadError } = await client.storage
          .from("application-documents")
          .upload(path, bytes, { contentType: file.mime || "application/octet-stream", upsert: true });
        if (uploadError) throw uploadError;
        documentMeta.push({ key: file.key, filename: file.filename, path });
      } catch (error) {
        warn("DOCUMENT_UPLOAD", error, { documentKey: file.key });
      }
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

    const structuredPath = `${applicationId}/contract-draft.pdf`;
    const narrativePath = `${applicationId}/contract-narrative.pdf`;
    let structuredUploaded = false;

    try {
      const [structuredPdf, narrativePdf] = await Promise.all([
        generateLoanContractPdf({ ...contractInput, layout: "structured" }),
        generateLoanContractPdf({ ...contractInput, layout: "narrative" }),
      ]);

      const [structuredResult, narrativeResult] = await Promise.all([
        client.storage.from("contracts").upload(structuredPath, structuredPdf, {
          contentType: "application/pdf",
          upsert: true,
        }),
        client.storage.from("application-documents").upload(narrativePath, narrativePdf, {
          contentType: "application/pdf",
          upsert: true,
        }),
      ]);

      if (structuredResult.error) {
        warn("CONTRACT_STRUCTURED_UPLOAD", structuredResult.error);
      } else {
        structuredUploaded = true;
      }

      if (narrativeResult.error) {
        warn("CONTRACT_NARRATIVE_UPLOAD", narrativeResult.error);
      } else {
        documentMeta.push({
          key: "contract_narrative",
          filename: "Virelia — narrative contract.pdf",
          path: narrativePath,
        });
      }
    } catch (error) {
      warn("CONTRACT_GENERATION", error);
    }

    try {
      const patch: Record<string, unknown> = {
        documents: documentMeta,
        locale: applicationLocale,
        language: applicationLocale,
      };
      if (structuredUploaded) patch.contract_path = structuredPath;

      const { error: updateError } = await client
        .from("applications")
        .update(patch)
        .eq("id", applicationId);
      if (updateError) throw updateError;
    } catch (error) {
      warn("APPLICATION_FINALIZE", error);
    }

    const complete = postProcessingWarnings.length === 0;
    console.info("[Virelia submission] completed", {
      applicationId,
      referencePrefix: reference.slice(0, 9),
      locale: applicationLocale,
      documentsUploaded: documentMeta.filter((item) => item.key !== "contract_narrative").length,
      structuredContract: structuredUploaded,
      complete,
      warningCount: postProcessingWarnings.length,
    });

    return {
      reference,
      status: "nouvelle_demande" as const,
      locale: applicationLocale,
      complete,
      needsTechnicalFinalization: !complete,
    };
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
      safeLog("CONTRACT_PREVIEW", error, { step: "lookup" });
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

    if (structuredResult.error) safeLog("CONTRACT_PREVIEW", structuredResult.error, { step: "structured_sign" });
    if (narrativeResult.error) safeLog("CONTRACT_PREVIEW", narrativeResult.error, { step: "narrative_sign" });

    return {
      structuredUrl: structuredResult.data?.signedUrl ?? null,
      narrativeUrl: narrativeResult.data?.signedUrl ?? null,
      expiresInSeconds: 600,
    };
  });
