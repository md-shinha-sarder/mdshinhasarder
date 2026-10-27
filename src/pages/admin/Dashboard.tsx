import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Newspaper, Image, Rss, Cpu, ArrowRight, Zap, FolderSync, Globe, Copy, Check, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { usePosts, usePages } from "@/hooks/usePosts";
import { Link } from "react-router-dom";
import { postPath } from "@/lib/postUrl";
import { syncAllPhotosToImagesFolder } from "@/lib/syncAllPhotos";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { PhotoUploadBox } from "@/components/admin/PhotoUploadBox";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [stats, setStats] = useState({ pages: 0, posts: 0, media: 0 });
  const { posts: bloggerPosts, refetch: refetchPosts } = usePosts();
  const { pages: bloggerPages } = usePages();

  // Photo Sync & Domain Link Creator State
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, po, m] = await Promise.all([
        supabase.from("pages").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("media").select("*", { count: "exact", head: true }),
      ]);
      setStats({ pages: p.count || 0, posts: po.count || 0, media: m.count || 0 });
    })();
  }, []);

  const bloggerPhotoCount = bloggerPosts.filter((p) => p.image).length;

  const cards = [
    { label: "Pages (DB)", value: stats.pages, icon: FileText },
    { label: "Posts (DB)", value: stats.posts, icon: Newspaper },
    { label: "Media (DB)", value: stats.media, icon: Image },
    { label: "Blogger Posts", value: bloggerPosts.length, icon: Rss },
    { label: "Blogger Pages", value: bloggerPages.length, icon: Rss },
    { label: "Blogger Photos", value: bloggerPhotoCount, icon: Image },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your site content, media, SEO, and theme. Blogger content is auto-synced.</p>
        </div>
        <Link
          to="/admin/tech-version"
          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium flex items-center gap-2 transition-all w-fit"
        >
          <Cpu size={16} className="text-blue-400" />
          <span>Tech &amp; CMS Versions</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Auto-Version Quick Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Full-Stack Core Architecture &amp; Auto-Update Engine</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Powered by <span className="text-blue-300 font-medium">Next.js + React + Java + Python + Node.js</span> (85% core coverage). One-click auto updates all technologies &amp; CMS to latest releases.
            </p>
          </div>
        </div>
        <Link
          to="/admin/tech-version"
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 shrink-0 transition-colors"
        >
          Manage &amp; Auto-Update Versions
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-gradient-card border border-border rounded-xl p-4 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">{c.label}</span>
              <c.icon size={18} className="text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Auto Domain Image Link & Universal Photo Syncer */}
      <div className="bg-gradient-to-br from-[#070e24] via-[#0a1738] to-[#060c1f] border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Globe size={18} />
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                Domain Image Architecture &amp; Auto Photo Syncer
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              All website photos (Blogger posts, pages, custom articles, books, audio tracks) are automatically synchronized and accessible through the official domain: <span className="text-cyan-300 font-mono">https://mdshinhasarder.com/images/[filename]</span> without 404s.
            </p>
          </div>

          {/* Sync All Photos Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <Button
              onClick={async () => {
                setSyncing(true);
                setSyncProgress("Collecting Blogger & website photos...");
                try {
                  const res = await syncAllPhotosToImagesFolder((msg) => setSyncProgress(msg));
                  toast.success(`Successfully synchronized ${res.totalFound} photos to /images folder with domain links!`);
                  await refetchPosts().catch(() => {});
                } catch (err: any) {
                  toast.error(err?.message || "Failed to sync photos");
                } finally {
                  setSyncing(false);
                  setSyncProgress("");
                }
              }}
              disabled={syncing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <FolderSync size={16} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing Photos..." : "Sync All Photos to /images Folder"}</span>
            </Button>
            <Link
              to="/admin/posts"
              className="px-3 py-2 text-xs rounded-lg border border-blue-500/30 text-blue-300 hover:bg-blue-600/10 flex items-center gap-1.5 transition-colors"
            >
              <span>Manage Posts</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {syncProgress && (
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-400/40 text-xs text-cyan-200 flex items-center gap-2 animate-pulse">
            <FolderSync size={14} className="animate-spin text-cyan-400 shrink-0" />
            <span>{syncProgress}</span>
          </div>
        )}

        {/* Dedicated Photo Upload Box */}
        <PhotoUploadBox
          label="Instant Photo Upload Box — Domain Link Creator"
          description="Upload any photo to directly save to /images/ folder and generate https://mdshinhasarder.com domain link."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-gradient-card border border-border rounded-xl p-4">
          <h2 className="font-serif font-bold mb-3 flex items-center gap-2"><Rss size={16} className="text-primary" /> Latest Blogger Posts</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {bloggerPosts.slice(0, 20).map((p) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
                <Link to={postPath(p)} className="truncate hover:text-primary">{p.title}</Link>
              </li>
            ))}
            {bloggerPosts.length === 0 && <li className="text-muted-foreground text-sm">No Blogger posts fetched yet.</li>}
          </ul>
        </section>
        <section className="bg-gradient-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold flex items-center gap-2"><Image size={16} className="text-primary" /> Blogger &amp; Domain Photos</h2>
            <Link to="/images/czajweotfpsqbp8nwb9n.jpg" target="_blank" className="text-xs text-blue-400 hover:underline">
              View Uploaded (/images/...)
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {bloggerPosts.filter((p) => p.image).slice(0, 32).map((p) => {
              const domainImage = `https://mdshinhasarder.com/images/${(p.slug || p.id).toLowerCase()}.jpg`;
              return (
                <div key={p.id} className="relative group aspect-square rounded overflow-hidden border border-border">
                  <img src={p.image!} alt={p.title} className="w-full h-full object-cover rounded" loading="lazy" />
                  <button
                    type="button"
                    title={`Copy Domain Link: ${domainImage}`}
                    onClick={() => {
                      navigator.clipboard.writeText(domainImage);
                      toast.success(`Copied domain link: ${domainImage}`);
                    }}
                    className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-[10px] text-center"
                  >
                    <Copy size={13} className="mb-0.5 text-blue-400" />
                    <span>Copy Domain Link</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
