import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Copy, Rss, Image as ImageIcon, ShieldAlert, Check, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { toSiteMediaUrl } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

const MediaAdmin = () => {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [showFixGuide, setShowFixGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      setItems((data as MediaItem[]) || []);
    } catch (_e) {
      void _e;
    }
  };
  useEffect(() => { load(); }, []);

  const copySql = () => {
    navigator.clipboard.writeText(STORAGE_FIX_SQL);
    setCopiedSql(true);
    toast.success("SQL স্ক্রিপ্ট কপি হয়েছে! Supabase SQL Editor-এ পেস্ট করে Run করুন।");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const upload = useCallback(async (files: FileList | null) => {
    if (!files || !user) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${user.id}/${Date.now()}-${safe}`;
        let { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
        if (upErr && (upErr.message?.toLowerCase().includes("bucket") || (upErr as any).statusCode === 404 || (upErr as any).statusCode === "404")) {
          try {
            await supabase.storage.createBucket("media", { public: true });
            const retry = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
            upErr = retry.error;
          } catch (_e) {
            void _e;
          }
        }
        if (upErr) {
          const msg = (upErr.message || "").toLowerCase();
          if (
            msg.includes("row-level security") ||
            msg.includes("violates") ||
            (upErr as any).statusCode === 403 ||
            (upErr as any).statusCode === "403"
          ) {
            setShowFixGuide(true);
            throw new Error("Supabase Storage Row-Level Security (RLS) পলিসির কারণে আপলোড আটকে গেছে। উপরের 'Fix RLS SQL' বোতামে চাপ দিয়ে স্ক্রিপ্টটি Supabase SQL Editor-এ রান করুন।");
          }
          if (msg.includes("bucket") || (upErr as any).statusCode === 404 || (upErr as any).statusCode === "404") {
            setShowFixGuide(true);
            throw new Error("Supabase Storage-এ 'media' নামের public bucket পাওয়া যায়নি।");
          }
          throw upErr;
        }
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        try {
          await supabase.from("media").insert({
            name: file.name, url: pub.publicUrl, path, mime_type: file.type, size_bytes: file.size, uploaded_by: user.id,
          });
        } catch (_e) {
          void _e;
        }
      }
      toast.success("Uploaded");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }, [user]);

  const remove = async (m: MediaItem) => {
    if (!confirm("Delete this file?")) return;
    try {
      await supabase.storage.from("media").remove([m.path]);
      await supabase.from("media").delete().eq("id", m.id);
    } catch (_e) {
      void _e;
    }
    toast.success("Deleted"); load();
  };

  const copy = (u: string) => { navigator.clipboard.writeText(u); toast.success("URL copied"); };

  const bloggerImages = useMemo(() => {
    const set = new Map<string, { url: string; title: string }>();
    for (const p of posts) {
      if (p.image) set.set(p.image, { url: p.image, title: p.title });
      const re = /<img[^>]+src=["']([^"']+)["']/gi;
      let m; while ((m = re.exec(p.content || "")) !== null) set.set(m[1], { url: m[1], title: p.title });
    }
    return Array.from(set.values());
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload files or browse Blogger photos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFixGuide(!showFixGuide)}
            className="text-xs"
          >
            <HelpCircle size={14} className="mr-1" /> Storage RLS Fix
          </Button>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
          <Button onClick={() => fileRef.current?.click()} disabled={busy} className="bg-gradient-gold text-primary-foreground">
            <Upload size={16} className="mr-1" /> {busy ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {showFixGuide && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert size={18} />
              <span>Supabase Storage RLS পারমিশন ফিক্স (1-Click Solution)</span>
            </div>
            <Button size="sm" onClick={copySql} className="bg-gradient-gold text-primary-foreground text-xs">
              {copiedSql ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copiedSql ? "Copied!" : "Copy SQL Script"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ছবি আপলোড করার সময় <code>new row violates row-level security policy</code> দেখালে:
            <br />
            ১. <b>Copy SQL Script</b> বাটনে ক্লিক করুন।
            <br />
            ২. আপনার <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline text-primary">Supabase Dashboard</a>-এর <b>SQL Editor</b>-এ গিয়ে পেস্ট করে <b>Run</b> করুন।
          </p>
        </div>
      )}

      <Tabs defaultValue="library" className="space-y-4">
        <TabsList>
          <TabsTrigger value="library"><ImageIcon size={14} className="mr-1" /> Library ({items.length})</TabsTrigger>
          <TabsTrigger value="blogger"><Rss size={14} className="mr-1" /> Blogger ({bloggerImages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
            className={`rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${drag ? "border-primary bg-primary/5" : "border-border bg-secondary/30 text-muted-foreground"}`}
          >
            Drag & drop photos or videos here to upload
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.length === 0 && <div className="col-span-full p-8 text-center text-muted-foreground bg-gradient-card border border-border rounded-xl">No media yet.</div>}
            {items.map((m) => (
              <div key={m.id} className="bg-gradient-card border border-border rounded-xl overflow-hidden group">
                {m.mime_type?.startsWith("image/")
                  ? <img src={m.url} alt={m.name} className="w-full aspect-square object-cover" />
                  : m.mime_type?.startsWith("video/")
                    ? <video src={m.url} className="w-full aspect-square object-cover" />
                    : <div className="w-full aspect-square flex items-center justify-center text-muted-foreground text-xs p-2 text-center">{m.mime_type}</div>}
                <div className="p-3 space-y-2">
                  <div className="text-xs truncate" title={m.name}>{m.name}</div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => copy(toSiteMediaUrl(m.url))}><Copy size={12} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blogger">
          <p className="text-xs text-muted-foreground mb-3">Auto-fetched from all Blogger posts. Click any to copy URL.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bloggerImages.map((b, i) => (
              <button key={i} onClick={() => copy(b.url)} className="group bg-gradient-card border border-border rounded-xl overflow-hidden text-left">
                <img src={b.url} alt={b.title} loading="lazy" className="w-full aspect-square object-cover" />
                <div className="p-2 text-xs truncate">{b.title}</div>
              </button>
            ))}
            {bloggerImages.length === 0 && <div className="col-span-full p-8 text-center text-muted-foreground">No Blogger photos yet.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaAdmin;
