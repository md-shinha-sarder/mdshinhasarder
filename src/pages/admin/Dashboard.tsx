import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Newspaper,
  Image,
  Rss,
  Cpu,
  ArrowRight,
  Zap,
  FolderSync,
  Globe,
  Copy,
  Trash2,
  BarChart3,
} from "lucide-react";
import { usePosts, usePages } from "@/hooks/usePosts";
import { Link } from "react-router-dom";
import { postPath } from "@/lib/postUrl";
import { syncAllPhotosToImagesFolder, clearAllSyncData } from "@/lib/syncAllPhotos";
import { PhotoUploadBox } from "@/components/admin/PhotoUploadBox";
import { resolveMediaUrl, handleUploadedImageError } from "@/lib/mediaUrl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [stats, setStats] = useState({ pages: 0, posts: 0, media: 0 });
  const { posts: bloggerPosts, refetch: refetchPosts } = usePosts();
  const { pages: bloggerPages } = usePages();

  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Clear All: Purge local photo cache, remove broken mappings, and restore clean Blogger photos?"
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      await clearAllSyncData();
      await refetchPosts().catch(() => {});
      toast.success("Successfully cleared all cache and restored clean Blogger photos!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear cache");
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [p, po, m] = await Promise.all([
          supabase.from("pages").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("media").select("*", { count: "exact", head: true }),
        ]);
        setStats({ pages: p.count || 0, posts: po.count || 0, media: m.count || 0 });
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const bloggerPhotoCount = bloggerPosts.filter((p) => p.image).length;

  const cards = [
    { label: "Pages (DB)", value: stats.pages, icon: FileText, color: "text-[#1a73e8]" },
    { label: "Posts (DB)", value: stats.posts, icon: Newspaper, color: "text-[#e37400]" },
    { label: "Media (DB)", value: stats.media, icon: Image, color: "text-[#1e8e3e]" },
    { label: "Blogger Posts", value: bloggerPosts.length, icon: Rss, color: "text-[#d93025]" },
    { label: "Blogger Pages", value: bloggerPages.length, icon: Rss, color: "text-[#7b1fa2]" },
    { label: "Blogger Photos", value: bloggerPhotoCount, icon: Image, color: "text-[#0284c7]" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <BarChart3 size={22} className="text-[#e37400]" />
            <span>Stats &amp; Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Manage content, uploaded photos, SEO, and theme settings across Mobile &amp; PC.
          </p>
        </div>
        <Link
          to="/admin/tech-version"
          className="px-3.5 py-2 rounded-xl bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] text-[#1a73e8] text-xs font-semibold flex items-center gap-2 transition-all w-fit"
        >
          <Cpu size={15} />
          <span>Tech &amp; CMS Versions</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Auto-Version Quick Banner */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#feefe3] border border-orange-200 flex items-center justify-center text-[#e37400] shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#202124]">Full-Stack Core Architecture &amp; Auto-Update Engine</h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Powered by <span className="text-[#1a73e8] font-semibold">Next.js + React + Java + Python + Node.js</span>. One-click version checks &amp; updates.
            </p>
          </div>
        </div>
        <Link
          to="/admin/tech-version"
          className="px-4 py-2 text-xs font-semibold rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xs shrink-0 transition-colors w-full sm:w-auto text-center"
        >
          Manage Tech Versions
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#5f6368] font-medium">{c.label}</span>
              <c.icon size={17} className={c.color} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#202124]">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Domain Image Architecture & Direct Uploader */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#f1f3f4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                <Globe size={17} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#202124]">
                Photo Upload &amp; Domain Sync
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] mt-1 max-w-2xl">
              Uploaded photos are saved to <span className="text-[#1a73e8] font-mono">/images/[filename]</span> and display strictly as your exact uploaded image.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={clearing}
              className="border-red-200 text-[#d93025] hover:bg-[#fce8e6] text-xs h-8 flex items-center gap-1.5"
            >
              <Trash2 size={14} className={clearing ? "animate-spin" : ""} />
              <span>{clearing ? "Clearing..." : "Clear Cache"}</span>
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                setSyncing(true);
                setSyncProgress("Collecting Blogger & website photos...");
                try {
                  const res = await syncAllPhotosToImagesFolder((msg) => setSyncProgress(msg));
                  toast.success(`Successfully synchronized ${res.totalFound} photos to /images folder!`);
                  await refetchPosts().catch(() => {});
                } catch (err: any) {
                  toast.error(err?.message || "Failed to sync photos");
                } finally {
                  setSyncing(false);
                  setSyncProgress("");
                }
              }}
              disabled={syncing}
              className="bg-[#1e8e3e] hover:bg-[#137333] text-white text-xs h-8 font-medium flex items-center gap-1.5"
            >
              <FolderSync size={14} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing..." : "Sync All Photos"}</span>
            </Button>
            <Link
              to="/admin/posts"
              className="px-3 py-1.5 text-xs rounded-lg border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] flex items-center gap-1 font-medium h-8"
            >
              <span>Posts</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {syncProgress && (
          <div className="p-3 rounded-xl bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1a73e8] flex items-center gap-2">
            <FolderSync size={14} className="animate-spin shrink-0" />
            <span>{syncProgress}</span>
          </div>
        )}

        <PhotoUploadBox
          label="Instant Photo Upload Box"
          description="Upload a photo to save under /images/ and immediately preview only that exact uploaded photo."
        />
      </div>

      {/* Bottom Recent Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#202124] mb-3 flex items-center gap-2 pb-2 border-b border-[#f1f3f4]">
            <Rss size={15} className="text-[#e37400]" /> Latest Blogger Posts
          </h2>
          <ul className="space-y-2.5 max-h-80 overflow-y-auto">
            {bloggerPosts.slice(0, 20).map((p) => (
              <li key={p.id} className="flex items-center gap-3 text-xs sm:text-sm">
                {p.image && (
                  <img
                    src={resolveMediaUrl(p.image)}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0 border border-[#e8eaed]"
                    onError={(e) => handleUploadedImageError(e.currentTarget, p.image)}
                  />
                )}
                <Link to={postPath(p)} className="truncate text-[#202124] hover:text-[#1a73e8] font-medium">
                  {p.title}
                </Link>
              </li>
            ))}
            {bloggerPosts.length === 0 && (
              <li className="text-[#5f6368] text-xs">No Blogger posts fetched yet.</li>
            )}
          </ul>
        </section>

        <section className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f3f4]">
            <h2 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Image size={15} className="text-[#1a73e8]" /> Recent Post Photos
            </h2>
            <Link to="/admin/media" className="text-xs text-[#1a73e8] font-medium hover:underline">
              Open Media
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {bloggerPosts
              .filter((p) => p.image)
              .slice(0, 32)
              .map((p) => {
                const domainImage = `https://mdshinhasarder.com/images/${(p.slug || p.id).toLowerCase()}.jpg`;
                return (
                  <div
                    key={p.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-[#dadce0] bg-[#f8f9fa]"
                  >
                    <img
                      src={resolveMediaUrl(p.image!)}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => handleUploadedImageError(e.currentTarget, p.image)}
                    />
                    <button
                      type="button"
                      title={`Copy Domain Link: ${domainImage}`}
                      onClick={() => {
                        navigator.clipboard.writeText(domainImage);
                        toast.success(`Copied domain link!`);
                      }}
                      className="absolute inset-0 bg-black/65 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-[10px] text-center"
                    >
                      <Copy size={13} className="mb-0.5 text-sky-300" />
                      <span>Copy Link</span>
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
