-- =============================================================================
-- TheMechAssist ù calculos_mecanicos + mis_motorreductores (RLS con auth.uid())
-- Ejecutar en Supabase SQL Editor tras backup si ya hay datos en tablas antiguas.
--
-- Requisitos en el cliente:
--   - Sesiùn Supabase Auth (JWT). Tras login Netlify, llamar a
--     /.netlify/functions/supabase-session-mint para setSession en el navegador.
--   - Sin sesiùn Supabase, anon no tiene permisos sobre estas tablas.
--
-- Migraciùn desde esquema anterior (email + anon): las filas viejas sin user_id
-- deben backfillearse o borrarse antes de activar triggers NOT NULL.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tablas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calculos_mecanicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tipo_maquina text NOT NULL,
  datos_entrada jsonb NOT NULL DEFAULT '{}'::jsonb,
  resultados jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  owner_email text
);

CREATE INDEX IF NOT EXISTS idx_calculos_mec_owner_uid ON public.calculos_mecanicos (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_calculos_mec_created_at ON public.calculos_mecanicos (created_at DESC);

CREATE TABLE IF NOT EXISTS public.mis_motorreductores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  cuenta_email text,
  referencia text,
  potencia_kw double precision NOT NULL,
  rpm_salida double precision NOT NULL,
  par_nominal_nm double precision NOT NULL,
  par_pico_nm double precision,
  rpm_motor double precision,
  eficiencia_reductor double precision,
  notas text,
  folder_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mis_mr_user_id ON public.mis_motorreductores (user_id);
CREATE INDEX IF NOT EXISTS idx_mis_mr_created_at ON public.mis_motorreductores (created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Triggers: el cliente no puede falsificar user_id / owner (usa JWT Supabase)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculos_mecanicos_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.owner_user_id := auth.uid();
    NEW.owner_email := (SELECT email FROM auth.users WHERE id = auth.uid());
  ELSIF tg_op = 'UPDATE' THEN
    NEW.owner_user_id := OLD.owner_user_id;
    NEW.owner_email := OLD.owner_email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_calculos_mecanicos_set_owner ON public.calculos_mecanicos;
CREATE TRIGGER tr_calculos_mecanicos_set_owner
  BEFORE INSERT OR UPDATE ON public.calculos_mecanicos
  FOR EACH ROW
  EXECUTE FUNCTION public.calculos_mecanicos_set_owner();

CREATE OR REPLACE FUNCTION public.mis_motorreductores_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.user_id := auth.uid();
    NEW.cuenta_email := (SELECT email FROM auth.users WHERE id = auth.uid());
  ELSIF tg_op = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
    NEW.cuenta_email := OLD.cuenta_email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_mis_motorreductores_set_owner ON public.mis_motorreductores;
CREATE TRIGGER tr_mis_motorreductores_set_owner
  BEFORE INSERT OR UPDATE ON public.mis_motorreductores
  FOR EACH ROW
  EXECUTE FUNCTION public.mis_motorreductores_set_owner();

-- -----------------------------------------------------------------------------
-- 3. RLS (solo authenticated; anon sin polùticas = sin acceso)
-- -----------------------------------------------------------------------------
ALTER TABLE public.calculos_mecanicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calculos_mecanicos_anon_all" ON public.calculos_mecanicos;
DROP POLICY IF EXISTS "calculos_mecanicos_authenticated_all" ON public.calculos_mecanicos;
DROP POLICY IF EXISTS "calculos_own_rows" ON public.calculos_mecanicos;

CREATE POLICY "calculos_own_rows"
  ON public.calculos_mecanicos
  FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

ALTER TABLE public.mis_motorreductores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mis_motorreductores_anon_all" ON public.mis_motorreductores;
DROP POLICY IF EXISTS "mis_motorreductores_authenticated_all" ON public.mis_motorreductores;
DROP POLICY IF EXISTS "mis_mr_own_rows" ON public.mis_motorreductores;

CREATE POLICY "mis_mr_own_rows"
  ON public.mis_motorreductores
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.calculos_mecanicos FROM anon;
REVOKE ALL ON public.mis_motorreductores FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculos_mecanicos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mis_motorreductores TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Realtime
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mis_motorreductores;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Carpetas por marca (opcional): ver docs/supabase/mis_mr_brand_folders.sql
