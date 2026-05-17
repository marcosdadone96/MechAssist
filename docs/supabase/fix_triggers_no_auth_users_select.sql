-- =============================================================================
-- Fix: "permission denied for table users" al guardar motorreductores / cálculos
--
-- Causa: los triggers leían auth.users; el rol authenticated no tiene SELECT ahí.
-- Solución: usar el email del JWT (auth.jwt() ->> 'email').
--
-- Ejecutar en Supabase ? SQL Editor (una vez). No requiere redeploy de la web.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.calculos_mecanicos_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.owner_user_id := auth.uid();
    NEW.owner_email := nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '');
  ELSIF tg_op = 'UPDATE' THEN
    NEW.owner_user_id := OLD.owner_user_id;
    NEW.owner_email := OLD.owner_email;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mis_motorreductores_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.user_id := auth.uid();
    NEW.cuenta_email := nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '');
  ELSIF tg_op = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
    NEW.cuenta_email := OLD.cuenta_email;
  END IF;
  RETURN NEW;
END;
$$;
