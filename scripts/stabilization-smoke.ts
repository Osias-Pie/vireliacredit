import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const exists = (path: string) => existsSync(new URL(`../${path}`, import.meta.url));

const authRoute = read("src/routes/_authenticated/route.tsx");
assert.ok(authRoute.includes("supabase.auth.getSession()"), "Admin route must restore the persisted Supabase session");
assert.ok(authRoute.includes('redirect({ to: "/auth" })'), "Unauthenticated /admin must redirect to /auth");
assert.ok(authRoute.includes('stage: "ADMIN_AUTH"'), "Admin route must expose safe ADMIN_AUTH diagnostics");

const middleware = read("src/integrations/supabase/auth-middleware.ts");
assert.ok(middleware.includes("Authorization: `Bearer ${token}`"), "Admin JWT must be forwarded to server functions");
assert.ok(middleware.includes("SUPABASE_SERVER_CONFIG"), "Missing server configuration must be diagnosable");

const adminFunctions = read("src/lib/admin.functions.ts");
assert.ok(adminFunctions.includes('adminLog("ADMIN_ROLE"'), "Admin role failures must be categorized");
assert.ok(adminFunctions.includes('adminLog("ADMIN_APPLICATION_QUERY"'), "Admin application queries must be categorized");

const submission = read("src/lib/applications.functions.ts");
assert.ok(submission.includes('safeLog("SUBMIT_RPC"'), "RPC submission failures must be categorized");
assert.ok(submission.includes('safeLog("SUBMIT_POST_PROCESSING"'), "Post-processing failures must be categorized");
assert.ok(submission.includes("needsTechnicalFinalization: !complete"), "A created application must return a non-destructive partial status");
assert.ok(!submission.includes('from("applications").delete().eq("id", applicationId)'), "A created application must not be deleted after a secondary failure");
assert.ok(submission.includes('typeof value === "string" && value.startsWith("VIR-")'), "Legacy text RPC responses must remain supported");
assert.ok(submission.includes('typeof obj.id === "string" && typeof obj.reference === "string"'), "Modern id/reference RPC responses must remain supported");

const mobileFallback = read("src/components/runtime/MobileContractPdfFallback.tsx");
assert.ok(mobileFallback.includes('object.type === "application/pdf"'), "Mobile fallback must target PDF blobs");
assert.ok(mobileFallback.includes('target="_blank"'), "Mobile PDF must expose an explicit open action");
assert.ok(mobileFallback.includes("download={`Virelia-contract-preview-${activeLocale}.pdf`}"), "Mobile PDF must expose an explicit download action");
assert.ok(mobileFallback.includes('stage: "CONTRACT_PREVIEW"'), "Mobile preview must expose safe diagnostics");

const localeContext = read("src/lib/i18n/context.tsx");
assert.ok(localeContext.includes('fetch("/api/locale"'), "Initial locale detection must use the stable HTTP server route");
assert.ok(exists("src/routes/api.locale.ts"), "The locale server route must exist");
assert.ok(!exists("src/lib/i18n/locale.functions.ts"), "The root createServerFn locale detector must remain removed");
const localeApi = read("src/routes/api.locale.ts");
assert.ok(localeApi.includes('request.headers.get("x-vercel-ip-country")'), "Locale route must preserve Vercel country detection");
assert.ok(localeApi.includes("resolveInitialLocale"), "Locale route must preserve the existing locale priority logic");

const appliedLocaleMigration = new URL(
  "../supabase/migrations/20260828042547_virelia_global_locale.sql",
  import.meta.url,
);
const obsoleteLocaleMigration = new URL(
  "../supabase/migrations/20260828053000_virelia_global_locale.sql",
  import.meta.url,
);
assert.ok(existsSync(appliedLocaleMigration), "Git migration filename must match the already-applied Supabase version");
assert.ok(!existsSync(obsoleteLocaleMigration), "The duplicate future locale migration filename must be removed");

console.log("Stabilization smoke tests passed: admin auth, JWT, submission durability, mobile PDF fallback, locale HTTP route and migration alignment.");
