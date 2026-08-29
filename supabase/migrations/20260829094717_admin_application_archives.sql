-- Virelia Crédit — internal admin archives for loan applications.
-- Non-destructive: existing dossiers remain active because archived_at defaults to NULL.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_archived_by_fkey'
      AND conrelid = 'public.applications'::regclass
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_archived_by_fkey
      FOREIGN KEY (archived_by)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS applications_active_created_at_idx
  ON public.applications (created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS applications_archived_at_idx
  ON public.applications (archived_at DESC)
  WHERE archived_at IS NOT NULL;

COMMENT ON COLUMN public.applications.archived_at IS
  'Internal admin archive timestamp. NULL means the dossier remains active in the main dashboard.';

COMMENT ON COLUMN public.applications.archived_by IS
  'Admin user who archived the dossier. Internal-only organizational metadata.';
