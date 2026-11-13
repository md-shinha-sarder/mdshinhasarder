import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Send, ExternalLink, RefreshCw, Zap, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePosts } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { useHomeSections, HOME_SECTIONS } from "@/hooks/useHomeSections";
import { buildSeo } from "@/lib/seo";
import { toast } from "sonner";

const FN = "https://ihegjzwlvthfqwredssj.supabase.co/functions/v1";

interface Check { ok: boolean; warn?: boolean; label: string; detail?: string }

const check = (post: ReturnType<typeof usePosts>["posts"][number]): Check[] => {
  const seo = buildSeo(post);
  const descLen = seo.metaDescription.length;
  const titleLen = seo.metaTitle.length;
  const heads = post.title.length;
  const hasImage = !!post.image;
  const date = post.published ? new Date(post.published).toString() !== "Invalid Date" : false;
  const tags = (post.tags || []).length > 0;
  const slugOk = /^[a-z0-9-]+$/.test(post.slug);
  const canonicalOk = /^https:\/\/mdshinhasarder\.com\/\d{4}\/\d{2}\/[a-z0-9-]+\.html$/.test(seo.canonical);
  // Inline image audit
  const imgs = [...(post.content || "").matchAll(/<img\b([^>]*)>/gi)].map((m) => m[1]);
  const total = imgs.length;
  const missingAlt = imgs.filter((a) => !/\balt\s*=\s*["'][^"']+["']/i.test(a)).length;
  const missingSrc = imgs.filter((a) => !/\bsrc\s*=\s*["'][^"']+["']/i.test(a)).length;
  // After enhanceContentImages runs at render time width/height are always added,
  // but we still flag raw HTML missing dims so the source can be improved.
  const missingDims = imgs.filter((a) => !/\bwidth\s*=/i.test(a) || !/\bheight\s*=/i.test(a)).length;
  return [
    { ok: heads > 0 && heads <= 110, label: `Headline length (${heads}/110)` },
    { ok: titleLen > 0 && titleLen <= 60, warn: titleLen > 60, label: `Meta title length (${titleLen}/60)`, detail: titleLen > 60 ? "Truncated by Google" : "OK" },
    { ok: descLen >= 60 && descLen <= 160, warn: descLen > 0 && (descLen < 60 || descLen > 160), label: `Meta description (${descLen}/160)`, detail: !descLen ? "Missing" : descLen < 60 ? "Too short" : descLen > 160 ? "Too long" : "OK" },
    { ok: !!seo.ogTitle && !!seo.ogDescription, label: "OG / Twitter tags generated" },
    { ok: canonicalOk, label: "Canonical URL valid", detail: canonicalOk ? "OK" : seo.canonical },
    { ok: hasImage, label: "Featured image present" },
    { ok: missingSrc === 0, label: `Image src valid (${total - missingSrc}/${total})`, detail: missingSrc ? `${missingSrc} broken` : "OK" },
    { ok: missingAlt === 0, warn: missingAlt > 0 && missingAlt < total, label: `Image alt text (${total - missingAlt}/${total})`, detail: missingAlt ? "Auto-filled at render" : "OK" },
    { ok: missingDims === 0, warn: missingDims > 0, label: `Image dimensions (${total - missingDims}/${total})`, detail: missingDims ? "Auto-added at render" : "OK" },
    { ok: date, label: "Valid publish date" },
    { ok: tags, warn: !tags, label: "Keywords / tags" },
    { ok: slugOk, label: "Clean slug format" },
  ];
};

