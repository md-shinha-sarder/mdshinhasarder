import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Rss, ExternalLink, RefreshCw, Database, Copy, Check, Image as ImageIcon, Search, Globe, Sparkles, FolderSync, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { resolveMediaUrl } from "@/lib/mediaUrl";
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
import { syncAllPhotosToImagesFolder } from "@/lib/syncAllPhotos";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

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
  source?: "admin" | "supabase" | "blogger";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [syncingPhotos, setSyncingPhotos] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [copiedDomainLink, setCopiedDomainLink] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [pastedUrl, setPastedUrl] = useState("");

  const handleSyncAllPhotos = async () => {
    setSyncingPhotos(true);
    setSyncStatus("Starting photo synchronization...");
    try {
      const res = await syncAllPhotosToImagesFolder((msg) => {
        setSyncStatus(msg);
      });
      toast.success(`Synced ${res.totalFound} photos to /images folder with domain links!`);
      await load();
      await refetchLivePosts().catch(() => {});
    } catch (err: any) {
      toast.error(err?.message || "Failed to sync photos to domain");
    } finally {
      setSyncingPhotos(false);
      setSyncStatus("");
    }
  };

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
          cover_url: resolveMediaUrl(p.cover_url),
          tags: Array.isArray(p.tags) ? p.tags : [],
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          status: p.status,
          synced_to_cloud: true,
          source: "supabase",
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
        cover_url: resolveMediaUrl(p.image || p.cover_url),
        tags: Array.isArray(p.tags) ? p.tags : [],
        seo_title: p.seo_title || null,
        seo_description: p.seo_description || null,
        status: p.status,
        synced_to_cloud: p.synced_to_cloud,
        source: "admin",
      });
    });

    setItems(Array.from(map.values()));
  };

  useEffect(() => {
    load();
  }, []);

  // Combined list of ALL posts (Uploaded/Custom + Blogger)
  const combinedPosts = useMemo(() => {
    const seen = new Set<string>();
    const list: Post[] = [];

    // Custom / Uploaded posts first
    for (const p of items) {
      const key = (p.slug || p.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ ...p, source: p.source || "admin" });
      }
    }

    // Blogger posts
    for (const p of bloggerPosts) {
      const key = (p.slug || p.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          cover_url: resolveMediaUrl(p.image),
          tags: p.tags || [],
          seo_title: p.seo_title || null,
          seo_description: p.seo_description || null,
          status: "published",
          source: "blogger",
        });
      }
    }

    return list;
  }, [items, bloggerPosts]);

  // Filtered by tab and search query
  const displayedPosts = useMemo(() => {
    let base = combinedPosts;
    if (activeTab === "uploaded") {
      base = items;
    } else if (activeTab === "blogger") {
      base = combinedPosts.filter((p) => p.source === "blogger");
    }

    if (!searchTerm.trim()) return base;
    const q = searchTerm.toLowerCase();
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [combinedPosts, items, activeTab, searchTerm]);

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

      const resolvedCover = resolveMediaUrl(editing.cover_url);

      const res = await saveAdminPost({
        id: editing.id || undefined,
        slug: finalSlug,
        title: editing.title.trim(),
        excerpt: editing.excerpt || "",
        content: editing.content || "",
        image: resolvedCover,
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
          <h1 className="text-3xl font-serif font-bold text-white">Posts &amp; Articles</h1>
          <p className="text-muted-foreground text-sm">
            All Blogger posts &amp; uploaded articles in one unified system with photo previews.
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
            onClick={handleSyncAllPhotos}
            disabled={syncingPhotos}
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/10"
          >
            <FolderSync size={15} className={`mr-1.5 text-emerald-400 ${syncingPhotos ? "animate-spin" : ""}`} />
            {syncingPhotos ? "Syncing..." : "Sync Photos to /images"}
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
              <Button onClick={startNew} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
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
                  {/* Auto Domain Image Link Assistant */}
                  {(() => {
                    const safeSlug = (editing.slug || slugify(editing.title) || "post").toLowerCase();
                    const autoDomainUrl = `https://mdshinhasarder.com/images/${safeSlug}.jpg`;
                    const isCoverMatching = editing.cover_url === autoDomainUrl;

                    return (
                      <div className="rounded-xl border border-blue-500/30 bg-[#070e24]/90 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" />
                            <Label className="text-sm font-semibold text-white">
                              Auto Domain Image Link Generator
                            </Label>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                            /images/{safeSlug}.jpg
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1 bg-[#030712] border border-blue-500/20 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 truncate select-all">
                            {autoDomainUrl}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(autoDomainUrl);
                                setCopiedDomainLink(true);
                                toast.success("Domain image link copied to clipboard!");
                                setTimeout(() => setCopiedDomainLink(false), 2000);
                              }}
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-600/10 text-xs h-8"
                            >
                              {copiedDomainLink ? <Check size={14} className="mr-1 text-emerald-400" /> : <Copy size={14} className="mr-1" />}
                              {copiedDomainLink ? "Copied" : "Copy Link"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setEditing({ ...editing, cover_url: autoDomainUrl });
                                toast.success(`Cover image set to ${autoDomainUrl}`);
                              }}
                              className={`text-xs h-8 ${isCoverMatching ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                            >
                              {isCoverMatching ? <CheckCircle2 size={14} className="mr-1" /> : <Globe size={14} className="mr-1" />}
                              {isCoverMatching ? "Assigned" : "Use As Cover"}
                            </Button>
                          </div>
                        </div>

                        {/* Direct File Upload to this Domain Link */}
                        <div className="pt-2 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <Upload size={13} className="text-blue-400" />
                            <span>Upload photo directly to <strong className="text-slate-200">/images/</strong>:</span>
                          </div>
                          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-medium transition-colors flex items-center gap-1.5">
                            <Upload size={13} />
                            <span>{uploadingCover ? "Uploading & Saving..." : "Upload Photo to /images"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingCover}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingCover(true);
                                try {
                                  const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
                                  const fileBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
                                  const baseSlug = (editing.slug || slugify(editing.title) || fileBase || "post").toLowerCase();
                                  const uniqueFileName = `${baseSlug}-${Date.now().toString(36).slice(-4)}.${rawExt}`;
                                  const uniqueDomainUrl = `https://mdshinhasarder.com/images/${uniqueFileName}`;

                                  await uploadImageToCloudinary(file, uniqueFileName.replace(/\.[^/.]+$/, ""));

                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const b64 = (reader.result || "").toString().split(";base64,").pop();
                                    if (b64) {
                                      await fetch("/api/save-image", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ fileName: uniqueFileName, base64: b64 }),
                                      }).catch(() => {});
                                    }
                                  };
                                  reader.readAsDataURL(file);

                                  setEditing({ ...editing, cover_url: uniqueDomainUrl });
                                  toast.success(`Photo uploaded with unique link: ${uniqueDomainUrl}`);
                                } catch (err: any) {
                                  toast.error(err?.message || "Failed to upload photo");
                                } finally {
                                  setUploadingCover(false);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Quick convert any external/Blogger URL to this domain link */}
                        <div className="pt-2 border-t border-blue-500/15 flex items-center gap-2">
                          <Input
                            placeholder="Or paste any Blogger/Cloudinary/External URL to convert to domain link..."
                            value={pastedUrl}
                            onChange={(e) => setPastedUrl(e.target.value)}
                            className="text-xs h-8 bg-[#040817] border-blue-500/30 text-slate-200"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!pastedUrl.trim()) return toast.error("Please paste an image URL first");
                              try {
                                const rawExt = (pastedUrl.split("?")[0].split(".").pop() || "jpg").toLowerCase();
                                const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt) ? rawExt : "jpg";
                                const uniqueName = `${safeSlug}-${Date.now().toString(36).slice(-4)}.${cleanExt}`;
                                const uniqueUrl = `https://mdshinhasarder.com/images/${uniqueName}`;

                                const res = await fetch("/api/sync-photos", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    photos: [{ filename: uniqueName, url: pastedUrl.trim(), title: editing.title }],
                                  }),
                                });
                                if (res.ok) {
                                  setEditing({ ...editing, cover_url: uniqueUrl });
                                  setPastedUrl("");
                                  toast.success(`Converted & saved to ${uniqueUrl}!`);
                                } else {
                                  setEditing({ ...editing, cover_url: uniqueUrl });
                                  toast.success(`Assigned domain link ${uniqueUrl}`);
                                }
                              } catch {
                                setEditing({ ...editing, cover_url: autoDomainUrl });
                                toast.success(`Assigned domain link ${autoDomainUrl}`);
                              }
                            }}
                            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/10 text-xs h-8 shrink-0"
                          >
                            Convert to Domain Link
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  <MediaPicker
                    label="Cover Image *"
                    value={resolveMediaUrl(editing.cover_url || "")}
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

      {/* Search Input & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-[#0c183a] border border-blue-500/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              All Posts ({combinedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="uploaded" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              Uploaded / Custom ({items.length})
            </TabsTrigger>
            <TabsTrigger value="blogger" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              <Rss size={13} className="mr-1" /> Blogger Feed ({bloggerPosts.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="pl-9 h-9 bg-[#070e24] border-blue-500/30 text-white text-xs placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Unified Posts List Table */}
      <div className="bg-[#0c183a]/80 border border-blue-500/20 rounded-2xl divide-y divide-blue-500/15 overflow-hidden shadow-xl">
        {displayedPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="mb-2">No posts found matching your criteria.</p>
            <p className="text-xs text-slate-500">
              {activeTab === "uploaded"
                ? "Click 'New Post' above to upload and publish an article."
                : "Try clearing the search query or changing tabs."}
            </p>
          </div>
        ) : (
          displayedPosts.map((p) => {
            const isCustom = p.source === "admin" || p.source === "supabase" || items.some((it) => it.slug === p.slug);
            const imgSrc = resolveMediaUrl(p.cover_url || (p as any).image);

            return (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-blue-500/30 bg-slate-950 flex items-center justify-center">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/hero-portrait.jpg";
                        }}
                      />
                    ) : (
                      <ImageIcon size={18} className="text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium text-white truncate flex items-center gap-2">
                      <span className="truncate">{p.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0 ${
                          p.status === "published"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {p.status}
                      </span>
                      {isCustom ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 shrink-0 font-medium">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 font-medium">
                          Blogger
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      /{p.slug} · {(p.tags || []).join(", ") || "General"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0 items-center">
                  <Link
                    to={`/post/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 p-2 transition-colors rounded-lg hover:bg-blue-500/10"
                    title="View public post"
                  >
                    <ExternalLink size={15} />
                  </Link>

                  {isCustom && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(p)}
                        className="hover:text-blue-400 hover:bg-blue-500/10"
                        title="Edit post"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(p.id)}
                        className="hover:text-red-400 hover:bg-red-500/10"
                        title="Delete post"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostsAdmin;
