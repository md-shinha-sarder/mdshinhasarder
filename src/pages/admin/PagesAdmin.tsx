import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Rss,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  X,
  Check,
  FileText,
  Copy,
  FolderSync,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import { MediaMultiPicker } from "@/components/admin/MediaPicker";
import { PhotoUploadBox } from "@/components/admin/PhotoUploadBox";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePages } from "@/hooks/usePosts";
import { Link } from "react-router-dom";
import { TipTapEditor } from "@/components/editor/TipTapEditor";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  cover_url: string | null;
  images: string[];
  seo_title: string | null;
  seo_description: string | null;
  status: string;
}

const blank: Page = {
  id: "",
  slug: "",
  title: "",
  content: "",
  cover_url: "",
  images: [],
  seo_title: "",
  seo_description: "",
  status: "published",
};

export const PagesAdmin = () => {
  const { pages: bloggerPages, refetch: refetchPages } = usePages();
  const [items, setItems] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | null>(null);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"compose" | "html">("compose");

  const load = async () => {
    try {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });
      setItems(((data as any[]) || []).map((p) => ({ ...p, images: p.images || [] })));
    } catch {
      // Table may not exist yet
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Lock body scroll when full-screen device window is open
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
    if (!editing.title.trim()) return toast.error("Please enter a page title.");
    const finalSlug = (editing.slug || slugify(editing.title)).trim();
    if (!finalSlug) return toast.error("Please enter a URL slug.");

    setSaving(true);
    try {
      const payload = {
        slug: finalSlug,
        title: editing.title.trim(),
        content: editing.content || "",
        cover_url: editing.cover_url || null,
        images: editing.images || [],
        seo_title: editing.seo_title || null,
        seo_description: editing.seo_description || null,
        status: editing.status,
      };

      const { error } = editing.id
        ? await supabase.from("pages").update(payload).eq("id", editing.id)
        : await supabase.from("pages").insert(payload);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Page saved and published successfully!");
        setOpen(false);
        load();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Page deleted");
        load();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete page");
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Top Header matching Blogger style */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <Copy size={20} className="text-[#e37400]" />
            <span>Pages</span>
          </h1>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Manage Blogger synced pages &amp; custom site pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={handleSyncPages}
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] text-xs h-8"
          >
            <RefreshCw size={13} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Pages"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditing({ ...blank });
              setOpen(true);
            }}
            className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs font-medium rounded-full px-4 h-8 shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>New Page</span>
          </Button>
        </div>
      </div>

      {/* Pages Tabs */}
      <Tabs defaultValue="blogger" className="w-full">
        <TabsList className="bg-white border border-[#dadce0] p-1 h-auto rounded-lg">
          <TabsTrigger
            value="blogger"
            className="data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025] text-xs font-medium py-1.5 px-3 rounded-md"
          >
            <Rss size={13} className="mr-1.5" /> Blogger Pages ({bloggerPages.length})
          </TabsTrigger>
          <TabsTrigger
            value="db"
            className="data-[state=active]:bg-[#feefe3] data-[state=active]:text-[#d93025] text-xs font-medium py-1.5 px-3 rounded-md"
          >
            Custom Pages ({items.length})
          </TabsTrigger>
        </TabsList>

        {/* Custom Pages Tab */}
        <TabsContent value="db" className="mt-4">
          <div className="bg-white border border-[#dadce0] rounded-xl divide-y divide-[#f1f3f4] overflow-hidden shadow-xs">
            {items.length === 0 ? (
              <div className="p-12 text-center text-[#5f6368]">
                <p className="text-sm font-medium">No custom pages created yet.</p>
                <p className="text-xs text-[#80868b] mt-1">
                  Click &quot;New Page&quot; above to create a full custom page.
                </p>
              </div>
            ) : (
              items.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                  className="flex items-center justify-between p-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#f1f3f4] border border-[#e8eaed] overflow-hidden shrink-0 flex items-center justify-center">
                      {p.cover_url ? (
                        <img
                          src={resolveMediaUrl(p.cover_url)}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/profile.webp";
                          }}
                        />
                      ) : (
                        <FileText size={20} className="text-[#5f6368]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-sm text-[#202124] truncate flex items-center gap-2">
                        <span>{p.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8eaed] text-[#5f6368] font-normal uppercase">
                          {p.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#5f6368] truncate mt-0.5 font-mono">
                        /p/{p.slug}.html
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/p/${p.slug}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                      title="View page"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Blogger Pages Tab */}
        <TabsContent value="blogger" className="mt-4">
          <div className="bg-white border border-[#dadce0] rounded-xl divide-y divide-[#f1f3f4] overflow-hidden shadow-xs">
            {bloggerPages.length === 0 ? (
              <div className="p-12 text-center text-[#5f6368]">
                <p className="text-sm font-medium">No Blogger pages loaded.</p>
                <p className="text-xs text-[#80868b] mt-1">
                  Click &quot;Sync Pages&quot; to fetch the latest pages from Blogger.
                </p>
              </div>
            ) : (
              bloggerPages.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 hover:bg-[#f8f9fa] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#f1f3f4] border border-[#e8eaed] overflow-hidden shrink-0 flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={resolveMediaUrl(p.image)}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/profile.webp";
                          }}
                        />
                      ) : (
                        <FileText size={20} className="text-[#5f6368]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-sm text-[#202124] truncate flex items-center gap-2">
                        <span>{p.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#feefe3] text-[#d93025] font-normal uppercase">
                          Blogger
                        </span>
                      </div>
                      <div className="text-xs text-[#5f6368] truncate mt-0.5 font-mono">
                        /p/{p.slug}.html
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`/p/${p.slug}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                      title="View live page"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FULL-SCREEN DEVICE EDITOR WINDOW FOR PAGES (Device under a full) */}
      {open && editing && (
        <div className="fixed inset-0 z-50 bg-[#ffffff] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
          {/* Top Full Device Bar */}
          <header className="h-14 sm:h-16 bg-white border-b border-[#dadce0] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs select-none">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors"
                title="Back to pages"
              >
                <ArrowLeft size={20} />
              </button>
              <img
                src="/images/site-logo.png"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
                alt="Site Logo"
                className="w-8 h-8 rounded-full object-cover border border-orange-500/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-semibold text-[#202124] truncate">
                  {editing.id ? (editing.title || "Edit Page") : "New Page"}
                </div>
                <div className="text-xs text-[#5f6368] flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      editing.status === "published" ? "bg-[#1e8e3e]" : "bg-[#f9ab00]"
                    }`}
                  />
                  <span className="capitalize">{editing.status}</span>
                  {editing.slug && <span className="truncate hidden sm:inline">• /p/{editing.slug}.html</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {editing.slug && (
                <Link
                  to={`/p/${editing.slug}.html`}
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
                onValueChange={(v) => setEditing({ ...editing, status: v })}
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
                <span>{saving ? "Publishing..." : "Publish Page"}</span>
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

          {/* Full Screen Scrollable Canvas + Sidebar */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#f8f9fa]">
            {/* Main Content Writing Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#dadce0] shadow-sm">
                <div>
                  <Input
                    value={editing.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Page Title..."
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202124] placeholder-[#80868b] border-0 border-b border-[#dadce0] rounded-none px-0 py-2 focus-visible:ring-0 shadow-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#5f6368] font-mono bg-[#f8f9fa] p-2.5 rounded-lg border border-[#e8eaed]">
                  <span className="font-semibold text-[#202124]">Permalink:</span>
                  <span>https://mdshinhasarder.com/p/</span>
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="bg-transparent border-b border-dashed border-[#5f6368] outline-none flex-1 text-[#1a73e8]"
                    placeholder="page-slug"
                  />
                  <span>.html</span>
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
            <div className="w-full lg:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-[#dadce0] p-5 lg:overflow-y-auto space-y-6">
              <h4 className="text-sm font-bold text-[#202124] uppercase tracking-wider pb-2 border-b border-[#f1f3f4] flex items-center gap-2">
                <FileText size={16} className="text-[#1a73e8]" />
                <span>Page Settings</span>
              </h4>

              {/* Photo Upload Box for Page */}
              <PhotoUploadBox
                label="Page Cover Photo Upload Box"
                description="Upload photo directly to /images/ folder — automatically generates domain link and applies as page cover."
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
                applyButtonLabel="Apply as Cover Photo"
              />

              <div>
                <Label className="text-xs font-semibold text-[#5f6368]">Cover Image URL</Label>
                <Input
                  value={editing.cover_url || ""}
                  onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                  placeholder="https://mdshinhasarder.com/images/..."
                  className="bg-white border-[#dadce0] text-[#202124] font-mono text-xs mt-1"
                />
                {editing.cover_url && (
                  <div className="mt-2 p-2 rounded-lg border border-[#e8eaed] bg-[#f8f9fa] flex items-center gap-3">
                    <img
                      src={resolveMediaUrl(editing.cover_url)}
                      alt="Cover Preview"
                      className="w-14 h-14 object-cover rounded border border-[#dadce0] shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "/profile.webp";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1e8e3e]">Active Cover Photo</div>
                      <div className="text-[11px] font-mono text-[#5f6368] truncate">{editing.cover_url}</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <MediaMultiPicker
                  label="Additional Page Media"
                  value={editing.images}
                  onChange={(imgs) => setEditing({ ...editing, images: imgs })}
                />
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
                      toast.success("Appended Notice Alert HTML to page!");
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
                      toast.success("Appended Video Embed HTML to page!");
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
                  <span>{saving ? "Publishing Page..." : "Save & Publish Page"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesAdmin;
