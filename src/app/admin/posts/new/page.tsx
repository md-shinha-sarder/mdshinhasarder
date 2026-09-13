"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Tag,
  Hash,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { toast } from "sonner";

export default function NewPostPage() {
  const router = useRouter();

  // Post form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("<p>Start writing your blog post here...</p>");
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("Technology");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Auto-generate clean slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      toast.error("Please provide a post title.");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Post content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const categories = categoriesInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        content,
        excerpt: excerpt || null,
        coverUrl: coverUrl || null,
        tags,
        categories,
        status: targetStatus,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || null,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create post");
      }

      toast.success(
        targetStatus === "PUBLISHED"
          ? "Post published successfully to the Edge!"
          : "Draft saved successfully."
      );

      // Redirect to posts list
      router.push("/admin/posts");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
              New Blog Article
            </h1>
            <p className="text-xs text-muted-foreground">
              TipTap Edge Editor with Instant Formatting & Highlight Styling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="gap-1.5 border-border/80 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
          >
            <Eye size={15} />
            <span>{isPreviewOpen ? "Editor Mode" : "Preview"}</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT")}
            className="gap-1.5 text-xs font-medium"
          >
            <Save size={15} />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSubmit("PUBLISHED")}
            className="gap-1.5 bg-gradient-gold text-primary-foreground text-xs font-medium shadow-gold hover:opacity-95"
          >
            <Send size={15} />
            <span>{isSubmitting ? "Publishing..." : "Publish Post"}</span>
          </Button>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Title */}
          <div className="space-y-2">
            <Label htmlFor="post-title" className="text-sm font-medium text-foreground">
              Post Title <span className="text-amber-400">*</span>
            </Label>
            <Input
              id="post-title"
              placeholder="e.g. Master Edge Computing on Cloudflare Pages"
              value={title}
              onChange={handleTitleChange}
              className="text-lg font-serif py-6 px-4 bg-card/60 border-border/80 focus-visible:ring-amber-400/50"
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="post-slug" className="text-xs text-muted-foreground">
                Permalink Slug
              </Label>
              <span className="text-[11px] font-mono text-amber-400/80">
                https://mdshinhasarder.com/post/{slug || "your-slug"}
              </span>
            </div>
            <Input
              id="post-slug"
              placeholder="url-slug-format"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-xs bg-card/40 border-border/60"
            />
          </div>

          {/* TipTap Rich Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Article Body (TipTap Rich Editor)
              </Label>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <Sparkles size={12} /> Highlights & Links styled in Gold Accent
              </span>
            </div>

            {isPreviewOpen ? (
              <div className="p-6 rounded-xl border border-border/80 bg-card/60 min-h-[350px]">
                <div className="text-xs uppercase font-mono text-amber-400 mb-2">Live Preview</div>
                <h2 className="text-2xl font-serif font-bold mb-4">{title || "Untitled Post"}</h2>
                <div
                  className="prose prose-invert max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : (
              <TipTapEditor content={content} onChange={setContent} />
            )}
          </div>

          {/* Short Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="post-excerpt" className="text-sm font-medium text-foreground">
              Excerpt & Summary
            </Label>
            <Textarea
              id="post-excerpt"
              rows={3}
              placeholder="A brief 1-2 sentence hook for cards, RSS feeds, and social share previews..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-card/40 border-border/60 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Metadata, Cover, SEO */}
        <div className="space-y-6">
          {/* Publishing Settings Box */}
          <div className="p-5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-serif font-bold text-sm text-foreground">Publishing Meta</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/30">
                Cloudflare Edge
              </span>
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="cover-url" className="text-xs flex items-center gap-1.5">
                <ImageIcon size={14} className="text-amber-400" />
                <span>Featured Image URL</span>
              </Label>
              <Input
                id="cover-url"
                placeholder="https://images.unsplash.com/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="text-xs bg-background/50 border-border/60"
              />
              {coverUrl && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-border/60 aspect-video">
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label htmlFor="post-categories" className="text-xs flex items-center gap-1.5">
                <Hash size={14} className="text-amber-400" />
                <span>Categories (comma separated)</span>
              </Label>
              <Input
                id="post-categories"
                placeholder="Technology, Engineering, Tutorial"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                className="text-xs bg-background/50 border-border/60"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="post-tags" className="text-xs flex items-center gap-1.5">
                <Tag size={14} className="text-amber-400" />
                <span>Tags (comma separated)</span>
              </Label>
              <Input
                id="post-tags"
                placeholder="Next.js, Edge, Cloudflare, Prisma"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="text-xs bg-background/50 border-border/60"
              />
            </div>
          </div>

          {/* SEO & Social Card */}
          <div className="p-5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-serif font-bold text-sm text-foreground">SEO Optimization</h3>
              <Globe size={15} className="text-amber-400" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-title" className="text-xs">
                Meta Title
              </Label>
              <Input
                id="seo-title"
                placeholder={title || "SEO optimized title"}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="text-xs bg-background/50 border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-desc" className="text-xs">
                Meta Description
              </Label>
              <Textarea
                id="seo-desc"
                rows={3}
                placeholder={excerpt || "Search engine description (150-160 characters)"}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="text-xs bg-background/50 border-border/60"
              />
            </div>

            {/* Link highlight helper note */}
            <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/25 text-xs text-amber-300 space-y-1">
              <div className="font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> Link Highlight Styling Active
              </div>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                All hyperlinks inside your published posts automatically receive the golden highlight accent with smooth hover transitions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
