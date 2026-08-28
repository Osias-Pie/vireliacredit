import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";
import { generateLoanContractPdf } from "@/lib/contracts/generate-loan-contract";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n/locale-core";
import {
  dossierValues,
  localizeEmployment,
  localizeProgram,
  localizeSpeed,
} from "@/lib/i18n/application-values";

export { APPLICATION_STATUSES, type ApplicationStatus };

const APPROVED_STATUSES = new Set<ApplicationStatus>([
  "approuvee",
  "acceptee",
  "virement_en_preparation",
  "terminee",
]);

function adminLog(stage: string, error?: unknown, extra: Record<string, unknown> = {}) {
  const technical = error instanceof Error
    ? { name: error.name, message: error.message.slice(0, 400) }
    : error && typeof error === "object"
      ? { code: String((error as { code?: unknown }).code ?? "unknown"), message: String((error as { message?: unknown }).message ?? "").slice(0, 400) }
      : { message: String(error ?? "").slice(0, 400) };
  console.error("[Virelia admin]", { stage, ...technical, ...extra });
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) {
    adminLog("ADMIN_ROLE", error, { reason: "role_check_failed" });
    throw new Error("role_check_failed");
  }
  if (!data) {
    adminLog("ADMIN_ROLE", new Error("forbidden"), { reason: "role_missing" });
    throw new Error("forbidden");
  }
}

function isOpaqueSupabaseKey(value: string) {
  return value.startsWith("sb_secret_") || value.startsWith("sb_publishable_");
}

