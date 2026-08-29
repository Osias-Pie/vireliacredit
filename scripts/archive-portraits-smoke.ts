import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const exists = (path: string) => existsSync(new URL(`../${path}`, import.meta.url));

const profiles = read("src/lib/data/testimonial-profiles.ts");
const testimonials = read("src/components/sections/Testimonials.tsx");
const portraitReadme = read("public/testimonials/README.md");

for (let index = 1; index <= 12; index += 1) {
  const suffix = String(index).padStart(2, "0");
  assert.ok(profiles.includes(`/testimonials/profile-${suffix}.webp`), `profile-${suffix}.webp path must be wired`);
  assert.ok(portraitReadme.includes(`profile-${suffix}.webp`), `profile-${suffix}.webp must be documented`);
}
assert.equal((profiles.match(/isDemo: true,/g) ?? []).length, 12, "All 12 profile cards must remain illustrative/demo entries");
assert.ok(testimonials.includes('loading="lazy"'), "Portrait images must lazy-load");
assert.ok(testimonials.includes("onError={() => setFailed(true)}"), "Missing portraits must fall back cleanly");
assert.ok(testimonials.includes("width={640}"), "Portrait width must be explicit");
assert.ok(testimonials.includes("height={800}"), "Portrait height must be explicit");
assert.ok(testimonials.includes("object-cover"), "Portraits must use object-fit cover");
assert.ok(testimonials.includes("grid-cols-1"), "Mobile grid must stay one column");
assert.ok(testimonials.includes("md:grid-cols-2"), "Tablet grid must stay two columns");
assert.ok(testimonials.includes("lg:grid-cols-3"), "Desktop grid must stay three columns");

const migrationPath = "supabase/migrations/20260829094717_admin_application_archives.sql";
assert.ok(exists(migrationPath), "Git must contain the exact Supabase archive migration version");
const migration = read(migrationPath);
assert.ok(migration.includes("archived_at timestamptz"), "Archive timestamp column must exist");
assert.ok(migration.includes("archived_by uuid"), "Archive actor column must exist");
assert.ok(migration.includes("ON DELETE SET NULL"), "Deleting an admin account must not break archived dossiers");
assert.ok(migration.includes("WHERE archived_at IS NULL"), "Active dashboard partial index must exist");

const deleteGuardPath = "supabase/migrations/20260829095704_admin_archive_delete_guard.sql";
assert.ok(exists(deleteGuardPath), "Git must contain the exact Supabase direct-delete guard migration version");
const deleteGuard = read(deleteGuardPath);
assert.ok(deleteGuard.includes('DROP POLICY IF EXISTS "Admins can delete applications"'), "Legacy authenticated hard-delete policy must be removed");
assert.ok(deleteGuard.includes('CREATE POLICY "Application hard delete is server only"'), "Direct application DELETE must be explicitly denied");
assert.ok(deleteGuard.includes("USING (false)"), "Authenticated direct DELETE must remain blocked even for admins");

const archiveFns = read("src/lib/admin-archives.functions.ts");
assert.ok(archiveFns.includes('rpc("has_role"'), "Every archive server operation must enforce the admin role");
assert.ok(archiveFns.includes('.is("archived_at", null)'), "Active applications must exclude archived dossiers server-side");
assert.ok(archiveFns.includes('.not("archived_at", "is", null)'), "Archive queries/restores must target archived dossiers");
assert.ok(archiveFns.includes("export const archiveApplication"), "Archive server function must exist");
assert.ok(archiveFns.includes("export const restoreApplication"), "Restore server function must exist");
assert.ok(archiveFns.includes("export const deleteApplicationPermanently"), "Permanent delete server function must exist");
assert.ok(archiveFns.includes("delete_requires_archive"), "Permanent delete must reject active dossiers");
assert.ok(archiveFns.includes("delete_confirmation_mismatch"), "Permanent delete must verify the typed VIR reference server-side");
assert.ok(archiveFns.includes('removeStoragePrefix(client, "application-documents"'), "Application documents must be cleaned before hard delete");
assert.ok(archiveFns.includes('removeStoragePrefix(client, "contracts"'), "Contracts must be cleaned before hard delete");
assert.ok(!archiveFns.includes('window.'), "Sensitive archive/delete operations must remain server-side");

const adminPage = read("src/routes/_authenticated/admin.tsx");
assert.ok(adminPage.includes("listActiveApplications"), "Main admin dashboard must use active-only server data");
assert.ok(adminPage.includes("ArchivedApplicationsPanel"), "Admin must expose an archives space");
assert.ok(adminPage.includes("ApplicationArchiveControls"), "Admin detail must expose archive/restore controls");
assert.ok(adminPage.includes("ArchiveApplicationButton"), "Active table must expose archive as the normal cleanup action");
assert.ok(!adminPage.includes('supabase.from("applications").delete()'), "Browser admin UI must never hard-delete applications directly");

const archiveActions = read("src/components/admin/ApplicationArchiveActions.tsx");
assert.ok(archiveActions.includes("Archiver ce dossier ?"), "Archive confirmation copy must be explicit");
assert.ok(archiveActions.includes("Supprimer définitivement"), "Permanent delete must be clearly labeled");
assert.ok(archiveActions.includes("confirmation.trim() === application.reference"), "Permanent delete UI must require the exact VIR reference");

const archivePanel = read("src/components/admin/ArchivedApplicationsPanel.tsx");
assert.ok(archivePanel.includes("RestoreApplicationButton"), "Archives must provide restore actions");
assert.ok(archivePanel.includes("DeleteArchivedApplicationButton"), "Archives must contain the only permanent-delete action surface");
assert.ok(archivePanel.includes("PAGE_SIZE = 25"), "Archive list must paginate as it grows");

console.log("Archive/portrait smoke tests passed: illustrative portrait slots, active-only dashboard, secure archive/restore/delete, direct-delete RLS guard and storage cleanup guards.");