const NewsCheckAdmin = () => {
  const { posts, loading, refetch } = usePosts();
  const { sections, setSection, reset } = useHomeSections();
  const [busy, setBusy] = useState<string | null>(null);
  const [auditedAt, setAuditedAt] = useState<Date | null>(null);
  const [reindexProgress, setReindexProgress] = useState<{ done: number; total: number } | null>(null);

  const summary = useMemo(() => {
    let pass = 0, warn = 0, fail = 0;
    posts.forEach((p) => check(p).forEach((c) => c.ok ? pass++ : c.warn ? warn++ : fail++));
    return { pass, warn, fail };
  }, [posts, auditedAt]);

  const ping = async (url?: string) => {
    setBusy(url || "all");
    try {
      const r = await fetch(`${FN}/ping-indexing${url ? `?url=${encodeURIComponent(url)}` : ""}`);
      const j = await r.json();
      console.log("ping", j);
      toast.success(url ? "Pinged search engines for this URL" : "Pinged sitemaps");
    } catch {
      toast.error("Ping failed");
    } finally { setBusy(null); }
  };

  const rerun = async () => {
    setBusy("rerun");
    try {
      await refetch();
      setAuditedAt(new Date());
      toast.success("Re-audited all posts");
    } catch { toast.error("Re-audit failed"); } finally { setBusy(null); }
  };

  const reindexAll = async () => {
    setBusy("reindex");
    setReindexProgress({ done: 0, total: posts.length + 1 });
    try {
      await fetch(`${FN}/ping-indexing`);
      setReindexProgress({ done: 1, total: posts.length + 1 });
      let done = 1;
      const batch = 5;
      for (let i = 0; i < posts.length; i += batch) {
        const slice = posts.slice(i, i + batch);
        await Promise.all(slice.map((p) =>
          fetch(`${FN}/ping-indexing?url=${encodeURIComponent(`https://mdshinhasarder.com${postPath(p)}`)}`).catch(() => {})
        ));
        done += slice.length;
        setReindexProgress({ done, total: posts.length + 1 });
      }
      toast.success(`Re-indexed ${posts.length} URLs + sitemaps`);
    } catch { toast.error("Reindex failed"); } finally {
      setBusy(null);
      setTimeout(() => setReindexProgress(null), 2500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124]">Layout &amp; SEO Audit</h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">Toggle homepage sections, verify schema metadata, and ping search sitemaps.</p>
          {auditedAt && <p className="text-[11px] text-[#80868b] mt-1">Last audit: {auditedAt.toLocaleTimeString()}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={rerun} disabled={busy !== null} variant="outline" size="sm" className="gap-1.5 border-[#dadce0] text-[#3c4043] h-8 text-xs"><RefreshCw size={13} className={busy === "rerun" ? "animate-spin" : ""} /> Re-run check</Button>
          <Button onClick={reindexAll} disabled={busy !== null} size="sm" className="gap-1.5 bg-[#e37400] hover:bg-[#d56b00] text-white h-8 text-xs rounded-full px-4"><Zap size={13} /> One-click reindex</Button>
        </div>
      </div>

      {reindexProgress && (
        <div className="p-3 rounded-lg border border-[#d2e3fc] bg-[#e8f0fe]">
          <div className="flex justify-between text-xs mb-1.5 text-[#1a73e8] font-medium"><span>Reindexing…</span><span>{reindexProgress.done}/{reindexProgress.total}</span></div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden"><div className="h-full bg-[#1a73e8] transition-all" style={{ width: `${(reindexProgress.done / reindexProgress.total) * 100}%` }} /></div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#dadce0] bg-white"><div className="text-xs text-[#5f6368]">Posts</div><div className="text-2xl font-bold text-[#202124]">{posts.length}</div></div>
        <div className="p-4 rounded-xl border border-[#ceead6] bg-[#e6f4ea]/60"><div className="text-xs text-[#137333] font-medium">Passing</div><div className="text-2xl font-bold text-[#137333]">{summary.pass}</div></div>
        <div className="p-4 rounded-xl border border-[#fde293] bg-[#fef7e0]/60"><div className="text-xs text-[#b06000] font-medium">Warnings</div><div className="text-2xl font-bold text-[#b06000]">{summary.warn}</div></div>
        <div className="p-4 rounded-xl border border-red-200 bg-[#fce8e6]/60"><div className="text-xs text-[#d93025] font-medium">Failing</div><div className="text-2xl font-bold text-[#d93025]">{summary.fail}</div></div>
      </div>

      <div className="p-4 sm:p-5 rounded-xl border border-[#dadce0] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-[#202124] flex items-center gap-2"><LayoutGrid size={16} className="text-[#e37400]" /> Homepage Sections (Mobile &amp; PC)</h2>
          <Button size="sm" variant="ghost" onClick={reset} className="h-7 text-xs text-[#5f6368]">Reset</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {HOME_SECTIONS.map((s) => (
            <label key={s.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-[#dadce0] bg-[#f8f9fa] cursor-pointer">
              <span className="text-xs sm:text-sm font-medium text-[#202124]">{s.label}</span>
              <Switch checked={!!sections[s.key]} onCheckedChange={(v) => setSection(s.key, v)} />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => ping()} disabled={busy === "all"} variant="outline" className="gap-2"><Send size={14} /> Ping sitemaps only</Button>
        <a href="/sitemap-index.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> sitemap-index.xml</a>
        <a href="/post-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> post-sitemap.xml</a>
        <a href="/category-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> category-sitemap.xml</a>
        <a href="/tag-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> tag-sitemap.xml</a>
        <a href="/page-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> page-sitemap.xml</a>
        <a href="/news-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> news-sitemap.xml</a>
        <a href="/video-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> video-sitemap.xml</a>
        <a href="/image-sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary"><ExternalLink size={12} /> image-sitemap.xml</a>
      </div>



      {loading && <div className="text-sm text-muted-foreground">Loading posts…</div>}

      <div className="space-y-3">
        {posts.map((p) => {
          const checks = check(p);
          const fails = checks.filter((c) => !c.ok && !c.warn).length;
          const warns = checks.filter((c) => c.warn).length;
          return (
            <div key={p.id} className="p-4 rounded-xl border border-border bg-card/40">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <Link to={postPath(p)} className="font-serif font-semibold hover:text-primary line-clamp-1">{p.title}</Link>
                  <div className="text-xs text-muted-foreground mt-0.5">{new Date(p.published).toLocaleDateString()} · /{p.slug}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${fails ? "bg-rose-500/15 text-rose-400" : warns ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    {fails ? `${fails} fail` : warns ? `${warns} warn` : "Eligible"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => ping(`https://mdshinhasarder.com${postPath(p)}`)} disabled={busy !== null} className="gap-1 h-7"><Send size={12} /> Ping</Button>
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-1.5 text-xs">
                {checks.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {c.ok ? <CheckCircle2 size={13} className="text-emerald-400" /> : c.warn ? <AlertTriangle size={13} className="text-amber-400" /> : <XCircle size={13} className="text-rose-400" />}
                    <span className="text-muted-foreground">{c.label}</span>
                    {c.detail && <span className="text-[10px] text-muted-foreground/70">· {c.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsCheckAdmin;
