-- =============================================================================
-- Carpetas por marca para mis_motorreductores (tras calculos_y_motorreductores.sql)
-- Una fila por (usuario, brand_id) del catálogo; los equipos enlazan folder_id.
-- =============================================================================

ALTER TABLE public.mis_motorreductores
  ADD COLUMN IF NOT EXISTS folder_id uuid;

CREATE TABLE IF NOT EXISTS public.mis_motorreductores_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  brand_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_mis_mr_folders_user_brand ON public.mis_motorreductores_folders (user_id, brand_id);

CREATE OR REPLACE FUNCTION public.mis_motorreductores_folders_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.user_id := auth.uid();
  ELSIF tg_op = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_mis_motorreductores_folders_set_owner ON public.mis_motorreductores_folders;
CREATE TRIGGER tr_mis_motorreductores_folders_set_owner
  BEFORE INSERT OR UPDATE ON public.mis_motorreductores_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.mis_motorreductores_folders_set_owner();

ALTER TABLE public.mis_motorreductores_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mis_mr_folders_own" ON public.mis_motorreductores_folders;
CREATE POLICY "mis_mr_folders_own"
  ON public.mis_motorreductores_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.mis_motorreductores_folders FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mis_motorreductores_folders TO authenticated;

ALTER TABLE public.mis_motorreductores
  DROP CONSTRAINT IF EXISTS mis_motorreductores_folder_id_fkey;

ALTER TABLE public.mis_motorreductores
  ADD CONSTRAINT mis_motorreductores_folder_id_fkey
  FOREIGN KEY (folder_id) REFERENCES public.mis_motorreductores_folders (id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "mis_mr_own_rows" ON public.mis_motorreductores;
CREATE POLICY "mis_mr_own_rows"
  ON public.mis_motorreductores
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      folder_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.mis_motorreductores_folders f
        WHERE f.id = folder_id AND f.user_id = auth.uid()
      )
    )
  );
