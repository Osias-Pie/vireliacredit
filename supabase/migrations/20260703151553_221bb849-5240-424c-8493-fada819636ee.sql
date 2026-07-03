CREATE OR REPLACE FUNCTION public.submit_application(p jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref text;
BEGIN
  new_ref := 'SUB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_ref_seq')::text, 6, '0');

  INSERT INTO public.applications (
    reference, last_name, first_name, gender, birth_date, country, city, address,
    phone, whatsapp, email, profession, company, income, program, amount, currency,
    description, goals, language
  ) VALUES (
    new_ref,
    p->>'last_name', p->>'first_name', p->>'gender', (p->>'birth_date')::date,
    p->>'country', p->>'city', p->>'address', p->>'phone',
    NULLIF(p->>'whatsapp',''), p->>'email', p->>'profession',
    NULLIF(p->>'company',''), NULLIF(p->>'income','')::numeric,
    p->>'program', (p->>'amount')::numeric, p->>'currency',
    p->>'description', p->>'goals', NULLIF(p->>'language','')
  );

  RETURN new_ref;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_application(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_application(jsonb) TO anon, authenticated;