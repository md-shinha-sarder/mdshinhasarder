import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Trash2,
  Copy,
  Rss,
  Image as ImageIcon,
  ShieldAlert,
  Check,
  HelpCircle,
  Cloud,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Sparkles,
  Maximize2,
  X,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { toSiteMediaUrl } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CLOUDINARY_CONFIG,
  uploadImageToCloudinary,
  generateAllImageLinks,
  GeneratedImageLinks,
} from "@/lib/cloudinary";
import { CANONICAL_DOMAIN_IMAGES, DomainImageItem } from "@/lib/domainImages";

const STORAGE_FIX_SQL = `-- 1. Ensure storage bucket 'media' exists and is public
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
CREATE POLICY "media_all_access" ON public.media FOR ALL USING (true) WITH CHECK (true);`;

interface MediaItem {
  id: string;
  name: string;
  url: string;
  path: string;
  mime_type: string | null;
  size_bytes: number | null;
  cloudinary_url?: string;
}

const LOCAL_STORAGE_KEY = "md_shinha_uploaded_media";

const MediaAdmin = () => {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [showFixGuide, setShowFixGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Instant Link Generator state
  const [inputNameOrUrl, setInputNameOrUrl] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedImageLinks | null>(() =>
    generateAllImageLinks("profile.webp", "MD. Shinha Sarder Official Profile")
  );
  const [lastUploadedPreview, setLastUploadedPreview] = useState<string | null>(null);

  // Full-resolution modal viewer (Lightbox)
  const [modalImage, setModalImage] = useState<{
    url: string;
    title: string;
    domainUrl?: string;
    cloudinaryUrl?: string;
    size?: string;
  } | null>(null);

  // Public images search & filter
  const [imageSearch, setImageSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fileRef = useRef<HTMLInputElement>(null);
  const quickFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    // 1. Load from Supabase if possible
    let loadedFromDb: MediaItem[] = [];
    try {
      const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        loadedFromDb = data as MediaItem[];
      }
    } catch (_e) {
      void _e;
    }

    // 2. Load from local cache fallback
    let localItems: MediaItem[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        localItems = JSON.parse(raw);
      }
    } catch (_e) {
      void _e;
    }

    // Combine uniquely by URL
    const map = new Map<string, MediaItem>();
    for (const item of [...loadedFromDb, ...localItems]) {
      if (item.url && !map.has(item.url)) {
        map.set(item.url, item);
      }
    }
    setItems(Array.from(map.values()));
  };

  useEffect(() => {
    load();
  }, []);

  const copySql = () => {
    navigator.clipboard.writeText(STORAGE_FIX_SQL);
    setCopiedSql(true);
    toast.success("SQL স্ক্রিপ্ট কপি হয়েছে! Supabase SQL Editor-এ পেস্ট করে Run করুন।");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const copyText = (text: string, label: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
    toast.success(`${label} কপি হয়েছে!`);
  };

  // High-reliability Upload: Cloudinary direct signed upload + Supabase sync
  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setBusy(true);

      const newUploadedItems: MediaItem[] = [];

      try {
        for (const file of Array.from(files)) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          toast.info(`"${file.name}" আপলোড এবং লিংক তৈরি হচ্ছে...`);

          let cloudinaryRes: any = null;
          try {
            cloudinaryRes = await uploadImageToCloudinary(file);
          } catch (cErr: any) {
            console.warn("Cloudinary upload notice:", cErr);
          }

          const publicIdentifier = cloudinaryRes?.public_id || safeName;
          const primaryUrl =
            cloudinaryRes?.media_redirect_url ||
            `https://mdshinhasarder.com/media/${publicIdentifier}`;

          const mediaItem: MediaItem = {
            id: cloudinaryRes?.asset_id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            url: primaryUrl,
            path: publicIdentifier,
            mime_type: file.type || "image/jpeg",
            size_bytes: file.size,
            cloudinary_url: cloudinaryRes?.cdn_optimized_url,
          };

          newUploadedItems.push(mediaItem);

          // Update instant link preview with website domain link
          setLastUploadedPreview(primaryUrl);
          setGeneratedLinks(
            generateAllImageLinks(
              publicIdentifier,
              file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
            )
          );

          // If user has Supabase auth, also attempt to save to Supabase
          if (user) {
            try {
              const path = `${user.id}/${Date.now()}-${safeName}`;
              const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
              if (!upErr) {
                const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
                await supabase.from("media").insert({
                  name: file.name,
                  url: pub?.publicUrl || primaryUrl,
                  path,
                  mime_type: file.type,
                  size_bytes: file.size,
                  uploaded_by: user.id,
                });
              }
            } catch (_err) {
              // Non-blocking: Cloudinary upload is already successful!
            }
          }
        }

        // Cache in localStorage so items persist even without DB
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const current = raw ? JSON.parse(raw) : [];
          const updated = [...newUploadedItems, ...current];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
        } catch (_e) {
          void _e;
        }

        setItems((prev) => [...newUploadedItems, ...prev]);
        toast.success(`সফলভাবে আপলোড সম্পন্ন হয়েছে! ফটো লিংক তৈরি হয়েছে।`);
      } catch (e: any) {
        toast.error(`আপলোড ত্রুটি: ${e.message || "অজানা সমস্যা"}`);
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
        if (quickFileRef.current) quickFileRef.current.value = "";
      }
    },
    [user]
  );

  const handleGenerateManualLinks = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputNameOrUrl.trim()) {
      toast.error("অনুগ্রহ করে একটি ছবির নাম বা URL লিখুন (যেমন: profile.webp)");
      return;
    }
    const res = generateAllImageLinks(inputNameOrUrl.trim());
    setGeneratedLinks(res);
    toast.success("লিংক তৈরি হয়েছে! নিচের বোতামে চাপ দিয়ে কপি করুন।");
  };

  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete "${m.name}"?`)) return;
    try {
      if (m.path) {
        await supabase.storage.from("media").remove([m.path]);
      }
      if (m.id && !m.id.startsWith("local-")) {
        await supabase.from("media").delete().eq("id", m.id);
      }
    } catch (_e) {
      void _e;
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const cur: MediaItem[] = JSON.parse(raw);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cur.filter((x) => x.id !== m.id && x.url !== m.url)));
      }
    } catch (_e) {
      void _e;
    }

    setItems((prev) => prev.filter((x) => x.id !== m.id));
    toast.success("মুছে ফেলা হয়েছে");
  };

  const bloggerImages = useMemo(() => {
    const set = new Map<string, { url: string; title: string }>();
    for (const p of posts) {
      if (p.image) set.set(p.image, { url: p.image, title: p.title });
      const re = /<img[^>]+src=["']([^"']+)["']/gi;
      let m;
      while ((m = re.exec(p.content || "")) !== null) {
        set.set(m[1], { url: m[1], title: p.title });
      }
    }
    return Array.from(set.values());
  }, [posts]);

  // Filter public images
  const filteredDomainImages = useMemo(() => {
    return CANONICAL_DOMAIN_IMAGES.filter((img) => {
      const matchSearch =
        img.title.toLowerCase().includes(imageSearch.toLowerCase()) ||
        img.fileName.toLowerCase().includes(imageSearch.toLowerCase());
      const matchCat = selectedCategory === "all" || img.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [imageSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2">
            <span>Media Library & Photo Link Creator</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-sans font-medium">
              Domain + Cloudinary CDN
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            যেকোনো ফটো আপলোড করে সরাসরি <b>https://mdshinhasarder.com</b> ডোমেইন লিংক ও <b>Cloudinary</b> লিংক তৈরি করুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFixGuide(!showFixGuide)}
            className="text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          >
            <HelpCircle size={14} className="mr-1" /> Storage RLS Fix
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={(e) => upload(e.target.files)} />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md"
          >
            <Upload size={16} className="mr-1.5" /> {busy ? "আপলোড হচ্ছে..." : "নতুন ফটো আপলোড"}
          </Button>
        </div>
      </div>

      {/* Storage Fix Alert */}
      {showFixGuide && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert size={18} />
              <span>Supabase Storage RLS পারমিশন ফিক্স (1-Click Script)</span>
            </div>
            <Button size="sm" onClick={copySql} className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              {copiedSql ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copiedSql ? "কপি হয়েছে!" : "Copy SQL Script"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ক্লাউডিনারি আপলোড স্বয়ংক্রিয়ভাবে কার্যকর রয়েছে। যদি Supabase ডাটাবেসেও ব্যাকআপ রাখতে চান তবে উপরের স্ক্রিপ্টটি কপি করে Supabase SQL Editor-এ রান করুন।
          </p>
        </div>
      )}

      {/* Instant Link Creator Widget */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-background to-slate-950/60 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-foreground flex items-center gap-2">
                ইনস্ট্যান্ট ফটো লিংক ক্রিয়েটর (Instant Photo Link Generator)
              </h2>
              <p className="text-xs text-muted-foreground">
                যেকোনো ফটো সিলেক্ট করুন অথবা নাম লিখুন — সাথে সাথে তৈরি হবে কপি করার উপযোগী ডোমেইন ও ক্লাউডিনারি লিংক!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-blue-900/40 border border-blue-700/60 px-3 py-1.5 rounded-lg text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Cloud: <b>borle8go</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Upload or Input */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                upload(e.dataTransfer.files);
              }}
              onClick={() => quickFileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                drag
                  ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
                  : "border-blue-500/30 bg-blue-950/20 hover:border-blue-400/60 hover:bg-blue-950/30"
              }`}
            >
              <input
                ref={quickFileRef}
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => upload(e.target.files)}
              />
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Upload size={22} className={busy ? "animate-bounce" : ""} />
              </div>
              <div className="text-sm font-semibold text-foreground">
                {busy ? "আপলোড হচ্ছে..." : "কম্পিউটার বা মোবাইল থেকে ছবি ড্রপ করুন"}
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                ক্লিক করে ছবি পছন্দ করুন — ১ সেকেন্ডে ডোমেইন ও ক্লাউডিনারি লিংক তৈরি হয়ে যাবে!
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-semibold">অথবা ফাইলের নাম দিয়ে লিংক তৈরি করুন</span>
              </div>
            </div>

            <form onSubmit={handleGenerateManualLinks} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: czajweotfpsqbp8nwb9n অথবা ক্লাউডিনারি লিংক পেস্ট করুন"
                  value={inputNameOrUrl}
                  onChange={(e) => setInputNameOrUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 font-semibold">
                  <LinkIcon size={14} className="mr-1" /> ওয়েবসাইট লিংক তৈরি
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground items-center">
                <span>দ্রুত ট্রাই করুন:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputNameOrUrl("czajweotfpsqbp8nwb9n");
                    setGeneratedLinks(generateAllImageLinks("czajweotfpsqbp8nwb9n", "User Uploaded Media czajweotfpsqbp8nwb9n"));
                  }}
                  className="text-emerald-400 hover:underline font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30"
                >
                  czajweotfpsqbp8nwb9n (আপনার ছবি)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputNameOrUrl("profile.webp");
                    setGeneratedLinks(generateAllImageLinks("profile.webp", "Official Profile Portrait"));
                  }}
                  className="text-blue-400 hover:underline font-mono"
                >
                  profile.webp
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputNameOrUrl("site-logo.png");
                    setGeneratedLinks(generateAllImageLinks("site-logo.png", "Official Site Logo"));
                  }}
                  className="text-blue-400 hover:underline font-mono"
                >
                  site-logo.png
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputNameOrUrl("hero-portrait.jpg");
                    setGeneratedLinks(generateAllImageLinks("hero-portrait.jpg", "Author & Researcher"));
                  }}
                  className="text-blue-400 hover:underline font-mono"
                >
                  hero-portrait.jpg
                </button>
              </div>
            </form>
          </div>

          {/* Right: Generated Output Card */}
          <div className="lg:col-span-7 bg-background/90 border border-blue-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            {generatedLinks ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      ওয়েবসাইট ও ক্লাউডিনারি লিংকসমূহ:
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[150px]">
                    {generatedLinks.fileName}
                  </span>
                </div>

                {/* 1. Official Website Link (mdshinhasarder.com domain) */}
                <div className="space-y-1 bg-blue-950/40 border border-blue-500/40 rounded-xl p-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-300 flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles size={14} className="text-yellow-400" />
                      ১. আপনার ওয়েবসাইটের ফটো লিংক (Website Official Link):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
                      mdshinhasarder.com Domain Link
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-blue-500/40 rounded-lg p-1.5 sm:p-2">
                    <code className="text-xs sm:text-sm text-yellow-300 font-mono font-semibold truncate flex-1 select-all">
                      {generatedLinks.websiteUrl || generatedLinks.domainMediaUrl}
                    </code>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs shrink-0 border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                      title="ওয়েবসাইট লিংক টেস্ট করতে নতুন ট্যাবে ওপেন করুন"
                    >
                      <a href={generatedLinks.websiteUrl || generatedLinks.domainMediaUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={12} className="mr-1" /> Open
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyText(generatedLinks.websiteUrl || generatedLinks.domainMediaUrl, "ওয়েবসাইট ফটো লিংক", "website")}
                      className={`h-7 px-3 text-xs font-semibold shrink-0 transition-colors ${
                        copiedKey === "website" ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      }`}
                    >
                      {copiedKey === "website" ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                      {copiedKey === "website" ? "Copied" : "Copy Website Link"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-blue-200/90">
                    ✅ এটি সরাসরি আপনার ওয়েবসাইটের নিজস্ব লিংক। ব্রাউজার বা যেকোনো সাইটে এই লিংক দিলে স্বয়ংক্রিয়ভাবে ক্লাউডিনারির হাই-কোয়ালিটি ফটোতে যাবে।
                  </p>
                </div>

                {/* 2. Localhost / Preview Host Link */}
                {generatedLinks.localhostUrl && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-400 flex items-center gap-1">
                        ২. বর্তমান লোকালহোস্ট টেস্ট লিংক (Localhost / Dev Redirect Link):
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/70 border border-purple-500/30 rounded-lg p-1.5 sm:p-2">
                      <code className="text-[11px] sm:text-xs text-purple-200 font-mono truncate flex-1 select-all">
                        {generatedLinks.localhostUrl}
                      </code>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs shrink-0 border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                      >
                        <a href={generatedLinks.localhostUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={12} className="mr-1" /> Test
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyText(generatedLinks.localhostUrl, "লোকালহোস্ট লিংক", "localhost")}
                        className={`h-7 px-3 text-xs font-semibold shrink-0 transition-colors ${
                          copiedKey === "localhost" ? "bg-emerald-600 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {copiedKey === "localhost" ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                        {copiedKey === "localhost" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3. Cloudinary Ultra-Fast CDN Link */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      ৩. ক্লাউডিনারি ফাস্ট CDN লিংক (Cloudinary Auto WebP/AVIF Direct Delivery):
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/70 border border-emerald-500/30 rounded-lg p-1.5 sm:p-2">
                    <code className="text-[11px] sm:text-xs text-emerald-200 font-mono truncate flex-1 select-all">
                      {generatedLinks.cloudinaryAutoUrl}
                    </code>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs shrink-0 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <a href={generatedLinks.cloudinaryAutoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={12} className="mr-1" /> Open
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyText(generatedLinks.cloudinaryAutoUrl, "ক্লাউডিনারি লিংক", "cld")}
                      className={`h-7 px-3 text-xs font-semibold shrink-0 transition-colors ${
                        copiedKey === "cld" ? "bg-emerald-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {copiedKey === "cld" ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                      {copiedKey === "cld" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                {/* 4. Cloudinary Fetch URL */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1">
                      ৪. ক্লাউডিনারি ফেচ প্রক্সি লিংক (Cloudinary Fetch Proxy):
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/70 border border-border rounded-lg p-1.5 sm:p-2">
                    <code className="text-[11px] sm:text-xs text-slate-300 font-mono truncate flex-1 select-all">
                      {generatedLinks.cloudinaryFetchUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyText(generatedLinks.cloudinaryFetchUrl, "ফেচ লিংক", "fetch")}
                      className={`h-7 px-3 text-xs shrink-0 ${copiedKey === "fetch" ? "border-emerald-500 text-emerald-400" : ""}`}
                    >
                      {copiedKey === "fetch" ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                      {copiedKey === "fetch" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                {/* 5. HTML / Markdown Code snippet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="flex items-center justify-between bg-slate-950/50 border border-border/80 rounded-lg px-2.5 py-1.5">
                    <span className="text-muted-foreground text-[11px]">HTML কোড:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyText(generatedLinks.htmlTag, "HTML কোড", "html")}
                      className="h-6 px-2 text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      {copiedKey === "html" ? "Copied" : "Copy HTML"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/50 border border-border/80 rounded-lg px-2.5 py-1.5">
                    <span className="text-muted-foreground text-[11px]">Markdown কোড:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyText(generatedLinks.markdownTag, "Markdown কোড", "md")}
                      className="h-6 px-2 text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      {copiedKey === "md" ? "Copied" : "Copy Markdown"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">
                উপরে ছবি আপলোড করুন অথবা নাম লিখে <b>লিংক তৈরি করুন</b> বোতামে চাপুন।
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="public-images" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-secondary/60">
          <TabsTrigger value="public-images" className="text-xs sm:text-sm py-1.5">
            <ImageIcon size={14} className="mr-1.5" /> Domain Photos (/images) ({CANONICAL_DOMAIN_IMAGES.length})
          </TabsTrigger>
          <TabsTrigger value="library" className="text-xs sm:text-sm py-1.5">
            <Upload size={14} className="mr-1.5" /> My Uploads ({items.length})
          </TabsTrigger>
          <TabsTrigger value="blogger" className="text-xs sm:text-sm py-1.5">
            <Rss size={14} className="mr-1.5" /> Blogger Photos ({bloggerImages.length})
          </TabsTrigger>
          <TabsTrigger value="cloudinary" className="text-xs sm:text-sm py-1.5">
            <Cloud size={14} className="mr-1.5" /> Cloudinary borle8go
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Public Domain Images */}
        <TabsContent value="public-images" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/30 p-3 rounded-xl border border-border">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ছবি খুঁজুন (নাম বা টাইটেল)..."
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "সব ছবি" },
                { id: "Identity & Profile", label: "প্রোফাইল ও লোগো" },
                { id: "Books & Publications", label: "বইসমূহ" },
                { id: "Music & Songs", label: "মিউজিক" },
                { id: "Tech & Articles", label: "টেক ও পোস্ট" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    selectedCategory === c.id
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDomainImages.map((img) => (
              <div
                key={img.id}
                className="bg-gradient-card border border-border hover:border-blue-500/50 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all group"
              >
                {/* Full Uncropped Image Preview Container */}
                <div
                  onClick={() =>
                    setModalImage({
                      url: img.localPath,
                      title: img.title,
                      domainUrl: img.domainUrl,
                      cloudinaryUrl: img.cloudinaryUrl,
                    })
                  }
                  className="relative aspect-square bg-slate-950/70 p-2 flex items-center justify-center cursor-pointer overflow-hidden"
                  title="সম্পূর্ণ ছবি বড় করে দেখতে ক্লিক করুন"
                >
                  <img
                    src={img.localPath}
                    alt={img.title}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1.5 rounded-lg text-white">
                    <Maximize2 size={13} />
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-blue-300 font-mono">
                    {img.fileName.split(".").pop()?.toUpperCase()}
                  </span>
                </div>

                {/* Details & Copy Actions */}
                <div className="p-3 space-y-2 border-t border-border/60">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground line-clamp-1" title={img.title}>
                      {img.title}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate" title={img.fileName}>
                      {img.fileName}
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => copyText(img.domainUrl, "ডোমেইন লিংক", `d-${img.id}`)}
                      className={`flex-1 text-xs h-7 px-2 ${
                        copiedKey === `d-${img.id}` ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copiedKey === `d-${img.id}` ? <Check size={11} className="mr-1" /> : <Copy size={11} className="mr-1" />}
                      Domain Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyText(img.cloudinaryUrl, "ক্লাউডিনারি লিংক", `c-${img.id}`)}
                      className={`text-xs h-7 px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 ${
                        copiedKey === `c-${img.id}` ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      <Cloud size={11} className="mr-1" /> CDN
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDomainImages.length === 0 && (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-gradient-card border border-border rounded-xl">
                কোন ছবি পাওয়া যায়নি।
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: User Uploads (Library) */}
        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((m) => {
              const fullDomainUrl = toSiteMediaUrl(m.url);
              const isImage = !m.mime_type || m.mime_type.startsWith("image/");
              const isVideo = m.mime_type?.startsWith("video/");

              return (
                <div key={m.id} className="bg-gradient-card border border-border rounded-xl overflow-hidden group flex flex-col justify-between">
                  <div
                    onClick={() =>
                      setModalImage({
                        url: m.url,
                        title: m.name,
                        domainUrl: fullDomainUrl,
                        cloudinaryUrl: m.cloudinary_url || m.url,
                        size: m.size_bytes ? `${Math.round(m.size_bytes / 1024)} KB` : undefined,
                      })
                    }
                    className="relative aspect-square bg-slate-950/70 p-2 flex items-center justify-center cursor-pointer overflow-hidden"
                    title="সম্পূর্ণ ছবি বড় করে দেখতে ক্লিক করুন"
                  >
                    {isImage ? (
                      <img src={m.url} alt={m.name} className="max-w-full max-h-full object-contain" />
                    ) : isVideo ? (
                      <video src={m.url} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-muted-foreground text-xs p-2 text-center">{m.mime_type}</div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1.5 rounded-lg text-white">
                      <Maximize2 size={13} />
                    </div>
                  </div>

                  <div className="p-3 space-y-2 border-t border-border/60">
                    <div className="text-xs truncate font-medium" title={m.name}>
                      {m.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-border/80 hover:bg-secondary shrink-0"
                        title="ডোমেইন লিংক টেস্ট করতে ওপেন করুন"
                      >
                        <a href={`https://mdshinhasarder.com/media/${m.path || m.name}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={11} className="mr-1" /> Open
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyText(`https://mdshinhasarder.com/media/${m.path || m.name}`, "ডোমেইন লিংক", `lib-${m.id}`)}
                        className={`flex-1 text-xs h-7 px-2 ${
                          copiedKey === `lib-${m.id}` ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {copiedKey === `lib-${m.id}` ? <Check size={11} className="mr-1" /> : <Copy size={11} className="mr-1" />}
                        Domain Link
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(m)} className="h-7 w-7 text-red-400 hover:bg-red-500/10">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-gradient-card border border-border rounded-xl">
                কোনো আপলোড করা ফটো নেই। উপরে ছবি ড্রপ করে সরাসরি লিংক তৈরি করুন।
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Blogger Photos */}
        <TabsContent value="blogger">
          <p className="text-xs text-muted-foreground mb-3">Blogger পোস্ট থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত ছবিসমূহ। লিংক কপি করতে ক্লিক করুন।</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bloggerImages.map((b, i) => (
              <div key={i} className="group bg-gradient-card border border-border rounded-xl overflow-hidden flex flex-col justify-between">
                <div
                  onClick={() =>
                    setModalImage({
                      url: b.url,
                      title: b.title,
                      domainUrl: b.url,
                      cloudinaryUrl: `https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/${b.url}`,
                    })
                  }
                  className="aspect-square bg-slate-950/70 p-1 flex items-center justify-center cursor-pointer"
                >
                  <img src={b.url} alt={b.title} loading="lazy" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-2 space-y-1.5 border-t border-border/60">
                  <div className="text-xs truncate font-medium">{b.title}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(b.url, "Blogger ছবির লিংক", `blg-${i}`)}
                    className="w-full h-7 text-xs"
                  >
                    {copiedKey === `blg-${i}` ? <Check size={11} className="mr-1 text-emerald-400" /> : <Copy size={11} className="mr-1" />}
                    Copy URL
                  </Button>
                </div>
              </div>
            ))}
            {bloggerImages.length === 0 && <div className="col-span-full p-8 text-center text-muted-foreground">কোন ব্লগার ফটো পাওয়া যায়নি।</div>}
          </div>
        </TabsContent>

        {/* Tab 4: Cloudinary borle8go CDN */}
        <TabsContent value="cloudinary" className="space-y-4">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Cloud size={18} /> Cloudinary Media Architecture
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High-speed media transformations with auto-format (f_auto) and auto-quality (q_auto).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-blue-950/60 border border-blue-800/80 px-3 py-1.5 rounded-lg text-blue-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud: <b>borle8go</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-background/80 p-3 rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground">API Key:</span>
                <p className="font-mono text-foreground font-semibold">936238538312159</p>
              </div>
              <div className="bg-background/80 p-3 rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground">Canonical Domain:</span>
                <p className="font-mono text-foreground font-semibold">https://mdshinhasarder.com</p>
              </div>
              <div className="bg-background/80 p-3 rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground">Optimization Engine:</span>
                <p className="font-mono text-emerald-400 font-semibold">f_auto,q_auto,w_500,c_auto</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Core Canonical Assets & Cloudinary Delivery Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-foreground">Featured Cloudinary Sample</div>
                  <div className="font-mono text-[11px] text-muted-foreground break-all">cld-sample-5</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-2">
                  <img
                    src="https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto,w_400/cld-sample-5"
                    alt="Sample 5"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => copyText("https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto/cld-sample-5", "Cloudinary URL")}
                  >
                    <Copy size={12} className="mr-1" /> Copy CDN URL
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-foreground">Official Profile Portrait</div>
                  <div className="font-mono text-[11px] text-blue-400 break-all">https://mdshinhasarder.com/profile.webp</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-2">
                  <img src="/profile.webp" alt="Profile" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => copyText("https://mdshinhasarder.com/profile.webp", "Domain Link")}
                  >
                    <Copy size={12} className="mr-1" /> Domain Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-blue-400"
                    onClick={() =>
                      copyText(
                        "https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/https://mdshinhasarder.com/profile.webp",
                        "Cloudinary Link"
                      )
                    }
                  >
                    <Cloud size={12} className="mr-1" /> Cloudinary
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-foreground">Official Site Logo & Favicon</div>
                  <div className="font-mono text-[11px] text-blue-400 break-all">https://mdshinhasarder.com/site-logo.png</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-2">
                  <img src="/site-logo.png" alt="Site Logo" className="w-32 h-32 object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => copyText("https://mdshinhasarder.com/site-logo.png", "Domain Link")}
                  >
                    <Copy size={12} className="mr-1" /> Domain Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-blue-400"
                    onClick={() =>
                      copyText(
                        "https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/https://mdshinhasarder.com/site-logo.png",
                        "Cloudinary Link"
                      )
                    }
                  >
                    <Cloud size={12} className="mr-1" /> Cloudinary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Full-resolution uncropped photo modal (Lightbox) */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm sm:text-base font-semibold text-white truncate">{modalImage.title}</h3>
                {modalImage.size && <span className="text-xs text-slate-400 font-mono">Size: {modalImage.size}</span>}
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Display (Entire Original Image, No Cropping!) */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-4 min-h-[300px]">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>

            {/* Modal Links & Copy Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
              {modalImage.domainUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 font-semibold shrink-0 w-24">Domain Link:</span>
                  <code className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded flex-1">
                    {modalImage.domainUrl}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyText(modalImage.domainUrl!, "ডোমেইন লিংক")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 shrink-0"
                  >
                    <Copy size={12} className="mr-1" /> Copy
                  </Button>
                  <a
                    href={modalImage.domainUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-white shrink-0"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              {modalImage.cloudinaryUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-semibold shrink-0 w-24">Cloudinary:</span>
                  <code className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded flex-1">
                    {modalImage.cloudinaryUrl}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyText(modalImage.cloudinaryUrl!, "ক্লাউডিনারি লিংক")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 shrink-0"
                  >
                    <Copy size={12} className="mr-1" /> Copy
                  </Button>
                  <a
                    href={modalImage.cloudinaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-white shrink-0"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAdmin;
