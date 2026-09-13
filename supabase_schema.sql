CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_title TEXT DEFAULT 'MD. Shinha Sarder',
  site_tagline TEXT DEFAULT 'Founder & CEO of IT Tech BD and Biostar TV World',
  logo_url TEXT DEFAULT '/profile.webp',
  favicon_url TEXT DEFAULT '/favicon.webp',
  primary_color TEXT DEFAULT '42 87% 55%',
  background_color TEXT DEFAULT '222 47% 6%',
  font_heading TEXT DEFAULT 'Playfair Display',
  font_body TEXT DEFAULT 'Plus Jakarta Sans',
  seo_title TEXT DEFAULT 'MD. Shinha Sarder - Official Website & Blog',
  seo_description TEXT DEFAULT 'Official website of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World.',
  seo_keywords TEXT DEFAULT 'MD. Shinha Sarder, IT Tech BD, Biostar TV World, Blogger',
  social_facebook TEXT DEFAULT 'https://facebook.com/md.shinha.sarder',
  social_twitter TEXT DEFAULT 'https://x.com/mdshinhasarder',
  social_youtube TEXT DEFAULT 'https://youtube.com/@MD-Shinha-Sarder',
  social_github TEXT DEFAULT 'https://github.com/md-shinha-sarder',
  social_website TEXT DEFAULT 'https://mdshinhasarder.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_contact (
  id INT PRIMARY KEY DEFAULT 1,
  contact_email TEXT DEFAULT 'shinhasarder2343@gmail.com',
  contact_phone TEXT DEFAULT '+8801700000000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.site_contact (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE VIEW public.site_settings_public AS
SELECT
  id,
  site_title,
  site_tagline,
  logo_url,
  favicon_url,
  primary_color,
  background_color,
  font_heading,
  font_body,
  seo_title,
  seo_description,
  seo_keywords,
  social_facebook,
  social_twitter,
  social_youtube,
  social_github,
  social_website,
  updated_at
FROM public.site_settings;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_read_all" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_write_auth" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_auth" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pages_read_all" ON public.pages FOR SELECT USING (true);
CREATE POLICY "pages_write_auth" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "posts_read_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_write_auth" ON public.posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "media_read_all" ON public.media FOR SELECT USING (true);
CREATE POLICY "media_write_auth" ON public.media FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "site_settings_read_all" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_write_auth" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "site_contact_read_auth" ON public.site_contact FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_contact_write_auth" ON public.site_contact FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, null)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Media bucket public read" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public insert" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket public delete" ON storage.objects;

CREATE POLICY "Media bucket public read" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Media bucket public insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media bucket public update" ON storage.objects
FOR UPDATE USING (bucket_id = 'media');

CREATE POLICY "Media bucket public delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media');
