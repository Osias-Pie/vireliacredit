-- Virelia Crédit — prevent legacy/direct authenticated application deletes.
-- Permanent deletion is intentionally reserved for the protected server-side archive flow.

DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;
DROP POLICY IF EXISTS "Application hard delete is server only" ON public.applications;

CREATE POLICY "Application hard delete is server only"
ON public.applications
FOR DELETE
TO authenticated
USING (false);

COMMENT ON POLICY "Application hard delete is server only" ON public.applications IS
  'Permanent deletion is performed only by the protected server-side archive flow after admin role and typed-reference verification; direct authenticated DELETE is denied.';
