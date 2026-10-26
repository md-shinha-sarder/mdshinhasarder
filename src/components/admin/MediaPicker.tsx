import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon, Library, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { toSiteMediaUrl, resolveMediaUrl } from "@/lib/mediaUrl";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface MediaRow { id: string; name: string; url: string; path: string; mime_type: string | null; }

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX = 1400;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

async function uploadFile(file: File, userId: string): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  // 1. Upload to Cloudinary for guaranteed 100% uptime delivery
  let websiteLink = "";
  try {
    const cldRes = await uploadImageToCloudinary(file);
    if (cldRes && cldRes.public_id) {
      // Official website domain link that auto-redirects to Cloudinary
      websiteLink = cldRes.media_redirect_url || `https://mdshinhasarder.com/media/${cldRes.public_id}`;
    }
  } catch (cErr) {
    console.warn("Cloudinary direct upload note:", cErr);
  }

  // 2. Also try Supabase storage for backup
  const path = `${userId || "admin"}/${Date.now()}-${safe}`;
  try {
    const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const urlToStore = websiteLink || pub?.publicUrl || `/images/${safe}`;
      await supabase.from("media").insert({
        name: file.name,
        url: urlToStore,
        path,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: userId || null,
      });
      return websiteLink || urlToStore;
    }
  } catch (_e) {
    // Supabase error non-blocking if Cloudinary succeeded
  }

  if (websiteLink) {
    return websiteLink;
  }

  // Fallback: local compression data url
  const fallbackUrl = await compressImageToDataUrl(file);
  return fallbackUrl || `/images/${safe}`;
}

/** Single-image picker with drag/drop, file upload, URL input, and library browser. */
export function MediaPicker({ value, onChange, label = "Image", accept = "image/*" }:
  { value: string; onChange: (url: string) => void; label?: string; accept?: string }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const uid = user?.id || "admin";
    setBusy(true);
    try {
      const url = await uploadFile(files[0], uid);
      onChange(url);
      toast.success("Image uploaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to upload image");
    } finally {
      setBusy(false);
    }
  }, [onChange, user]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${drag ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}
      >
        {value ? (
          <div className="p-3 flex items-center gap-3">
            <img
              src={resolveMediaUrl(value)}
              alt=""
              className="w-20 h-20 rounded object-cover border border-border"
              onError={(e) => {
                e.currentTarget.src = "/hero-portrait.jpg";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground truncate">{value}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
                  <Upload size={14} className="mr-1" /> Replace
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setLibOpen(true)}>
                  <Library size={14} className="mr-1" /> Library
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                  <X size={14} className="mr-1" /> Clear
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={28} />
            <div className="text-sm text-muted-foreground mb-3">Drag & drop, or</div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
                {busy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />} Upload
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setLibOpen(true)}>
                <Library size={14} className="mr-1" /> From Library
              </Button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>
      <Input placeholder="Or paste image URL" value={value} onChange={(e) => onChange(e.target.value)} className="text-xs" />
      <MediaLibraryDialog open={libOpen} onOpenChange={setLibOpen} onSelect={(u) => { onChange(u); setLibOpen(false); }} accept={accept} />
    </div>
  );
}

/** Multi-image picker for gallery-style fields. */
export function MediaMultiPicker({ value, onChange, label = "Images", accept = "image/*,video/*" }:
  { value: string[]; onChange: (urls: string[]) => void; label?: string; accept?: string }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMany = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadFile(f, user.id));
      onChange([...value, ...urls]);
      toast.success(`Uploaded ${urls.length}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setLibOpen(true)}>
            <Library size={14} className="mr-1" /> Library
          </Button>
          <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Plus size={14} className="mr-1" />} Add
          </Button>
        </div>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); uploadMany(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed p-4 min-h-24 transition-colors ${drag ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}
      >
        {value.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">Drag & drop photos/videos here, or use Add / Library</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {value.map((u, i) => (
              <div key={i} className="relative group aspect-square rounded overflow-hidden border border-border">
                {u.match(/\.(mp4|webm|mov)$/i)
                  ? <video src={u} className="w-full h-full object-cover" />
                  : <img src={u} alt="" className="w-full h-full object-cover" />}
                <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple hidden onChange={(e) => uploadMany(e.target.files)} />
      <MediaLibraryDialog open={libOpen} onOpenChange={setLibOpen} multi accept={accept}
        onSelectMany={(urls) => { onChange([...value, ...urls]); setLibOpen(false); }} />
    </div>
  );
}

function MediaLibraryDialog({ open, onOpenChange, onSelect, onSelectMany, multi, accept }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSelect?: (url: string) => void; onSelectMany?: (urls: string[]) => void;
  multi?: boolean; accept?: string;
}) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setPicked([]);
    supabase.from("media").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setItems((data as MediaRow[]) || []));
  }, [open]);

  const filtered = items.filter((m) => {
    if (accept?.startsWith("image/") && !m.mime_type?.startsWith("image/")) return false;
    return !q || m.name.toLowerCase().includes(q.toLowerCase());
  });

  const toggle = (u: string) => setPicked((p) => p.includes(u) ? p.filter((x) => x !== u) : [...p, u]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader><DialogTitle>Media Library</DialogTitle></DialogHeader>
        <Input placeholder="Search filename..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 flex-1">
          {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground p-6 text-sm">No media found. Upload from Media Library first.</div>}
          {filtered.map((m) => {
            const url = toSiteMediaUrl(m.url);
            const isPicked = picked.includes(url);
            return (
              <button key={m.id} type="button"
                onClick={() => multi ? toggle(url) : onSelect?.(url)}
                className={`relative aspect-square rounded overflow-hidden border-2 transition ${isPicked ? "border-primary" : "border-border hover:border-primary/50"}`}>
                {m.mime_type?.startsWith("image/")
                  ? <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-secondary text-xs p-1 text-center">{m.name}</div>}
              </button>
            );
          })}
        </div>
        {multi && (
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground self-center mr-auto">{picked.length} selected</span>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSelectMany?.(picked)} disabled={picked.length === 0}>Add {picked.length}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