function secretFetch(apiKey: string): typeof fetch {
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

async function serverAdminClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    adminLog("SUPABASE_SERVER_CONFIG", new Error("server_configuration_missing"), {
      missingUrl: !url,
      missingSecret: !secret,
    });
    throw new Error("server_configuration_missing");
  }
  return createClient(url, secret, {
    global: { fetch: secretFetch(secret) },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

const LOCALE_TAGS: Record<SupportedLocale, string> = {
  fr: "fr-FR", en: "en-GB", de: "de-DE", es: "es-ES", pt: "pt-PT", it: "it-IT", hr: "hr-HR",
};

function money(value: unknown, currency: string, locale: SupportedLocale) {
  const n = Number(value);
  if (!Number.isFinite(n)) return dossierValues(locale).notProvided;
  try {
    return new Intl.NumberFormat(LOCALE_TAGS[locale], { style: "currency", currency }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

async function regenerateContractsForStatus(applicationId: string, status: ApplicationStatus) {
  const client = await serverAdminClient();
  const { data: app, error: appError } = await client
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (appError || !app) throw new Error("contract_application_unavailable");

  const { data: bank, error: bankError } = await client
    .from("application_bank_details")
    .select("bank_name, account_holder_name, iban_account_number, swift_bic")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (bankError || !bank) throw new Error("contract_bank_details_unavailable");

  // Contract regeneration always follows the language stored with the application,
  // never the administrator's current browser language.
  const locale = normalizeLocale(app.locale || app.language) ?? "fr";
  const values = dossierValues(locale);
  const approved = APPROVED_STATUSES.has(status);
  const input = {
    reference: app.reference,
    locale,
    firstName: app.first_name,
    lastName: app.last_name,
    birthDate: app.birth_date,
    nationality: app.nationality || "—",
    address: app.address,
    phone: app.phone,
    email: app.email,
    employmentLabel: localizeEmployment(app.employment_status, locale),
    incomeLabel: money(app.income, app.currency, locale),
    monthlyChargesLabel: money(app.monthly_charges, app.currency, locale),
    programLabel: localizeProgram(app.program, locale),
    purpose: app.purpose || app.description || values.notProvided,
    amountLabel: money(app.amount, app.currency, locale),
    currency: app.currency,
    durationMonths: String(app.duration_months || "—"),
    processingSpeedLabel: localizeSpeed(app.processing_speed, locale),
    processingFeeLabel: app.processing_fee == null ? values.notApplicable : money(app.processing_fee, app.currency, locale),
    bankName: bank.bank_name,
    accountHolderName: bank.account_holder_name,
    ibanAccountNumber: bank.iban_account_number,
    swiftBic: bank.swift_bic || "",
    confirmationDate: new Date().toISOString().slice(0, 10),
    approved,
  } as const;

  const [structured, narrative] = await Promise.all([
    generateLoanContractPdf({ ...input, layout: "structured" }),
    generateLoanContractPdf({ ...input, layout: "narrative" }),
  ]);

  const structuredPath = app.contract_path || `${applicationId}/contract-draft.pdf`;
  const docs = Array.isArray(app.documents) ? app.documents : [];
  const narrativeMeta = docs.find(
    (item: unknown) => item && typeof item === "object" && (item as { key?: unknown }).key === "contract_narrative",
  ) as { path?: string } | undefined;
  const narrativePath = narrativeMeta?.path || `${applicationId}/contract-narrative.pdf`;

  const [{ error: structuredError }, { error: narrativeError }] = await Promise.all([
    client.storage.from("contracts").upload(structuredPath, structured, {
      contentType: "application/pdf",
      upsert: true,
    }),
    client.storage.from("application-documents").upload(narrativePath, narrative, {
      contentType: "application/pdf",
      upsert: true,
    }),
  ]);

  if (structuredError || narrativeError) {
    throw new Error("contract_regeneration_upload_failed");
  }

  return { approved, locale, structuredPath, narrativePath };
}

export const getCurrentAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) {
      adminLog("ADMIN_ROLE", error, { reason: "current_admin_role_check_failed" });
      return { userId: context.userId, isAdmin: false, degraded: true };
    }
    return { userId: context.userId, isAdmin: !!data, degraded: false };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      adminLog("ADMIN_APPLICATION_QUERY", error, { operation: "list" });
      throw new Error("applications_unavailable");
    }
    return data ?? [];
  });

export const getApplicationAdminDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: app, error } = await context.supabase
      .from("applications")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      adminLog("ADMIN_APPLICATION_QUERY", error, { operation: "detail", applicationId: data.id });
      throw new Error("application_detail_unavailable");
    }
    if (!app) throw new Error("not_found");

    const [bankResult, historyResult] = await Promise.all([
      context.supabase
        .from("application_bank_details")
        .select("bank_name, account_holder_name, iban_account_number, swift_bic")
        .eq("application_id", data.id)
        .maybeSingle(),
      context.supabase
        .from("application_status_history")
        .select("id, status, public_message, created_at, created_by")
        .eq("application_id", data.id)
        .order("created_at", { ascending: true }),
    ]);

    if (bankResult.error) adminLog("ADMIN_APPLICATION_QUERY", bankResult.error, { operation: "detail_bank", applicationId: data.id });
    if (historyResult.error) adminLog("ADMIN_APPLICATION_QUERY", historyResult.error, { operation: "detail_history", applicationId: data.id });

    return {
      application: app,
      bank: bankResult.error ? null : bankResult.data ?? null,
      history: historyResult.error ? [] : historyResult.data ?? [],
      degraded: {
        bank: !!bankResult.error,
        history: !!historyResult.error,
      },
    };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(APPLICATION_STATUSES),
        admin_note: z.string().max(4000).optional(),
        public_message: z.string().max(2000).optional(),
        missing_public_requirements: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const patch: Record<string, unknown> = { status: data.status };
    if (data.admin_note !== undefined) patch.admin_note = data.admin_note;
    if (data.public_message !== undefined) patch.public_message = data.public_message;
    if (data.missing_public_requirements !== undefined) {
      patch.missing_public_requirements = data.missing_public_requirements;
    }

    const { error } = await context.supabase.from("applications").update(patch).eq("id", data.id);
    if (error) {
      adminLog("ADMIN_APPLICATION_QUERY", error, { operation: "status_update", applicationId: data.id, status: data.status });
      throw new Error("status_update_failed");
    }

    let contractRefresh = true;
    try {
      await regenerateContractsForStatus(data.id, data.status);
    } catch (contractError) {
      contractRefresh = false;
      adminLog("ADMIN_APPLICATION_QUERY", contractError, { operation: "contract_refresh", applicationId: data.id, status: data.status });
    }

    return { ok: true, contractRefresh };
  });

export const createAdminSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        bucket: z.enum(["application-documents", "contracts"]),
        path: z.string().min(3).max(400),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: signed, error } = await context.supabase.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 15);
    if (error || !signed?.signedUrl) {
      adminLog("ADMIN_APPLICATION_QUERY", error ?? new Error("signed_url_missing"), { operation: "signed_url", bucket: data.bucket });
      throw new Error("sign_failed");
    }
    return { url: signed.signedUrl };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) {
      adminLog("ADMIN_APPLICATION_QUERY", error, { operation: "delete", applicationId: data.id });
      throw new Error(error.message);
    }
    return { ok: true };
  });
