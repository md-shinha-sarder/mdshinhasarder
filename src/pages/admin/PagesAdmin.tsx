import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Rss, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker, MediaMultiPicker } from "@/components/admin/MediaPicker";
import { PhotoUploadBox } from "@/components/admin/PhotoUploadBox";
import { toSiteMediaUrl, resolveMediaUrl } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePages } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { Link } from "react-router-dom";



interface Page {
  id: string; slug: string; title: string; content: string;
  cover_url: string | null; images: string[];
  seo_title: string | null; seo_description: string | null; status: string;
}

const blank: Page = { id: "", slug: "", title: "", content: "", cover_url: "", images: [], seo_title: "", seo_description: "", status: "draft" };

const PagesAdmin = () => {
  const { pages: bloggerPages, refetch: refetchPages } = usePages();
  const [items, setItems] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | null>(null);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
    setItems(((data as any[]) || []).map((p) => ({ ...p, images: p.images || [] })));
  };
  useEffect(() => { load(); }, []);

  const handleSyncPages = async () => {
    setSyncing(true);
    try {
      await refetchPages();
      toast.success("Synchronized all Blogger pages & photos!");
    } catch {
      toast.error("Failed to sync pages");
    } finally {
      setSyncing(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    const payload = {
      slug: editing.slug, title: editing.title, content: editing.content,
      cover_url: editing.cover_url, images: editing.images,
      seo_title: editing.seo_title, seo_description: editing.seo_description, status: editing.status,
    };
    const { error } = editing.id
      ? await supabase.from("pages").update(payload).eq("id", editing.id)
      : await supabase.from("pages").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Pages</h1>
          <p className="text-muted-foreground">Blogger synced pages &amp; custom managed pages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={handleSyncPages}
            className="border-primary/30"
          >
            <RefreshCw size={14} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Pages"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...blank })} className="bg-gradient-gold text-primary-foreground">
                <Plus size={16} className="mr-1" /> New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing?.id ? "Edit Page" : "New Page"}</DialogTitle></DialogHeader>
              {editing && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                    <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                  </div>
                  <div><Label>Content</Label><Textarea rows={8} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>

                  {/* Dedicated Photo Upload Box */}
                  <PhotoUploadBox
                    label="Page Photo Upload Box"
                    description="Upload photo directly to /images/ folder — automatically generates domain link and applies to page cover."
                    onUploadSuccess={(res) => {
                      setEditing({
                        ...editing,
                        cover_url: res.domainUrl,
                        images: [...(editing.images || []), res.domainUrl],
                      });
                    }}
                    onApply={(domainUrl) => {
                      setEditing({ ...editing, cover_url: domainUrl });
                    }}
                    applyButtonLabel="Set as Page Cover"
                  />

                  <div>
                    <Label>Cover Image URL</Label>
                    <Input
                      value={editing.cover_url || ""}
                      onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                      placeholder="https://mdshinhasarder.com/images/..."
                      className="font-mono text-xs mt-1"
                    />
                    {editing.cover_url && (
                      <div className="mt-2 p-2 rounded-xl border border-blue-500/30 bg-secondary/30 flex items-center gap-3">
                        <img
                          src={resolveMediaUrl(editing.cover_url)}
                          alt="Cover Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-border shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/hero-portrait.jpg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-emerald-400">Active Page Cover Photo (Live Preview)</div>
                          <div className="text-[11px] font-mono text-muted-foreground truncate">{editing.cover_url}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <MediaMultiPicker label="Additional Page Photos & Videos" value={editing.images} onChange={(imgs) => setEditing({ ...editing, images: imgs })} />
                  <div><Label>SEO Title</Label><Input value={editing.seo_title || ""} onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })} /></div>
                  <div><Label>SEO Description</Label><Textarea rows={2} value={editing.seo_description || ""} onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })} /></div>
                  <div><Label>Status</Label>
                    <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Button onClick={save} className="w-full">Save Page</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Photo Upload Box on Pages screen */}
      <PhotoUploadBox
        compact
        label="Quick Photo Upload to /images/ for Pages"
        description="Upload photos directly to /images/ folder — immediately creates official domain links for your pages."
      />
      <Tabs defaultValue="blogger">
        <TabsList>
          <TabsTrigger value="blogger"><Rss size={14} className="mr-1" /> Blogger ({bloggerPages.length})</TabsTrigger>
          <TabsTrigger value="db">Custom ({items.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="db">
          <div className="bg-gradient-card border border-border rounded-xl divide-y divide-border">
            {items.length === 0 && <div className="p-8 text-center text-muted-foreground">No custom pages yet.</div>}
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.cover_url && (
                    <img
                      src={p.cover_url}
                      alt=""
                      onError={(e) => { e.currentTarget.src = "/hero-portrait.jpg"; }}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.title} <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{p.status}</span></div>
                    <div className="text-xs text-muted-foreground truncate">/{p.slug} · {p.images?.length || 0} photos</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="blogger">
          <div className="bg-gradient-card border border-border rounded-xl divide-y divide-border max-h-[70vh] overflow-y-auto">
            {bloggerPages.length === 0 && <div className="p-8 text-center text-muted-foreground">No Blogger pages synced yet. Click "Sync Pages" to fetch now.</div>}
            {bloggerPages.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.image && (
                    <img
                      src={p.image}
                      alt=""
                      onError={(e) => { e.currentTarget.src = "/hero-portrait.jpg"; }}
                      className="w-12 h-12 rounded object-cover shrink-0 bg-slate-800"
                    />
                  )}
                  <div className="min-w-0 font-medium truncate">{p.title || "Untitled Page"}</div>
                </div>
                <Link to={postPath(p)} className="text-primary hover:text-primary/80 shrink-0 p-2">
                  <ExternalLink size={16} />
                </Link>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default PagesAdmin;
