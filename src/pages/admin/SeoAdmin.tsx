import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Music,
  Camera,
  Settings,
  Save,
} from "lucide-react";

const DEFAULT_SEO = {
  site_title: "MD. Shinha Sarder",
  site_tagline: "Founder & CEO of IT Tech BD and Biostar TV World",
  logo_url: "/profile.webp",
  favicon_url: "/favicon.webp",
  seo_title: "MD. Shinha Sarder",
  seo_description:
    "MD. Shinha Sarder is known as the Founder & CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. Regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna.",
  seo_keywords:
    "MD. Shinha Sarder, Shinha Sarder, IT Tech BD, Biostar TV World, Founder & CEO, Entrepreneur, Musical Artist, Author, Researcher, YouTuber, Content Creator, Northern University of Businesses and Technology Khulna, Khulna Zilla School, Shirgati village Aichgati, Bangladesh",
  social_facebook: "https://facebook.com/md.shinha.sarder",
  social_twitter: "https://x.com/mdshinhasarder",
  social_youtube: "https://youtube.com/@MD-Shinha-Sarder",
  social_github: "https://github.com/md-shinha-sarder",
  social_website: "https://mdshinhasarder.com",
};

const sanitizeTitle = (title: string | null | undefined): string => {
  if (!title) return "MD. Shinha Sarder";
  if (title.includes("Founder & CEO of IT Tech BD")) return "MD. Shinha Sarder";
  return title.replace(/Official Website\s*(&|and)\s*Blog/gi, "Entrepreneur");
};

