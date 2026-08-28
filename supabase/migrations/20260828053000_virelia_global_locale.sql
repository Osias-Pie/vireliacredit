-- Virelia Crédit — persist the language used when an application is submitted.
-- Non-destructive: existing rows are preserved and backfilled from the historical language column.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS locale text;

UPDATE public.applications
SET locale = CASE
  WHEN lower(COALESCE(language, '')) IN ('fr', 'en', 'de', 'es', 'pt', 'it', 'hr')
    THEN lower(language)
  ELSE 'fr'
END
WHERE locale IS NULL OR btrim(locale) = '';

ALTER TABLE public.applications
  ALTER COLUMN locale SET DEFAULT 'fr',
  ALTER COLUMN locale SET NOT NULL;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_locale_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_locale_check
  CHECK (locale IN ('fr', 'en', 'de', 'es', 'pt', 'it', 'hr'));

COMMENT ON COLUMN public.applications.locale IS
  'Language of the user journey when the application was submitted. Used for dossier-bound content and contract generation.';
