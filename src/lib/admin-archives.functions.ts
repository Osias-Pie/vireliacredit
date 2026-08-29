import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idSchema = z.object({ id: z.string().uuid() });
const deleteSchema = z.object({
  id: z.string().uuid(),
  confirmationReference: z.string().trim().min(8).max(80),
});

function archiveLog(stage: string, error?: unknown, extra: Record<string, unknown> = {}) {
  const technical =
    error instanceof Error
      ? { name: error.name, message: error.message.slice(0, 300) }
      : error && typeof error === "object"
        ? {
            code: String((error as { code?: unknown }).code ?? "unknown"),
            message: String((error as { message?: unknown }).message ?? "").slice(0, 300),
          }
        : { message: String(error ?? "").slice(0, 300) };
  console.error("[Virelia archive]", { stage, ...technical, ...extra });
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) {
    archiveLog("ADMIN_ARCHIVE_ROLE", error, { reason: "role_check_failed" });
    throw new Error("role_check_failed");
  }
  if (!data) {
    archiveLog("ADMIN_ARCHIVE_ROLE", new Error("forbidden"), { reason: "role_missing" });
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
    archiveLog("SUPABASE_SERVER_CONFIG", new Error("server_configuration_missing"), {
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

async function collectStorageObjects(client: any, bucket: string, prefix: string): Promise<string[]> {
  const { data, error } = await client.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  const paths: string[] = [];
  for (const entry of data ?? []) {
    if (!entry?.name) continue;
    const path = `${prefix}/${entry.name}`;
    if (entry.id) {
      paths.push(path);
    } else {
      paths.push(...(await collectStorageObjects(client, bucket, path)));
    }
  }
  return paths;
}

async function removeStoragePrefix(client: any, bucket: string, applicationId: string) {
  const paths = await collectStorageObjects(client, bucket, applicationId);
  let removed = 0;
  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);
    const { error } = await client.storage.from(bucket).remove(batch);
    if (error) throw error;
    removed += batch.length;
  }
  return removed;
}

export const listActiveApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("applications")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) {
      archiveLog("ADMIN_ACTIVE_QUERY", error);
      throw new Error("active_applications_unavailable");
    }
    return data ?? [];
  });

export const listArchivedApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("applications")
      .select("*")
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });
    if (error) {
      archiveLog("ADMIN_ARCHIVE_QUERY", error);
      throw new Error("archived_applications_unavailable");
    }
    return data ?? [];
  });

export const getArchiveCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { count, error } = await context.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .not("archived_at", "is", null);
    if (error) {
      archiveLog("ADMIN_ARCHIVE_QUERY", error, { operation: "count" });
      throw new Error("archive_count_unavailable");
    }
    return { count: count ?? 0 };
  });

export const archiveApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => idSchema.parse(value))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const archivedAt = new Date().toISOString();
    const { data: updated, error } = await context.supabase
      .from("applications")
      .update({ archived_at: archivedAt, archived_by: context.userId })
      .eq("id", data.id)
      .is("archived_at", null)
      .select("id, reference, archived_at")
      .maybeSingle();
    if (error) {
      archiveLog("ADMIN_ARCHIVE_WRITE", error, { operation: "archive", applicationId: data.id });
      throw new Error("archive_failed");
    }
    if (!updated) throw new Error("archive_not_found_or_already_archived");
    return { ok: true, reference: updated.reference, archivedAt: updated.archived_at };
  });

export const restoreApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => idSchema.parse(value))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: updated, error } = await context.supabase
      .from("applications")
      .update({ archived_at: null, archived_by: null })
      .eq("id", data.id)
      .not("archived_at", "is", null)
      .select("id, reference")
      .maybeSingle();
    if (error) {
      archiveLog("ADMIN_ARCHIVE_WRITE", error, { operation: "restore", applicationId: data.id });
      throw new Error("restore_failed");
    }
    if (!updated) throw new Error("restore_not_found_or_not_archived");
    return { ok: true, reference: updated.reference };
  });

export const deleteApplicationPermanently = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => deleteSchema.parse(value))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);

    const client = await serverAdminClient();
    const { data: app, error: lookupError } = await client
      .from("applications")
      .select("id, reference, archived_at")
      .eq("id", data.id)
      .maybeSingle();
    if (lookupError) {
      archiveLog("ADMIN_DELETE", lookupError, { operation: "lookup", applicationId: data.id });
      throw new Error("delete_lookup_failed");
    }
    if (!app) throw new Error("delete_not_found");
    if (!app.archived_at) throw new Error("delete_requires_archive");
    if (app.reference !== data.confirmationReference) throw new Error("delete_confirmation_mismatch");

    let applicationDocumentsRemoved = 0;
    let contractsRemoved = 0;
    try {
      applicationDocumentsRemoved = await removeStoragePrefix(client, "application-documents", app.id);
      contractsRemoved = await removeStoragePrefix(client, "contracts", app.id);
    } catch (storageError) {
      archiveLog("ADMIN_DELETE", storageError, { operation: "storage_cleanup", applicationId: data.id });
      throw new Error("delete_storage_cleanup_failed");
    }

    const { data: deleted, error: deleteError } = await client
      .from("applications")
      .delete()
      .eq("id", app.id)
      .select("id")
      .maybeSingle();
    if (deleteError || !deleted) {
      archiveLog("ADMIN_DELETE", deleteError ?? new Error("delete_missing_result"), {
        operation: "database_delete",
        applicationId: data.id,
      });
      throw new Error("delete_database_failed");
    }

    return {
      ok: true,
      reference: app.reference,
      storage: {
        applicationDocumentsRemoved,
        contractsRemoved,
      },
    };
  });
