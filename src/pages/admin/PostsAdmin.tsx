import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Rss, ExternalLink, RefreshCw, Database, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { toSiteMediaUrl } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePosts } from "@/hooks/usePosts";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { postPath } from "@/lib/postUrl";
import { Link } from "react-router-dom";
import {
  saveAdminPost,
  deleteAdminPost,
  getStoredAdminPosts,
  getSupabaseSetupSql,
  type SyncedPost,
} from "@/lib/postSync";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published";
  synced_to_cloud?: boolean;
}

const blank: Post = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_url: "",
  tags: [],
  seo_title: "",
  seo_description: "",
  status: "published",
};

const PostsAdmin = () => {
  const { posts: bloggerPosts, refetch: refetchLivePosts } = usePosts();
  const [items, setItems] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [tagsStr, setTagsStr] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    // 1. Get stored admin posts
    const localAdmin = getStoredAdminPosts();

    // 2. Try fetching from Supabase DB
    let dbPosts: Post[] = [];
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        dbPosts = (data as any[]).map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          cover_url: p.cover_url,
          tags: Array.isArray(p.tags) ? p.tags : [],
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          status: p.status,
          synced_to_cloud: true,
        }));
      }
    } catch {
      // Supabase table not created yet
    }

    // Merge: local admin posts override or supplement DB posts
    const map = new Map<string, Post>();
    dbPosts.forEach((p) => map.set(p.slug, p));
    localAdmin.forEach((p) => {
      map.set(p.slug, {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        cover_url: p.image,
        tags: Array.isArray(p.tags) ? p.tags : [],
        seo_title: p.seo_title || null,
        seo_description: p.seo_description || null,
        status: p.status,
        synced_to_cloud: p.synced_to_cloud,
      });
    });

    setItems(Array.from(map.values()));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: Post) => {
    setEditing(p);
    setTagsStr((p.tags || []).join(", "));
    setOpen(true);
  };

  const startNew = () => {
    setEditing({ ...blank });
    setTagsStr("");
    setOpen(true);
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    if (!editing) return;
    const shouldUpdateSlug = !editing.id && (!editing.slug || editing.slug === slugify(editing.title));
    setEditing({
      ...editing,
      title: val,
      slug: shouldUpdateSlug ? slugify(val) : editing.slug,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Please enter a title.");
    const finalSlug = (editing.slug || slugify(editing.title)).trim();
    if (!finalSlug) return toast.error("Please provide a URL slug.");
    if (!editing.cover_url) return toast.error("Please add a cover image.");

    setSaving(true);
    try {
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await saveAdminPost({
        id: editing.id || undefined,
        slug: finalSlug,
        title: editing.title.trim(),
        excerpt: editing.excerpt || "",
        content: editing.content || "",
        image: editing.cover_url,
        tags,
        seo_title: editing.seo_title || null,
        seo_description: editing.seo_description || null,
        status: editing.status,
      });

      if (res.syncedToCloud) {
        toast.success("Post published and synced to Supabase database!");
      } else {
        toast.success(res.message);
      }

      setOpen(false);
      await load();
      await refetchLivePosts().catch(() => {});
    } catch (err: any) {
      toast.error(err?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteAdminPost(id);
      toast.success("Post deleted from all channels");
      await load();
      await refetchLivePosts().catch(() => {});
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(getSupabaseSetupSql());
    setCopiedSql(true);
    toast.success("Supabase SQL Schema copied! Paste into your Supabase SQL Editor.");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Posts &amp; Synchronization</h1>
          <p className="text-muted-foreground text-sm">
            Create, edit, and instantly sync articles across public pages &amp; Supabase database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSqlOpen(true)}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-600/10"
          >
            <Database size={15} className="mr-1.5 text-blue-400" /> DB Setup SQL
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await load();
              await refetchLivePosts();
              toast.success("Synchronized all posts!");
            }}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-600/10"
          >
            <RefreshCw size={15} className="mr-1.5 text-blue-400" /> Sync Now
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startNew} className="bg-gradient-gold text-primary-foreground shadow-lg">
                <Plus size={16} className="mr-1.5" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a1532] border-blue-500/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-serif">
                  {editing?.id ? "Edit Post" : "Create New Post"}
                </DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Title *</Label>
                      <Input
                        value={editing.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. My Next.js Journey"
                        className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">URL Slug *</Label>
                      <Input
                        value={editing.slug}
                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                        placeholder="e.g. my-nextjs-journey"
                        className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Excerpt / Short Summary</Label>
                    <Textarea
                      rows={2}
                      value={editing.excerpt || ""}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      placeholder="Brief 1-2 sentence overview for search cards"
                      className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-slate-300">Content (TipTap Rich Editor)</Label>
                      <span className="text-[11px] text-amber-400 font-medium">Highlight &amp; Link enabled</span>
                    </div>
                    <TipTapEditor
                      content={editing.content}
                      onChange={(html) => setEditing({ ...editing, content: html })}
                    />
                  </div>
                  <MediaPicker
                    label="Cover Image *"
                    value={toSiteMediaUrl(editing.cover_url || "")}
                    onChange={(url) => setEditing({ ...editing, cover_url: url })}
                  />
                  <div>
                    <Label className="text-slate-300">Tags (comma separated)</Label>
                    <Input
                      value={tagsStr}
                      onChange={(e) => setTagsStr(e.target.value)}
                      placeholder="e.g. Technology, Next.js, Fedora"
                      className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">SEO Title (optional)</Label>
                      <Input
                        value={editing.seo_title || ""}
                        onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                        placeholder="Custom search title"
                        className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Status</Label>
                      <Select
                        value={editing.status}
                        onValueChange={(v) => setEditing({ ...editing, status: v as any })}
                      >
                        <SelectTrigger className="bg-[#070e24] border-blue-500/30 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c183a] border-blue-500/30 text-white">
                          <SelectItem value="published">Published (Live Everywhere)</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">SEO Meta Description (optional)</Label>
                    <Textarea
                      rows={2}
                      value={editing.seo_description || ""}
                      onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                      placeholder="Custom description for Google and social previews"
                      className="bg-[#070e24] border-blue-500/30 text-white mt-1"
                    />
                  </div>
                  <Button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg"
                  >
                    {saving ? "Publishing & Syncing..." : "Save & Sync Post"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SQL Setup Modal for Supabase Table */}
      <Dialog open={sqlOpen} onOpenChange={setSqlOpen}>
        <DialogContent className="max-w-2xl bg-[#0a1532] border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif flex items-center gap-2">
              <Database size={18} className="text-blue-400" /> Supabase Database Schema Setup
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-300 leading-relaxed">
            Run this SQL query in your Supabase Dashboard (<span className="text-blue-300 font-mono">SQL Editor</span>)
            to create the <span className="font-mono text-amber-300">posts</span> table with Row Level Security and indexes.
          </p>
          <div className="relative mt-2">
            <pre className="bg-[#070e24] border border-blue-500/20 rounded-xl p-4 text-xs font-mono text-blue-200 overflow-x-auto max-h-[300px]">
              {getSupabaseSetupSql()}
            </pre>
            <Button
              size="sm"
              onClick={copySql}
              className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 text-white text-xs"
            >
              {copiedSql ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copiedSql ? "Copied!" : "Copy SQL"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="db">
        <TabsList className="bg-[#0c183a] border border-blue-500/20">
          <TabsTrigger value="db" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Custom / Synced Posts ({items.length})
          </TabsTrigger>
          <TabsTrigger value="blogger" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Rss size={14} className="mr-1.5" /> Blogger Feed ({bloggerPosts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="db">
          <div className="bg-[#0c183a]/80 border border-blue-500/20 rounded-2xl divide-y divide-blue-500/15 overflow-hidden">
            {items.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <p className="mb-2">No custom posts created yet.</p>
                <p className="text-xs text-slate-500">
                  Click &ldquo;New Post&rdquo; to publish an article that syncs instantly to public pages.
                </p>
              </div>
            )}
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {p.cover_url && (
                    <img src={p.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-blue-500/20" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate flex items-center gap-2">
                      {p.title}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          p.status === "published"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.synced_to_cloud ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          Cloud Synced
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Live Synced
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      /{p.slug} · {(p.tags || []).join(", ") || "No tags"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 items-center">
                  <Link
                    to={`/post/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 p-2 transition-colors"
                    title="View public post"
                  >
                    <ExternalLink size={15} />
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="hover:text-blue-400">
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)} className="hover:text-red-400">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="blogger">
          <div className="bg-[#0c183a]/80 border border-blue-500/20 rounded-2xl divide-y divide-blue-500/15 max-h-[70vh] overflow-y-auto">
            {bloggerPosts.length === 0 && <div className="p-8 text-center text-slate-400">No Blogger posts found.</div>}
            {bloggerPosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {p.image && (
                    <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-blue-500/20" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{p.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {(p.tags || []).join(", ") || "General"}
                    </div>
                  </div>
                </div>
                <Link to={postPath(p)} className="text-blue-400 hover:text-blue-300 shrink-0 p-2" title="Open post">
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

export default PostsAdmin;
