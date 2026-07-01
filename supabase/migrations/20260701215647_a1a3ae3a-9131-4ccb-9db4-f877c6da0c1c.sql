
CREATE SEQUENCE IF NOT EXISTS public.application_ref_seq START 1;

CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'nouvelle_demande',

  -- Personal
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,

  -- Professional
  profession TEXT NOT NULL,
  company TEXT,
  income NUMERIC,

  -- Project
  program TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  goals TEXT NOT NULL,

  -- Meta
  language TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_application_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'SUB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_ref_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_application_reference
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_application_reference();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT INSERT ON public.applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
GRANT USAGE ON SEQUENCE public.application_ref_seq TO anon, authenticated, service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form)
CREATE POLICY "Anyone can create an application"
ON public.applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Reading is not allowed to anon; admin dashboard (future) will use service role or admin role.
CREATE POLICY "No public read"
ON public.applications FOR SELECT
TO authenticated
USING (false);
