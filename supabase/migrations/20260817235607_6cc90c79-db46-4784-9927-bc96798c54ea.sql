ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS employment_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS other_income numeric,
  ADD COLUMN IF NOT EXISTS monthly_charges numeric,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS processing_speed text,
  ADD COLUMN IF NOT EXISTS duration_months integer,
  ADD COLUMN IF NOT EXISTS processing_fee numeric,
  ADD COLUMN IF NOT EXISTS documents jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.applications
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN profession DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN goals DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.submit_application(p jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_ref text;
BEGIN
  new_ref := 'VIR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_ref_seq')::text, 6, '0');

  INSERT INTO public.applications (
    reference, last_name, first_name, birth_date, country, nationality, address,
    phone, email, employment_status, employment_details, income, other_income,
    monthly_charges, program, amount, currency, duration_months, purpose,
    processing_speed, processing_fee, documents, language, description
  ) VALUES (
    new_ref,
    p->>'last_name', p->>'first_name', (p->>'birth_date')::date,
    p->>'country', NULLIF(p->>'nationality',''), p->>'address',
    p->>'phone', p->>'email',
    NULLIF(p->>'employment_status',''),
    COALESCE(p->'employment_details', '{}'::jsonb),
    NULLIF(p->>'income','')::numeric,
    NULLIF(p->>'other_income','')::numeric,
    NULLIF(p->>'monthly_charges','')::numeric,
    p->>'program', (p->>'amount')::numeric, p->>'currency',
    NULLIF(p->>'duration_months','')::int,
    NULLIF(p->>'purpose',''),
    NULLIF(p->>'processing_speed',''),
    NULLIF(p->>'processing_fee','')::numeric,
    COALESCE(p->'documents', '[]'::jsonb),
    NULLIF(p->>'language',''),
    NULLIF(p->>'purpose','')
  );

  RETURN new_ref;
END;
$function$;