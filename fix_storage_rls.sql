-- =========================================================
-- Supabase Storage & Media RLS Fix
-- Run this in Supabase Dashboard > SQL Editor > Run
-- =========================================================

-- 1. Ensure storage bucket 'media' exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clean up old restrictive policies on storage.objects
DROP POLICY IF EXISTS "Media bucket public read" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public insert" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete media" ON storage.objects;
DROP POLICY IF EXISTS "Allow all for media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- 3. Allow ALL operations on the 'media' bucket
CREATE POLICY "Allow all for media" ON storage.objects
FOR ALL
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 4. Ensure public.media database table has full access
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  filename TEXT,
  url TEXT NOT NULL,
  path TEXT,
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "media_all_access" ON public.media;
CREATE POLICY "media_all_access" ON public.media FOR ALL USING (true) WITH CHECK (true);

-- 5. Ensure user_roles table exists and assigns admin role
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_all" ON public.user_roles;
CREATE POLICY "user_roles_all" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN ('shinhasarder2343@gmail.com', 'mdshinhasarder466@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
