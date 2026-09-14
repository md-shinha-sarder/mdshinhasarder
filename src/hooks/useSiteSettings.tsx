import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: number;
  site_title: string | null;
  site_tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  background_color: string | null;
  font_heading: string | null;
  font_body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  social_github: string | null;
  social_website: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_title: "MD. Shinha Sarder",
  site_tagline: "Founder & CEO of IT Tech BD and Biostar TV World",
  logo_url: "/profile.webp",
  favicon_url: "/favicon.webp",
  primary_color: "42 87% 55%",
  background_color: "222 47% 6%",
  font_heading: "Playfair Display",
  font_body: "Plus Jakarta Sans",
  seo_title: "MD. Shinha Sarder - Entrepreneur",
  seo_description: "Official website of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World.",
  seo_keywords: "MD. Shinha Sarder, IT Tech BD, Biostar TV World, Blogger",
  social_facebook: "https://facebook.com/md.shinha.sarder",
  social_twitter: "https://x.com/mdshinhasarder",
  social_youtube: "https://youtube.com/@MD-Shinha-Sarder",
  social_github: "https://github.com/md-shinha-sarder",
  social_website: "https://mdshinhasarder.com",
};

const sanitizeTitle = (title: string | null | undefined): string => {
  if (!title) return "MD. Shinha Sarder - Entrepreneur";
  return title.replace(/Official Website\s*(&|and)\s*Blog/gi, "Entrepreneur");
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings_public" as any)
      .select("id, site_title, site_tagline, logo_url, favicon_url, primary_color, background_color, font_heading, font_body, seo_title, seo_description, seo_keywords, social_facebook, social_twitter, social_youtube, social_github, social_website, updated_at")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const raw = data as unknown as SiteSettings;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...raw,
            seo_title: sanitizeTitle(raw.seo_title || DEFAULT_SETTINGS.seo_title),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.primary_color) root.style.setProperty("--primary", settings.primary_color);
    if (settings.background_color) root.style.setProperty("--background", settings.background_color);
    if (settings.seo_title) document.title = sanitizeTitle(settings.seo_title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta && settings.seo_description) meta.setAttribute("content", settings.seo_description);
  }, [settings]);

  return { settings, loading };
};
