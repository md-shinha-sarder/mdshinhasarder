import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tag,
  Share2,
  MessageSquare,
  BarChart2,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Database,
  Copy,
  Check,
  ArrowLeft,
  X,
  FileText,
  Code,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PhotoUploadBox } from "@/components/admin/PhotoUploadBox";
import { resolveMediaUrl, handleUploadedImageError } from "@/lib/mediaUrl";
import { usePosts } from "@/hooks/usePosts";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { postPath } from "@/lib/postUrl";
import {
  saveAdminPost,
  deleteAdminPost,
  getStoredAdminPosts,
  getDeletedPostKeys,
  bulkUpdateAdminPosts,
  bulkDeleteAdminPosts,
  subscribeToPostsUpdates,
  getSupabaseSetupSql,
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
  source?: "admin" | "supabase" | "blogger";
  views?: number;
  comments_count?: number;
  published?: string;
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
  views: 1,
  comments_count: 0,
};

// Formats date like Blogger: "Nov 11", "Oct 31", etc.
function formatBloggerDate(dateStr?: string | null) {
  if (!dateStr) return "Nov 11";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Nov 11";
  }
}

// Generate realistic view count for Blogger posts
function getViewsCount(post: any, index: number): number {
  if (post.views !== undefined) return post.views;
  const preset = [11, 33, 31, 68, 68, 65, 58, 42, 53, 39, 74, 88, 62, 50, 45];
  return preset[index % preset.length];
}

const PostsAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts: bloggerPosts, refetch: refetchLivePosts } = usePosts();
  const [items, setItems] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [tagsStr, setTagsStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [manageMode, setManageMode] = useState(false);
  const [viewMode, setViewMode] = useState<"compose" | "html">("compose");

  // Sync with search bridge from top navbar
  useEffect(() => {
    const bridge = document.getElementById("blogger-search-event") as HTMLInputElement | null;
    if (bridge) {
      const handleInput = (e: any) => {
        setSearchTerm(e.target.value || "");
      };
      bridge.addEventListener("input", handleInput);
      return () => bridge.removeEventListener("input", handleInput);
    }
  }, []);

  // Listen for ?new=true query param from the "+ NEW POST" sidebar button
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      startNew();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Lock body scroll when full device editor window is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const load = async () => {
    const localAdmin = getStoredAdminPosts();

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
          published: p.published_at || p.created_at,
          views: p.views || 25,
          comments_count: 0,
        }));
      }
    } catch {
      // Supabase table not created yet
    }

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
        published: p.published,
        views: p.views || 15,
        comments_count: 0,
      });
    });

    setItems(Array.from(map.values()));
  };

  useEffect(() => {
    load();
    const unsubscribe = subscribeToPostsUpdates(() => {
      load();
    });
    return () => unsubscribe();
  }, []);

  // Combined list of ALL posts (Admin + Supabase + Blogger feed), filtered & sorted newest-first
  const combinedPosts = useMemo(() => {
    const deleted = getDeletedPostKeys();
    const seen = new Set<string>();
    const list: Post[] = [];

    const isDeleted = (p: { id?: string; slug?: string }) => {
      const s = (p.slug || "").toLowerCase().trim();
      const id = (p.id || "").toLowerCase().trim();
      return (s && deleted.has(s)) || (id && deleted.has(id));
    };

    // Admin / Supabase posts first
    for (const p of items) {
      if (isDeleted(p)) continue;
      const key = (p.slug || p.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ ...p, source: p.source || "admin" });
      }
    }

    // Blogger & static feed posts
    for (let i = 0; i < bloggerPosts.length; i++) {
      const p = bloggerPosts[i];
      if (isDeleted(p)) continue;
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
          status: p.status === "draft" ? "draft" : "published",
          source: p.source || "blogger",
          published: p.published,
          views: (p as any).views ?? getViewsCount(p, i),
          comments_count: 0,
        });
      }
    }

    return list.sort((a, b) => {
      const tA = a.published ? Date.parse(a.published) : 0;
      const tB = b.published ? Date.parse(b.published) : 0;
      return (Number.isFinite(tB) ? tB : 0) - (Number.isFinite(tA) ? tA : 0);
    });
  }, [items, bloggerPosts]);

  // Unique tags available across all posts
  const availableTags = useMemo(() => {
    const set = new Set<string>(["Song", "Latest", "Technology", "News"]);
    combinedPosts.forEach((p) => (p.tags || []).forEach((t) => t && set.add(t)));
    return Array.from(set);
  }, [combinedPosts]);

  // Filtered by selected category and search
  const displayedPosts = useMemo(() => {
    let base = combinedPosts;

    if (filterType === "draft") {
      base = base.filter((p) => p.status === "draft");
    } else if (filterType === "published") {
      base = base.filter((p) => p.status === "published");
    } else if (filterType !== "all") {
      base = base.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === filterType.toLowerCase())
      );
    }

    if (!searchTerm.trim()) return base;
    const q = searchTerm.toLowerCase();
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [combinedPosts, filterType, searchTerm]);

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

    setSaving(true);
    try {
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const resolvedCover = resolveMediaUrl(editing.cover_url);
      const isNewPost = !editing.id;
      const publishTimestamp = isNewPost
        ? new Date().toISOString()
        : editing.published || new Date().toISOString();

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
        published: publishTimestamp,
      });

      toast.success(res.message || "Post saved and published live!");
      setOpen(false);
      await load();
      void refetchLivePosts().catch(() => {});
    } catch (err: any) {
      toast.error(err?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deleteAdminPost(post.id, post.slug);
      setSelectedPosts((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
      toast.success("Post deleted cleanly across Admin & website");
      await load();
      void refetchLivePosts().catch(() => {});
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    }
  };

  const handleBulkStatus = async (status: "published" | "draft") => {
    const selected = combinedPosts.filter((p) => selectedPosts.has(p.id));
    if (selected.length === 0) return;
    await bulkUpdateAdminPosts(
      selected.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || "",
        content: p.content || "",
        image: p.cover_url,
        tags: p.tags,
        published: p.published,
        status,
      })),
      status
    );
    toast.success(
      `${selected.length} post(s) set to ${status === "published" ? "Published (Live)" : "Draft"}!`
    );
    setSelectedPosts(new Set());
    await load();
  };

  const handleBulkDelete = async () => {
    const selected = combinedPosts.filter((p) => selectedPosts.has(p.id));
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} selected post(s) permanently?`)) return;
    await bulkDeleteAdminPosts(selected.map((p) => ({ id: p.id, slug: p.slug })));
    toast.success(`${selected.length} post(s) deleted cleanly.`);
    setSelectedPosts(new Set());
    await load();
  };

  const copySql = () => {
    navigator.clipboard.writeText(getSupabaseSetupSql());
    setCopiedSql(true);
    toast.success("Supabase SQL Schema copied!");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedPosts);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPosts(next);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Top Action Bar (Filter, Manage, Sync, SQL setup, New Post) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#dadce0]">
        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 px-3 bg-white border border-transparent hover:bg-[#f1f3f4] text-[#202124] text-sm font-semibold rounded-lg shadow-none focus:ring-0 gap-2">
                <SelectValue placeholder={`All (${combinedPosts.length})`} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#dadce0] text-[#202124] shadow-lg max-h-72">
                <SelectItem value="all">All ({combinedPosts.length})</SelectItem>
                <SelectItem value="published">
                  Published ({combinedPosts.filter((p) => p.status === "published").length})
                </SelectItem>
                <SelectItem value="draft">
                  Drafts ({combinedPosts.filter((p) => p.status === "draft").length})
                </SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag.toLowerCase()}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right actions: MANAGE + Sync + New Post */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setManageMode(!manageMode);
              if (manageMode) setSelectedPosts(new Set());
            }}
            className={`text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              manageMode ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"
            }`}
          >
            <Tag size={15} />
            <span>MANAGE</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await load();
              await refetchLivePosts();
              toast.success("Synchronized all posts!");
            }}
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] text-xs h-8"
            title="Refresh feed"
          >
            <RefreshCw size={13} className="mr-1 text-[#5f6368]" />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSqlOpen(true)}
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] text-xs h-8 hidden sm:flex"
            title="Supabase Database SQL"
          >
            <Database size={13} className="mr-1 text-[#1a73e8]" />
            DB SQL
          </Button>

          <Button
            size="sm"
            onClick={startNew}
            className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs font-medium rounded-full px-4 h-8 shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      {/* Manage Mode Bulk Toolbar */}
      {manageMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f8fbff] border border-[#d2e3fc] rounded-xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#1a73e8]">
              {selectedPosts.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedPosts(new Set(displayedPosts.map((p) => p.id)))}
              className="text-[#5f6368] hover:text-[#1a73e8] font-medium underline"
            >
              Select All ({displayedPosts.length})
            </button>
            {selectedPosts.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPosts(new Set())}
                className="text-[#5f6368] hover:text-[#202124] font-medium underline"
              >
                Clear
              </button>
            )}
          </div>

          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => handleBulkStatus("published")}
                className="h-7 text-xs bg-[#1e8e3e] hover:bg-[#137333] text-white px-3"
              >
                Publish Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus("draft")}
                className="h-7 text-xs border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] px-3"
              >
                Revert to Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="h-7 text-xs border-red-200 text-[#d93025] hover:bg-[#fce8e6] px-3"
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SQL Setup Modal */}
      <Dialog open={sqlOpen} onOpenChange={setSqlOpen}>
        <DialogContent className="max-w-2xl bg-white border border-[#dadce0] text-[#202124]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-[#202124]">
              <Database size={18} className="text-[#1a73e8]" />
              Supabase Database Schema Setup
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[#5f6368]">
            Copy and run this SQL query in your Supabase SQL Editor to configure the posts table.
          </p>
          <div className="relative mt-2">
            <pre className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-xs font-mono text-[#202124] overflow-x-auto max-h-[250px]">
              {getSupabaseSetupSql()}
            </pre>
            <Button
              size="sm"
              onClick={copySql}
              className="absolute top-2 right-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs h-7"
            >
              {copiedSql ? <Check size={13} className="mr-1" /> : <Copy size={13} className="mr-1" />}
              {copiedSql ? "Copied" : "Copy SQL"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blogger Posts List (Matching image.png exactly) */}
      <div className="space-y-3">
        {displayedPosts.length === 0 ? (
          <div className="p-16 text-center text-[#5f6368] bg-white border border-[#dadce0] rounded-xl">
            <p className="text-base font-medium">No posts found</p>
            <p className="text-xs text-[#80868b] mt-1">
              Try searching with another keyword or click &quot;New Post&quot; above to create one.
            </p>
          </div>
        ) : (
          displayedPosts.map((p, idx) => {
            const imgSrc = resolveMediaUrl(p.cover_url || (p as any).image);
            const dateStr = formatBloggerDate(p.published);
            const viewsCount = p.views ?? getViewsCount(p, idx);
            const isSelected = selectedPosts.has(p.id);

            return (
              <div
                key={p.id}
                onClick={() => startEdit(p)}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 bg-white border rounded-xl hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? "border-[#1a73e8] bg-[#f8fbff]" : "border-[#dadce0] hover:border-[#bdc1c6]"
                }`}
              >
                {/* Left side: checkbox (in manage mode) + Thumbnail + Title + Labels */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                  {manageMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(p.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded text-[#1a73e8] border-[#dadce0] focus:ring-0 cursor-pointer"
                    />
                  )}

                  {/* Square thumbnail showing ONLY the post's own photo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-[#f1f3f4] border border-[#e8eaed] shrink-0 flex items-center justify-center relative">
                    {imgSrc ? (
                      <>
                        <img
                          src={imgSrc}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            handleUploadedImageError(
                              e.currentTarget,
                              p.cover_url || (p as any).image,
                              () => {
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.classList.remove("hidden");
                              }
                            )
                          }
                        />
                        <div className="hidden w-full h-full items-center justify-center text-[#9aa0a6]">
                          <ImageIcon size={20} />
                        </div>
                      </>
                    ) : (
                      <ImageIcon size={20} className="text-[#9aa0a6]" />
                    )}
                  </div>

                  {/* Post Title & Meta */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-[15px] font-medium text-[#202124] group-hover:text-[#1a73e8] truncate transition-colors">
                      {p.title}
                    </h3>

                    {/* Sub row: Status + Published date & tag pills */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`text-xs font-normal ${
                          p.status === "draft" ? "text-[#e37400] font-semibold" : "text-[#5f6368]"
                        }`}
                      >
                        {p.status === "draft" ? "Draft" : "Published"} • {dateStr}
                      </span>

                      {/* Tag pill chips matching image.png */}
                      {(p.tags || []).slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Author + Share + Comments + Views + Action buttons */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* Author avatar & name matching image.png */}
                  <div className="hidden md:flex items-center gap-2 text-xs text-[#5f6368]">
                    <span className="font-normal">MD. Shinha Sarder</span>
                    <img
                      src="/profile.webp"
                      alt="MD. Shinha Sarder"
                      className="w-6 h-6 rounded-full object-cover border border-[#dadce0]"
                    />
                  </div>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `https://mdshinhasarder.com${postPath(p)}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Post link copied to clipboard!");
                    }}
                    title="Share post"
                    className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                  >
                    <Share2 size={16} />
                  </button>

                  {/* Comments count */}
                  <div className="flex items-center gap-1 text-xs text-[#5f6368]">
                    <MessageSquare size={15} />
                    <span>0</span>
                  </div>

                  {/* Views count */}
                  <div className="flex items-center gap-1 text-xs text-[#5f6368] min-w-[32px]">
                    <BarChart2 size={16} />
                    <span>{viewsCount}</span>
                  </div>

                  {/* Quick Action Buttons (always reachable on mobile, hover on desktop) */}
                  <div className="flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-1 border-l border-[#f1f3f4]">
                    <Link
                      to={postPath(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                      title="View on website"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(p);
                      }}
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => remove(p, e)}
                      className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL-SCREEN DEVICE EDITOR WINDOW (Mobile & PC responsive) */}
      {open && editing && (
        <div className="fixed inset-0 z-50 bg-[#ffffff] flex flex-col w-screen h-[100dvh] overflow-hidden animate-in fade-in duration-150">
          {/* Top Full Device Bar */}
          <header className="h-14 sm:h-16 bg-white border-b border-[#dadce0] px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 shadow-xs select-none">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors shrink-0"
                title="Back to posts"
              >
                <ArrowLeft size={20} />
              </button>
              <img
                src="/images/site-logo.png"
                onError={(e) => {
                  if (!e.currentTarget.dataset.triedFallback) {
                    e.currentTarget.dataset.triedFallback = "1";
                    e.currentTarget.src = "/site-logo.png";
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
                alt="Site Logo"
                className="w-8 h-8 rounded-full object-cover border border-orange-500/40 shrink-0 hidden sm:block"
              />
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-semibold text-[#202124] truncate">
                  {editing.id ? (editing.title || "Edit Post") : "New Post"}
                </div>
                <div className="text-xs text-[#5f6368] flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      editing.status === "published" ? "bg-[#1e8e3e]" : "bg-[#f9ab00]"
                    }`}
                  />
                  <span className="capitalize">{editing.status}</span>
                  {editing.slug && <span className="truncate hidden sm:inline">• /{editing.slug}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {editing.slug && (
                <Link
                  to={postPath(editing as any)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                  title="Preview on website"
                >
                  <ExternalLink size={14} />
                  <span>Preview</span>
                </Link>
              )}

              <Select
                value={editing.status}
                onValueChange={(v) => setEditing({ ...editing, status: v as any })}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs border-[#dadce0] bg-white text-[#202124] min-w-[90px] sm:min-w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dadce0] text-[#202124]">
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={save}
                disabled={saving}
                className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs sm:text-sm font-medium rounded-full px-4 sm:px-6 h-8 sm:h-9 shadow-sm flex items-center gap-1.5"
              >
                <Check size={16} />
                <span>{saving ? "Publishing..." : "Publish Post"}</span>
              </Button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full ml-1"
                title="Close editor"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Full Screen Scrollable Canvas + Sidebar (scrolls smoothly on both Mobile & PC) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#f8f9fa]">
            {/* Main Rich Content Area */}
            <div className="lg:flex-1 lg:overflow-y-auto p-3 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-[#dadce0] shadow-sm">
                <div>
                  <Input
                    value={editing.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Title..."
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202124] placeholder-[#80868b] border-0 border-b border-[#dadce0] rounded-none px-0 py-2 focus-visible:ring-0 shadow-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#5f6368] font-mono bg-[#f8f9fa] p-2.5 rounded-lg border border-[#e8eaed]">
                  <span className="font-semibold text-[#202124]">Permalink:</span>
                  <span className="truncate">https://mdshinhasarder.com/post/</span>
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="bg-transparent border-b border-dashed border-[#5f6368] outline-none flex-1 min-w-[140px] text-[#1a73e8]"
                    placeholder="slug-url"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#5f6368] mb-1.5 block">
                    Excerpt / Short Summary
                  </Label>
                  <Textarea
                    rows={2}
                    value={editing.excerpt || ""}
                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence overview for search cards"
                    className="bg-white border-[#dadce0] text-sm text-[#202124]"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#dadce0]">
                    <div className="flex items-center gap-1 bg-[#f1f3f4] p-1 rounded-lg border border-[#dadce0]">
                      <button
                        type="button"
                        onClick={() => setViewMode("compose")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          viewMode === "compose"
                            ? "bg-white text-[#1a73e8] shadow-xs"
                            : "text-[#5f6368] hover:text-[#202124]"
                        }`}
                      >
                        <Pencil size={13} />
                        <span>Compose View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("html")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          viewMode === "html"
                            ? "bg-white text-[#d93025] shadow-xs"
                            : "text-[#5f6368] hover:text-[#202124]"
                        }`}
                      >
                        <Code size={13} />
                        <span>HTML View (&lt;&gt;)</span>
                      </button>
                    </div>

                    {viewMode === "html" ? (
                      <div className="flex items-center gap-1 text-xs text-[#5f6368] overflow-x-auto py-1">
                        <span className="font-semibold text-[#202124] text-[11px] mr-1">Insert HTML:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = '<div class="custom-card">\n  <h3>Section Heading</h3>\n  <p>Your custom content goes here...</p>\n</div>\n';
                            setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                            toast.success("Inserted Div Card HTML");
                          }}
                          className="px-2 py-0.5 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[11px] font-mono text-[#1a73e8]"
                        >
                          + Div Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = '<iframe width="100%" height="380" src="https://www.youtube.com/embed/VIDEO_ID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n';
                            setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                            toast.success("Inserted YouTube Iframe HTML");
                          }}
                          className="px-2 py-0.5 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[11px] font-mono text-[#d93025]"
                        >
                          + Iframe Embed
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = '<blockquote class="border-l-4 border-blue-600 pl-4 py-2 italic my-4">\n  <p>"Inspirational quote or highlighted note here"</p>\n</blockquote>\n';
                            setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                            toast.success("Inserted Blockquote HTML");
                          }}
                          className="px-2 py-0.5 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[11px] font-mono text-[#1e8e3e]"
                        >
                          + Blockquote
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = '<a href="https://mdshinhasarder.com" target="_blank" rel="noopener noreferrer" class="custom-btn">\n  Click Here &rarr;\n</a>\n';
                            setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                            toast.success("Inserted Link Button HTML");
                          }}
                          className="px-2 py-0.5 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[11px] font-mono text-[#7b1fa2]"
                        >
                          + Button Link
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#1a73e8] font-medium hidden sm:inline">
                        Visual Editor • Click &quot;HTML View&quot; to edit raw HTML code
                      </span>
                    )}
                  </div>

                  {viewMode === "compose" ? (
                    <div className="min-h-[420px] sm:min-h-[500px]">
                      <TipTapEditor
                        content={editing.content}
                        onChange={(html) => setEditing({ ...editing, content: html })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#5f6368] px-1 font-mono">
                        <span>Raw HTML Code Editor (Type or paste full HTML tags below):</span>
                        <span>{(editing.content || "").length} characters</span>
                      </div>
                      <Textarea
                        rows={22}
                        value={editing.content || ""}
                        onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                        placeholder="<p>Write or paste your custom HTML tags, embed codes, iframes, styles, and markup here...</p>"
                        className="w-full font-mono text-xs sm:text-sm bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl border border-[#333333] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] min-h-[450px] leading-relaxed selection:bg-[#264f78]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Settings Sidebar */}
            <div className="w-full lg:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-[#dadce0] p-4 sm:p-5 lg:overflow-y-auto space-y-6">
              <h4 className="text-sm font-bold text-[#202124] uppercase tracking-wider pb-2 border-b border-[#f1f3f4] flex items-center gap-2">
                <FileText size={16} className="text-[#1a73e8]" />
                <span>Post Settings</span>
              </h4>

              {/* Direct Photo Upload Box — displays ONLY the uploaded photo */}
              <PhotoUploadBox
                label="Post Photo Upload"
                description="Upload a photo — only the photo you upload is saved and displayed."
                value={editing.cover_url || ""}
                onUploadSuccess={(res) => {
                  setEditing({ ...editing, cover_url: res.domainUrl });
                }}
                onApply={(domainUrl) => {
                  setEditing({ ...editing, cover_url: domainUrl });
                }}
                onClear={() => setEditing({ ...editing, cover_url: "" })}
              />

              <div>
                <Label className="text-xs font-semibold text-[#5f6368]">Photo URL (Optional)</Label>
                <Input
                  value={editing.cover_url || ""}
                  onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                  placeholder="https://mdshinhasarder.com/images/..."
                  className="bg-white border-[#dadce0] text-[#202124] font-mono text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#5f6368]">Labels / Tags</Label>
                <Input
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="e.g. Song, Latest, News, Technology"
                  className="bg-white border-[#dadce0] text-[#202124] mt-1 text-xs"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {["Song", "Latest", "News", "Technology", "Entrepreneur", "Music"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const current = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
                        if (!current.includes(preset)) {
                          setTagsStr([...current, preset].join(", "));
                        }
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed] transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#f1f3f4]">
                <h5 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  SEO Search Metadata
                </h5>
                <div>
                  <Label className="text-xs font-semibold text-[#5f6368]">Custom SEO Title</Label>
                  <Input
                    value={editing.seo_title || ""}
                    onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                    placeholder="Custom SEO Title"
                    className="bg-white border-[#dadce0] text-[#202124] mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#5f6368]">SEO Description</Label>
                  <Textarea
                    rows={2}
                    value={editing.seo_description || ""}
                    onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                    placeholder="Custom Google meta description"
                    className="bg-white border-[#dadce0] text-[#202124] mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Extra Custom HTML & Embed Code Section */}
              <div className="space-y-2.5 pt-3 border-t border-[#f1f3f4]">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                    <Code size={14} className="text-[#1a73e8]" />
                    <span>Extra HTML &amp; Embeds</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("html");
                      toast.info("Switched to HTML View — paste custom HTML tags anytime!");
                    }}
                    className="text-[11px] font-semibold text-[#1a73e8] hover:underline"
                  >
                    Open HTML View
                  </button>
                </div>
                <p className="text-[11px] text-[#5f6368] leading-normal">
                  Write or paste custom HTML code, iframes, audio players, or widgets. You can switch between Compose View and HTML View anytime.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const snippet = '<div class="alert-box bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm my-3">\n  <strong>Note:</strong> Custom notice message here.\n</div>\n';
                      setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                      toast.success("Appended Notice Alert HTML to post!");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#1a73e8] font-medium"
                  >
                    + Notice Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const snippet = '<div class="video-container my-4">\n  <iframe width="100%" height="400" src="https://www.youtube.com/embed/YOUR_VIDEO_ID" title="YouTube video" frameborder="0" allowfullscreen></iframe>\n</div>\n';
                      setEditing({ ...editing, content: (editing.content || "") + "\n" + snippet });
                      toast.success("Appended Video Embed HTML to post!");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#d93025] font-medium"
                  >
                    + Video Embed
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f1f3f4]">
                <Button
                  onClick={save}
                  disabled={saving}
                  className="w-full bg-[#e37400] hover:bg-[#d56b00] text-white font-medium py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>{saving ? "Publishing Post..." : "Save & Publish Post"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsAdmin;
