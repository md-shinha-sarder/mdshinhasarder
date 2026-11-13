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
  Search,
  ExternalLink,
  Maximize2,
  X,
  FolderSync,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { resolveMediaUrl, handleUploadedImageError } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoUploadBox, UploadResult } from "@/components/admin/PhotoUploadBox";
import { uploadImageToCloudinary, registerMediaInRegistry } from "@/lib/cloudinary";
import { CANONICAL_DOMAIN_IMAGES } from "@/lib/domainImages";
import { syncAllPhotosToImagesFolder, clearAllSyncData } from "@/lib/syncAllPhotos";

const STORAGE_FIX_SQL = `-- 1. Ensure storage bucket 'media' exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clean up old restrictive policies on storage.objects
DROP POLICY IF EXISTS "Allow all for media" ON storage.objects;
CREATE POLICY "Allow all for media" ON storage.objects
FOR ALL
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 3. Ensure public.media database table has full access
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
  previewDataUrl?: string;
}

const LOCAL_STORAGE_KEY = "md_shinha_uploaded_media";

const MediaAdmin = () => {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("library");
  const [busy, setBusy] = useState(false);
  const [syncingPhotos, setSyncingPhotos] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showFixGuide, setShowFixGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [modalImage, setModalImage] = useState<{
    url: string;
    title: string;
    domainUrl?: string;
    cloudinaryUrl?: string;
    size?: string;
  } | null>(null);

  const [imageSearch, setImageSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    let loadedFromDb: MediaItem[] = [];
    try {
      const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        loadedFromDb = data as MediaItem[];
      }
    } catch (_e) {
      void _e;
    }

    let localItems: MediaItem[] = [];
    try {
      const raw1 = localStorage.getItem(LOCAL_STORAGE_KEY);
      const raw2 = localStorage.getItem("shinha_media_items");
      const list1 = raw1 ? JSON.parse(raw1) : [];
      const list2 = raw2 ? JSON.parse(raw2) : [];
      localItems = [...list2, ...list1];
    } catch (_e) {
      void _e;
    }

    const map = new Map<string, MediaItem>();
    for (const item of [...localItems, ...loadedFromDb]) {
      if (item.url && !map.has(item.url)) {
        map.set(item.url, item);
      }
    }
    setItems(Array.from(map.values()));
  };

  useEffect(() => {
    load();
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Clear All: Purge local photo cache, remove broken mappings, and restore clean Blogger photos?")) {
      return;
    }
    setClearing(true);
    try {
      await clearAllSyncData();
      await load();
      toast.success("Successfully cleared all cache and restored clean Blogger photos!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear cache");
    } finally {
      setClearing(false);
    }
  };

  const handleSyncAllPhotos = async () => {
    setSyncingPhotos(true);
    try {
      const res = await syncAllPhotosToImagesFolder();
      toast.success(`Synced ${res.totalFound} photos to /images folder!`);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to sync photos");
    } finally {
      setSyncingPhotos(false);
    }
  };

  const handleUploadSuccess = (res: UploadResult) => {
    const newItem: MediaItem = {
      id: `upload-${Date.now()}`,
      name: res.filename,
      url: res.domainUrl,
      path: res.filename,
      mime_type: "image/jpeg",
      size_bytes: null,
      cloudinary_url: res.cdnUrl,
      previewDataUrl: res.previewDataUrl,
    };
    setItems((prev) => [newItem, ...prev.filter((x) => x.url !== newItem.url)]);
    setSelectedTab("library");
  };

  const copySql = () => {
    navigator.clipboard.writeText(STORAGE_FIX_SQL);
    setCopiedSql(true);
    toast.success("SQL script copied! Paste into Supabase SQL Editor and run.");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const copyText = (text: string, label: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
    toast.success(`${label} copied!`);
  };

  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setBusy(true);

      const newUploadedItems: MediaItem[] = [];

      try {
        for (const file of Array.from(files)) {
          const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
          const baseName =
            file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase() || "photo";
          const uniqueSlug = `${baseName}-${Date.now().toString(36).slice(-4)}`;
          const uniqueFileName = `${uniqueSlug}.${rawExt}`;
          const domainUrl = `https://mdshinhasarder.com/images/${uniqueFileName}`;

          toast.info(`Uploading "${file.name}"...`);

          const dataUrl = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => resolve("");
            r.readAsDataURL(file);
          });

          if (dataUrl) {
            try {
              await fetch("/api/save-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileName: uniqueFileName,
                  dataUrl,
                  publicId: uniqueSlug,
                }),
              });
            } catch (_saveErr) {
              console.warn("Local save notice:", _saveErr);
            }
          }

          let cloudinaryRes: any = null;
          try {
            cloudinaryRes = await uploadImageToCloudinary(file, uniqueSlug);
          } catch (cErr: any) {
            console.warn("Cloudinary upload notice:", cErr);
          }

          const mediaItem: MediaItem = {
            id: cloudinaryRes?.asset_id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            url: domainUrl,
            path: uniqueFileName,
            mime_type: file.type || "image/jpeg",
            size_bytes: file.size,
            cloudinary_url: cloudinaryRes?.cdn_optimized_url || cloudinaryRes?.secure_url,
            previewDataUrl: dataUrl && dataUrl.length < 350000 ? dataUrl : undefined,
          };

          newUploadedItems.push(mediaItem);

          registerMediaInRegistry({
            slug: uniqueFileName,
            publicId: uniqueSlug,
            cloudinaryUrl: mediaItem.cloudinary_url || domainUrl,
            domainUrl,
            name: file.name,
          });

          if (user) {
            try {
              const path = `${user.id}/${Date.now()}-${uniqueFileName}`;
              const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
              if (!upErr) {
                const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
                await supabase.from("media").insert({
                  name: file.name,
                  url: pub?.publicUrl || domainUrl,
                  path,
                  mime_type: file.type,
                  size_bytes: file.size,
                  uploaded_by: user.id,
                });
              }
            } catch (_err) {
              // Non-blocking
            }
          }
        }

        try {
          const raw1 = localStorage.getItem(LOCAL_STORAGE_KEY);
          const cur1 = raw1 ? JSON.parse(raw1) : [];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...newUploadedItems, ...cur1].slice(0, 50)));

          const raw2 = localStorage.getItem("shinha_media_items");
          const cur2 = raw2 ? JSON.parse(raw2) : [];
          localStorage.setItem("shinha_media_items", JSON.stringify([...newUploadedItems, ...cur2].slice(0, 60)));
        } catch (_e) {
          void _e;
        }

        setItems((prev) => [...newUploadedItems, ...prev]);
        setSelectedTab("library");
        toast.success(`Upload completed! Only your uploaded photo is shown.`);
      } catch (e: any) {
        toast.error(`Upload error: ${e.message || "Unknown error"}`);
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [user]
  );

  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete "${m.name}"?`)) return;
    try {
      if (m.path) {
        await supabase.storage.from("media").remove([m.path]);
      }
      if (m.id && !m.id.startsWith("local-") && !m.id.startsWith("upload-")) {
        await supabase.from("media").delete().eq("id", m.id);
      }
    } catch (_e) {
      void _e;
    }

    try {
      for (const key of [LOCAL_STORAGE_KEY, "shinha_media_items"]) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const cur: MediaItem[] = JSON.parse(raw);
          localStorage.setItem(key, JSON.stringify(cur.filter((x) => x.id !== m.id && x.url !== m.url)));
        }
      }
    } catch (_e) {
      void _e;
    }

    setItems((prev) => prev.filter((x) => x.id !== m.id && x.url !== m.url));
    toast.success("Deleted successfully");
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex flex-wrap items-center gap-2">
            <ImageIcon size={22} className="text-[#e37400]" />
            <span>Media Library</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-medium">
              Domain + Cloudinary CDN
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Upload photos to store under <b className="text-[#202124]">/images/</b> and generate clean domain links. Only the exact uploaded photo is displayed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearing}
            className="text-xs border-red-200 text-[#d93025] hover:bg-[#fce8e6] h-8"
          >
            <Trash2 size={14} className={`mr-1.5 ${clearing ? "animate-spin" : ""}`} />
            {clearing ? "Clearing..." : "Clear Cache"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncAllPhotos}
            disabled={syncingPhotos}
            className="text-xs border-[#ceead6] text-[#137333] hover:bg-[#e6f4ea] h-8"
          >
            <FolderSync size={14} className={`mr-1.5 ${syncingPhotos ? "animate-spin" : ""}`} />
            {syncingPhotos ? "Syncing..." : "Sync Photos"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFixGuide(!showFixGuide)}
            className="text-xs border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] h-8"
          >
            <HelpCircle size={14} className="mr-1" /> DB Setup
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={(e) => upload(e.target.files)} />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="bg-[#e37400] hover:bg-[#d56b00] text-white font-medium text-xs sm:text-sm rounded-full px-4 h-8 shadow-sm"
          >
            <Upload size={15} className="mr-1.5" /> {busy ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>

      {/* Storage Fix Alert */}
      {showFixGuide && (
        <div className="rounded-xl border border-[#fde293] bg-[#fef7e0] p-4 space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-[#b06000]">
              <ShieldAlert size={18} />
              <span>Supabase Storage RLS Permissions Fix (1-Click Script)</span>
            </div>
            <Button size="sm" onClick={copySql} className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs h-8">
              {copiedSql ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copiedSql ? "Copied!" : "Copy SQL Script"}
            </Button>
          </div>
          <p className="text-xs text-[#5f6368]">
            Cloudinary upload is active. Run this SQL script in your Supabase SQL Editor if you also sync backups into Supabase Storage.
          </p>
        </div>
      )}

      {/* Direct Photo Upload Box */}
      <PhotoUploadBox
        label="Upload Photo to /images/ Folder"
        description="Whichever photo you upload is saved and displayed here immediately — no other photo will replace it."
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-white border border-[#dadce0] rounded-xl gap-1 w-full sm:w-fit">
          <TabsTrigger
            value="library"
            className="text-xs py-1.5 px-3 font-medium data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025]"
          >
            <Upload size={13} className="mr-1.5" /> Uploaded ({items.length})
          </TabsTrigger>
          <TabsTrigger
            value="public-images"
            className="text-xs py-1.5 px-3 font-medium data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025]"
          >
            <ImageIcon size={13} className="mr-1.5" /> /images ({CANONICAL_DOMAIN_IMAGES.length})
          </TabsTrigger>
          <TabsTrigger
            value="blogger"
            className="text-xs py-1.5 px-3 font-medium data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025]"
          >
            <Rss size={13} className="mr-1.5" /> Blogger ({bloggerImages.length})
          </TabsTrigger>
          <TabsTrigger
            value="cloudinary"
            className="text-xs py-1.5 px-3 font-medium data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025]"
          >
            <Cloud size={13} className="mr-1.5" /> Cloudinary CDN
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Domain Photos (/images) */}
        <TabsContent value="public-images" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#dadce0]">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <input
                type="text"
                placeholder="Search photos (filename or title)..."
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#dadce0] bg-[#f8f9fa] text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Photos" },
                { id: "Identity & Profile", label: "Profile & Logos" },
                { id: "Books & Publications", label: "Books" },
                { id: "Music & Songs", label: "Music" },
                { id: "Tech & Articles", label: "Articles" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedCategory === c.id
                      ? "bg-[#1a73e8] text-white border-[#1a73e8] font-medium"
                      : "bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4]"
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
                className="bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between transition-all group"
              >
                <div
                  onClick={() =>
                    setModalImage({
                      url: img.localPath,
                      title: img.title,
                      domainUrl: img.domainUrl,
                      cloudinaryUrl: img.cloudinaryUrl,
                    })
                  }
                  className="relative aspect-square bg-[#f8f9fa] p-2 flex items-center justify-center cursor-pointer overflow-hidden"
                  title="Click to view full resolution"
                >
                  <img
                    src={img.localPath}
                    alt={img.title}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/90 border border-[#dadce0] p-1.5 rounded-lg text-[#202124] shadow-xs">
                    <Maximize2 size={13} />
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 border border-[#dadce0] px-1.5 py-0.5 rounded text-[#1a73e8] font-mono">
                    {img.fileName.split(".").pop()?.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 space-y-2 border-t border-[#f1f3f4]">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#202124] line-clamp-1" title={img.title}>
                      {img.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#5f6368] truncate" title={img.fileName}>
                      {img.fileName}
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => copyText(img.domainUrl, "Domain Link", `d-${img.id}`)}
                      className={`flex-1 text-xs h-7 px-2 ${
                        copiedKey === `d-${img.id}` ? "bg-[#1e8e3e] text-white" : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                      }`}
                    >
                      {copiedKey === `d-${img.id}` ? <Check size={11} className="mr-1" /> : <Copy size={11} className="mr-1" />}
                      Domain Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyText(img.cloudinaryUrl, "Cloudinary Link", `c-${img.id}`)}
                      className={`text-xs h-7 px-2 text-[#137333] border-[#ceead6] hover:bg-[#e6f4ea] ${
                        copiedKey === `c-${img.id}` ? "bg-[#1e8e3e] text-white" : ""
                      }`}
                    >
                      <Cloud size={11} className="mr-1" /> CDN
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDomainImages.length === 0 && (
              <div className="col-span-full p-8 text-center text-[#5f6368] bg-white border border-[#dadce0] rounded-xl">
                No photos found matching your search.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: User Uploads (Library) — displays ONLY the uploaded photo */}
        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((m) => {
              const fileName = m.name || m.path || "photo.jpg";
              const cleanFileName = fileName.includes(".") ? fileName : `${fileName}.jpg`;
              const fullDomainUrl =
                m.url.startsWith("http") && m.url.includes("/images/")
                  ? m.url
                  : `https://mdshinhasarder.com/images/${cleanFileName}`;
              const localSrc = m.previewDataUrl || m.cloudinary_url || resolveMediaUrl(m.url);
              const isImage = !m.mime_type || m.mime_type.startsWith("image/");
              const isVideo = m.mime_type?.startsWith("video/");

              return (
                <div
                  key={m.id}
                  className="bg-white border border-[#dadce0] rounded-xl overflow-hidden group flex flex-col justify-between shadow-xs"
                >
                  <div
                    onClick={() =>
                      setModalImage({
                        url: localSrc,
                        title: m.name,
                        domainUrl: fullDomainUrl,
                        cloudinaryUrl: m.cloudinary_url || m.url,
                        size: m.size_bytes ? `${Math.round(m.size_bytes / 1024)} KB` : undefined,
                      })
                    }
                    className="relative aspect-square bg-[#f8f9fa] p-2 flex items-center justify-center cursor-pointer overflow-hidden"
                    title="Click to view full resolution"
                  >
                    {isImage ? (
                      <img
                        src={localSrc}
                        alt={m.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => handleUploadedImageError(e.currentTarget, m.url)}
                      />
                    ) : isVideo ? (
                      <video src={localSrc} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-[#5f6368] text-xs p-2 text-center">{m.mime_type}</div>
                    )}
                    <div className="absolute top-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/90 border border-[#dadce0] p-1.5 rounded-lg text-[#202124] shadow-xs">
                      <Maximize2 size={13} />
                    </div>
                  </div>

                  <div className="p-3 space-y-2 border-t border-[#f1f3f4]">
                    <div className="text-xs truncate font-semibold text-[#202124]" title={m.name}>
                      {m.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#1a73e8] truncate" title={fullDomainUrl}>
                      {fullDomainUrl}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] shrink-0"
                        title="Open photo"
                      >
                        <a href={localSrc} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={11} className="mr-1" /> Open
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyText(fullDomainUrl, "Domain Link", `lib-${m.id}`)}
                        className={`flex-1 text-xs h-7 px-2 ${
                          copiedKey === `lib-${m.id}` ? "bg-[#1e8e3e] text-white" : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                        }`}
                      >
                        {copiedKey === `lib-${m.id}` ? <Check size={11} className="mr-1" /> : <Copy size={11} className="mr-1" />}
                        Copy
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(m)}
                        className="h-7 w-7 text-[#d93025] hover:bg-[#fce8e6]"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="col-span-full p-8 text-center text-[#5f6368] bg-white border border-[#dadce0] rounded-xl">
                No uploaded photos yet. Drop a photo above to upload and view it here.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Blogger Photos */}
        <TabsContent value="blogger">
          <p className="text-xs text-[#5f6368] mb-3">Photos synced from Blogger posts. Click any photo to view or copy its URL.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bloggerImages.map((b, i) => (
              <div key={i} className="group bg-white border border-[#dadce0] rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
                <div
                  onClick={() =>
                    setModalImage({
                      url: b.url,
                      title: b.title,
                      domainUrl: b.url,
                      cloudinaryUrl: `https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/${b.url}`,
                    })
                  }
                  className="aspect-square bg-[#f8f9fa] p-2 flex items-center justify-center cursor-pointer"
                >
                  <img
                    src={b.url}
                    alt={b.title}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => handleUploadedImageError(e.currentTarget, b.url)}
                  />
                </div>
                <div className="p-2.5 space-y-1.5 border-t border-[#f1f3f4]">
                  <div className="text-xs truncate font-medium text-[#202124]">{b.title}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(b.url, "Blogger Photo URL", `blg-${i}`)}
                    className="w-full h-7 text-xs border-[#dadce0] text-[#3c4043]"
                  >
                    {copiedKey === `blg-${i}` ? <Check size={11} className="mr-1 text-[#1e8e3e]" /> : <Copy size={11} className="mr-1" />}
                    Copy URL
                  </Button>
                </div>
              </div>
            ))}
            {bloggerImages.length === 0 && (
              <div className="col-span-full p-8 text-center text-[#5f6368] bg-white border border-[#dadce0] rounded-xl">
                No Blogger photos found.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Cloudinary CDN */}
        <TabsContent value="cloudinary" className="space-y-4">
          <div className="rounded-xl border border-[#d2e3fc] bg-[#e8f0fe]/60 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#1a73e8] flex items-center gap-2">
                  <Cloud size={18} /> Cloudinary Media Architecture
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  High-speed media transformations with auto-format (f_auto) and auto-quality (q_auto).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-white border border-[#d2e3fc] px-3 py-1.5 rounded-lg text-[#1a73e8]">
                <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse" />
                <span>Cloud: <b>borle8go</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#dadce0] space-y-1">
                <span className="text-[#5f6368]">API Key:</span>
                <p className="font-mono text-[#202124] font-semibold">936238538312159</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#dadce0] space-y-1">
                <span className="text-[#5f6368]">Canonical Domain:</span>
                <p className="font-mono text-[#202124] font-semibold">https://mdshinhasarder.com</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#dadce0] space-y-1">
                <span className="text-[#5f6368]">Optimization Engine:</span>
                <p className="font-mono text-[#137333] font-semibold">f_auto,q_auto,w_500,c_auto</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#202124]">Core Canonical Assets &amp; Cloudinary Delivery Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-[#dadce0] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-[#202124]">Featured Cloudinary Sample</div>
                  <div className="font-mono text-[11px] text-[#5f6368] break-all">cld-sample-5</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-[#f8f9fa] border border-[#e8eaed] flex items-center justify-center p-2">
                  <img
                    src="https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto,w_400/cld-sample-5"
                    alt="Sample 5"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => handleUploadedImageError(e.currentTarget, "cld-sample-5")}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs border-[#dadce0] text-[#3c4043]"
                  onClick={() => copyText("https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto/cld-sample-5", "Cloudinary URL")}
                >
                  <Copy size={12} className="mr-1" /> Copy CDN URL
                </Button>
              </div>

              <div className="bg-white border border-[#dadce0] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-[#202124]">Official Profile Portrait</div>
                  <div className="font-mono text-[11px] text-[#1a73e8] break-all">https://mdshinhasarder.com/profile.webp</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-[#f8f9fa] border border-[#e8eaed] flex items-center justify-center p-2">
                  <img src="/profile.webp" alt="Profile" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-[#dadce0] text-[#3c4043]"
                    onClick={() => copyText("https://mdshinhasarder.com/profile.webp", "Domain Link")}
                  >
                    <Copy size={12} className="mr-1" /> Domain
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-[#1a73e8] border-[#d2e3fc]"
                    onClick={() =>
                      copyText(
                        "https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/https://mdshinhasarder.com/profile.webp",
                        "Cloudinary Link"
                      )
                    }
                  >
                    <Cloud size={12} className="mr-1" /> CDN
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-[#dadce0] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-xs text-[#202124]">Official Site Logo &amp; Favicon</div>
                  <div className="font-mono text-[11px] text-[#1a73e8] break-all">https://mdshinhasarder.com/site-logo.png</div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-[#f8f9fa] border border-[#e8eaed] flex items-center justify-center p-2">
                  <img src="/site-logo.png" alt="Site Logo" className="w-32 h-32 object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-[#dadce0] text-[#3c4043]"
                    onClick={() => copyText("https://mdshinhasarder.com/site-logo.png", "Domain Link")}
                  >
                    <Copy size={12} className="mr-1" /> Domain
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-[#1a73e8] border-[#d2e3fc]"
                    onClick={() =>
                      copyText(
                        "https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/https://mdshinhasarder.com/site-logo.png",
                        "Cloudinary Link"
                      )
                    }
                  >
                    <Cloud size={12} className="mr-1" /> CDN
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-white border border-[#dadce0] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#dadce0] bg-white">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#202124] truncate">{modalImage.title}</h3>
                {modalImage.size && <span className="text-xs text-[#5f6368] font-mono">Size: {modalImage.size}</span>}
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#f8f9fa] flex items-center justify-center p-4 min-h-[240px]">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>

            <div className="p-3 sm:p-4 bg-white border-t border-[#dadce0] space-y-2">
              {modalImage.domainUrl && (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <span className="text-xs text-[#1a73e8] font-semibold shrink-0 sm:w-24">Domain Link:</span>
                  <code className="text-xs font-mono text-[#202124] truncate bg-[#f8f9fa] border border-[#e8eaed] px-2 py-1 rounded flex-1 min-w-0">
                    {modalImage.domainUrl}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => copyText(modalImage.domainUrl!, "Domain Link")}
                      className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs h-7"
                    >
                      <Copy size={12} className="mr-1" /> Copy
                    </Button>
                    <a
                      href={modalImage.domainUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8]"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              )}

              {modalImage.cloudinaryUrl && (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <span className="text-xs text-[#137333] font-semibold shrink-0 sm:w-24">Cloudinary:</span>
                  <code className="text-xs font-mono text-[#202124] truncate bg-[#f8f9fa] border border-[#e8eaed] px-2 py-1 rounded flex-1 min-w-0">
                    {modalImage.cloudinaryUrl}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => copyText(modalImage.cloudinaryUrl!, "Cloudinary Link")}
                      className="bg-[#1e8e3e] hover:bg-[#137333] text-white text-xs h-7"
                    >
                      <Copy size={12} className="mr-1" /> Copy
                    </Button>
                    <a
                      href={modalImage.cloudinaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#5f6368] hover:text-[#137333]"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
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
