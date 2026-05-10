-- proyectos_transmision: inserts solo desde backend (Netlify + service role).
-- Ejecutar en Supabase ? SQL Editor si usas guardado en la nube desde transmission-project-save.
--
-- 1) Columna de propiedad por email verificado (JWT Netlify auth-login), alternativa a auth.uid().
ALTER TABLE public.proyectos_transmision
  ADD COLUMN IF NOT EXISTS owner_email text;

COMMENT ON COLUMN public.proyectos_transmision.owner_email IS 'Email cuenta verificada (sesión Netlify); insert solo con SERVICE_ROLE.';

-- 2) Si user_id referencia auth.users y es NOT NULL sin valor desde Netlify, permítelo nulo para filas solo-owner_email:
-- ALTER TABLE public.proyectos_transmision ALTER COLUMN user_id DROP NOT NULL;

-- 3) RLS: bloquear anon/authenticated directos; el cliente ya no inserta con anon key.
ALTER TABLE public.proyectos_transmision ENABLE ROW LEVEL SECURITY;

-- Revoca permisos directos si los habías concedido al anon key:
REVOKE ALL ON public.proyectos_transmision FROM anon;
REVOKE ALL ON public.proyectos_transmision FROM authenticated;

-- La clave service_role en el servidor bypass RLS en Supabase; no expongas esa clave al navegador.