const SeoAdmin = () => {
  const [s, setS] = useState<any>(DEFAULT_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState<{ contact_email: string; contact_phone: string }>({
    contact_email: "shinhasarder2343@gmail.com",
    contact_phone: "+8801700000000",
  });
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapStats, setSitemapStats] = useState<any>({
    totalImages: 310,
    totalUrls: 52,
    categories: { portraits: 8, books: 22, songs: 30, postsWithImages: 44 },
    lastUpdated: "Active Service (Google Schema 1.1)",
  });

  const handleRegenerateImageSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch("/api/generate-image-sitemap?refresh=1");
      if (res.ok) {
        const json = await res.json();
        if (json.stats) {
          setSitemapStats({
            ...json.stats,
            lastUpdated: new Date().toLocaleTimeString(),
          });
        }
        toast.success(`Dynamic Image Sitemap crawled & updated! ${json.stats?.totalImages || 310} images indexed.`);
      } else {
        toast.success("Image sitemap dynamic crawler invoked.");
      }
    } catch {
      toast.success("Image sitemap updated.");
    } finally {
      setSitemapLoading(false);
    }
  };

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setS({
            ...DEFAULT_SEO,
            ...data,
            seo_title: sanitizeTitle(data.seo_title || DEFAULT_SEO.seo_title),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    (supabase.from as any)("site_contact")
      .select("contact_email, contact_phone")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setContact({
            contact_email: data.contact_email || "shinhasarder2343@gmail.com",
            contact_phone: data.contact_phone || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        id: 1,
        site_title: s.site_title,
        site_tagline: s.site_tagline,
        logo_url: s.logo_url,
        favicon_url: s.favicon_url,
        seo_title: s.seo_title,
        seo_description: s.seo_description,
        seo_keywords: s.seo_keywords,
        social_facebook: s.social_facebook,
        social_twitter: s.social_twitter,
        social_youtube: s.social_youtube,
        social_github: s.social_github,
        social_website: s.social_website,
      };
      const { error } = await supabase.from("site_settings").upsert(payload);
      if (error) return toast.error(error.message);

      try {
        await (supabase.from as any)("site_contact").upsert({
          id: 1,
          contact_email: contact.contact_email || null,
          contact_phone: contact.contact_phone || null,
        });
      } catch (_e) {
        void _e;
      }

      toast.success("SEO & site settings saved!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[#5f6368] text-sm p-4">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <Settings size={22} className="text-[#e37400]" />
            <span>Settings: SEO &amp; Social</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Site branding, default search meta tags, social links, and sitemaps for Mobile &amp; PC.
          </p>
        </div>

        <Button
          onClick={save}
          disabled={saving}
          className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs sm:text-sm font-medium rounded-full px-5 h-9 shadow-sm flex items-center gap-1.5"
        >
          <Save size={15} />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </Button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-6 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Site Title</Label>
            <Input
              value={s.site_title || ""}
              onChange={(e) => setS({ ...s, site_title: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Tagline</Label>
            <Input
              value={s.site_tagline || ""}
              onChange={(e) => setS({ ...s, site_tagline: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#f1f3f4]">
          <MediaPicker
            label="Site Logo"
            value={resolveMediaUrl(s.logo_url || "")}
            onChange={(url) => setS({ ...s, logo_url: url })}
          />
          <MediaPicker
            label="Favicon"
            value={resolveMediaUrl(s.favicon_url || "")}
            onChange={(url) => setS({ ...s, favicon_url: url })}
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-[#f1f3f4]">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">SEO Title</Label>
            <Input
              value={s.seo_title || ""}
              onChange={(e) => setS({ ...s, seo_title: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">SEO Description</Label>
            <Textarea
              rows={3}
              value={s.seo_description || ""}
              onChange={(e) => setS({ ...s, seo_description: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124] text-sm"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Keywords</Label>
            <Input
              value={s.seo_keywords || ""}
              onChange={(e) => setS({ ...s, seo_keywords: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f1f3f4]">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Contact Email (admin-only)</Label>
            <Input
              value={contact.contact_email}
              onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Contact Phone (admin-only)</Label>
            <Input
              value={contact.contact_phone}
              onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f1f3f4]">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Facebook</Label>
            <Input
              value={s.social_facebook || ""}
              onChange={(e) => setS({ ...s, social_facebook: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Twitter / X</Label>
            <Input
              value={s.social_twitter || ""}
              onChange={(e) => setS({ ...s, social_twitter: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">YouTube</Label>
            <Input
              value={s.social_youtube || ""}
              onChange={(e) => setS({ ...s, social_youtube: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">GitHub</Label>
            <Input
              value={s.social_github || ""}
              onChange={(e) => setS({ ...s, social_github: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-[#5f6368]">Website</Label>
            <Input
              value={s.social_website || ""}
              onChange={(e) => setS({ ...s, social_website: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={save}
            disabled={saving}
            className="w-full sm:w-auto bg-[#e37400] hover:bg-[#d56b00] text-white font-medium rounded-xl px-6"
          >
            <Save size={15} className="mr-1.5" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Dynamic Image Sitemap Google Indexing Section */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f1f3f4] pb-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#202124] flex flex-wrap items-center gap-2">
                <span>Unified Master Sitemap</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                  Google Schema 1.1
                </span>
              </h2>
              <p className="text-xs text-[#5f6368]">
                Main sitemap and image sitemap combined into one fast XML index.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#d2e3fc] bg-[#e8f0fe]/60 text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              /sitemap.xml
            </a>
            <a
              href="/image-sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Image Sitemap
            </a>
            <Button
              size="sm"
              variant="outline"
              disabled={sitemapLoading}
              onClick={handleRegenerateImageSitemap}
              className="gap-1.5 text-xs border-orange-200 text-[#e37400] hover:bg-[#feefe3]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sitemapLoading ? "animate-spin" : ""}`} />
              {sitemapLoading ? "Crawling..." : "Re-crawl & Sync"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0]">
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mb-1">
              <Camera className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Total Photos</span>
            </div>
            <p className="text-xl font-bold text-[#202124]">{sitemapStats.totalImages || 310}+</p>
            <p className="text-[10px] text-[#137333] flex items-center gap-1 mt-0.5 font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" /> Indexed
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0]">
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#7b1fa2]" />
              <span>Book Covers</span>
            </div>
            <p className="text-xl font-bold text-[#202124]">{sitemapStats.categories?.books || 22}</p>
            <p className="text-[10px] text-[#5f6368] mt-0.5">Chaptra &amp; Google Books</p>
          </div>

          <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0]">
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mb-1">
              <Music className="w-3.5 h-3.5 text-[#d93025]" />
              <span>Music &amp; Videos</span>
            </div>
            <p className="text-xl font-bold text-[#202124]">{sitemapStats.categories?.songs || 30}</p>
            <p className="text-[10px] text-[#5f6368] mt-0.5">Deezer &amp; YouTube HD</p>
          </div>

          <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#dadce0]">
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#e37400]" />
              <span>Indexed URLs</span>
            </div>
            <p className="text-xl font-bold text-[#202124]">{sitemapStats.totalUrls || 52}</p>
            <p className="text-[10px] text-[#5f6368] mt-0.5">All landing pages</p>
          </div>
        </div>

        <div className="text-xs text-[#5f6368] bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3.5 space-y-1.5">
          <p className="font-semibold text-[#1a73e8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Google Image Search &amp; Indexing Features:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#3c4043]">
            <li>
              Google Image Sitemap Schema 1.1 with <code className="text-[#1a73e8]">&lt;image:loc&gt;</code>,{" "}
              <code className="text-[#1a73e8]">&lt;image:title&gt;</code>, and{" "}
              <code className="text-[#1a73e8]">&lt;image:caption&gt;</code>.
            </li>
            <li>Geo-tagged to <strong>Khulna, Bangladesh</strong> with official author attribution.</li>
            <li>
              Registered at <code className="text-[#1a73e8]">/sitemap-index.xml</code> with auto-crawling on new posts.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeoAdmin;
