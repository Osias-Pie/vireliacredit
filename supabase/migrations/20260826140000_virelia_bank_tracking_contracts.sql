-- Virelia Crédit — bank details, status history, tracking, contracts, storage.
-- Do not edit previously applied migrations.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS country_of_residence text,
  ADD COLUMN IF NOT EXISTS public_message text,
  ADD COLUMN IF NOT EXISTS contract_path text,
  ADD COLUMN IF NOT EXISTS missing_public_requirements text;

UPDATE public.applications
SET country_of_residence = country
WHERE country_of_residence IS NULL AND country IS NOT NULL;

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check CHECK (
    status = ANY (ARRAY[
      'nouvelle_demande',
      'dossier_en_verification',
      'documents_a_completer',
      'complement_requis',
      'en_analyse',
      'contrat_en_preparation',
      'contrat_a_valider',
      'approuvee',
      'acceptee',
      'virement_en_preparation',
      'terminee',
      'refusee',
      'archivee'
    ]::text[])
  );

CREATE TABLE IF NOT EXISTS public.application_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_holder_name text NOT NULL,
  iban_account_number text NOT NULL,
  swift_bic text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  public_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX IF NOT EXISTS application_status_history_app_idx
  ON public.application_status_history (application_id, created_at);

ALTER TABLE public.application_bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.application_bank_details FROM anon, public;
REVOKE ALL ON public.application_status_history FROM anon, public;
GRANT ALL ON public.application_bank_details TO service_role;
GRANT ALL ON public.application_status_history TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.application_bank_details TO authenticated;
GRANT SELECT, INSERT ON public.application_status_history TO authenticated;

DROP POLICY IF EXISTS "Admins can view bank details" ON public.application_bank_details;
CREATE POLICY "Admins can view bank details"
  ON public.application_bank_details FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert bank details" ON public.application_bank_details;
CREATE POLICY "Admins can insert bank details"
  ON public.application_bank_details FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update bank details" ON public.application_bank_details;
CREATE POLICY "Admins can update bank details"
  ON public.application_bank_details FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view status history" ON public.application_status_history;
CREATE POLICY "Admins can view status history"
  ON public.application_status_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert status history" ON public.application_status_history;
CREATE POLICY "Admins can insert status history"
  ON public.application_status_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_bank_details_updated_at ON public.application_bank_details;
CREATE TRIGGER trg_bank_details_updated_at
BEFORE UPDATE ON public.application_bank_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.tg_application_status_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_status_history (application_id, status, public_message)
    VALUES (NEW.id, NEW.status, 'Votre demande a bien été reçue. Notre équipe va l''examiner.');
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.application_status_history (application_id, status, public_message)
    VALUES (
      NEW.id,
      NEW.status,
      CASE WHEN NEW.public_message IS DISTINCT FROM OLD.public_message THEN NEW.public_message ELSE NULL END
    );
  ELSIF NEW.public_message IS DISTINCT FROM OLD.public_message AND NEW.public_message IS NOT NULL THEN
    INSERT INTO public.application_status_history (application_id, status, public_message)
    VALUES (NEW.id, NEW.status, NEW.public_message);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_history ON public.applications;
CREATE TRIGGER trg_application_status_history
AFTER INSERT OR UPDATE OF status, public_message ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.tg_application_status_history();

DROP FUNCTION IF EXISTS public.submit_application(jsonb);

CREATE FUNCTION public.submit_application(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_ref text;
  new_id uuid;
BEGIN
  new_ref := 'VIR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_ref_seq')::text, 6, '0');

  INSERT INTO public.applications (
    reference, last_name, first_name, birth_date, country, country_of_residence, nationality, address,
    phone, email, employment_status, employment_details, income, other_income,
    monthly_charges, program, amount, currency, duration_months, purpose,
    processing_speed, processing_fee, documents, language, description, contract_path
  ) VALUES (
    new_ref,
    p->>'last_name', p->>'first_name', (p->>'birth_date')::date,
    p->>'country', COALESCE(NULLIF(p->>'country_of_residence',''), p->>'country'),
    NULLIF(p->>'nationality',''), p->>'address',
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
    NULLIF(p->>'purpose',''),
    NULLIF(p->>'contract_path','')
  )
  RETURNING id INTO new_id;

  INSERT INTO public.application_bank_details (
    application_id, bank_name, account_holder_name, iban_account_number, swift_bic
  ) VALUES (
    new_id,
    p->>'bank_name',
    p->>'account_holder_name',
    p->>'iban_account_number',
    NULLIF(p->>'swift_bic','')
  );

  RETURN jsonb_build_object('id', new_id, 'reference', new_ref);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_application(jsonb) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_application_tracking(p_reference text, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  app public.applications%ROWTYPE;
  hist jsonb;
BEGIN
  IF p_reference IS NULL OR length(trim(p_reference)) < 8 THEN
    RETURN NULL;
  END IF;
  IF p_email IS NULL OR position('@' in p_email) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO app
  FROM public.applications
  WHERE lower(reference) = lower(trim(p_reference))
    AND lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'status', h.status,
    'public_message', h.public_message,
    'created_at', h.created_at
  ) ORDER BY h.created_at ASC), '[]'::jsonb)
  INTO hist
  FROM public.application_status_history h
  WHERE h.application_id = app.id;

  RETURN jsonb_build_object(
    'reference', app.reference,
    'program', app.program,
    'amount', app.amount,
    'currency', app.currency,
    'created_at', app.created_at,
    'status', app.status,
    'public_message', app.public_message,
    'missing_public_requirements', app.missing_public_requirements,
    'history', hist
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_application_tracking(text, text) TO anon, authenticated, service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('application-documents', 'application-documents', false),
  ('contracts', 'contracts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Admins read private application files" ON storage.objects;
CREATE POLICY "Admins read private application files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('application-documents', 'contracts')
    AND public.has_role(auth.uid(), 'admin')
  );
