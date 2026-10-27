import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ExternalLink, Copy, Check, ArrowLeft, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLOUDINARY_CONFIG } from "@/lib/cloudinary";

export default function MediaRedirect() {
  const params = useParams();
  const location = useLocation();
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [domainUrl, setDomainUrl] = useState<string>("");

  const rawParam = params.slug || params.filename || params["*"] || "";
  const cleanSlug = decodeURIComponent(rawParam).replace(/^\//, "");

  useEffect(() => {
    if (!cleanSlug) return;

    // Check localStorage registry first
    let resolvedUrl = "";
    try {
      const raw = localStorage.getItem("shinha_media_registry");
      if (raw) {
        const list = JSON.parse(raw);
        const item = list.find((x: any) => x.slug === cleanSlug || x.publicId === cleanSlug || x.name === cleanSlug);
        if (item?.cloudinaryUrl) {
          resolvedUrl = item.cloudinaryUrl;
        }
      }
    } catch (_e) {
      void _e;
    }

    // Fallback formula
    if (!resolvedUrl) {
      if (cleanSlug.includes(".")) {
        resolvedUrl = `/images/${cleanSlug}`;
      } else {
        const publicId = cleanSlug.replace(/\.[^/.]+$/, "");
        resolvedUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/f_auto,q_auto/${publicId}`;
      }
    }

    setTargetUrl(resolvedUrl);
    setDomainUrl(cleanSlug.includes(".") ? `https://mdshinhasarder.com/images/${cleanSlug}` : `https://mdshinhasarder.com/media/${cleanSlug}`);

    // Automatically redirect after a short moment
    const timer = setTimeout(() => {
      if (resolvedUrl) {
        window.location.replace(resolvedUrl);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [cleanSlug, location.pathname]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>{`Media Redirect | ${cleanSlug || "Asset"} - MD. Shinha Sarder`}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="max-w-md w-full bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
          <Sparkles size={14} />
          <span>MD. Shinha Sarder CDN Router</span>
        </div>

        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Loader2 size={32} className="animate-spin text-blue-400" />
          </div>
          <h1 className="text-xl font-bold font-serif text-white">
            Redirecting to Image...
          </h1>
          <p className="text-xs text-slate-400 font-mono break-all px-2">
            {domainUrl || location.pathname}
          </p>
        </div>

        {targetUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 max-h-48 flex items-center justify-center">
            <img
              src={targetUrl}
              alt={cleanSlug}
              className="max-h-40 max-w-full object-contain rounded-lg"
              onError={(e) => {
                // If direct publicId fails, try with .jpg
                const img = e.currentTarget;
                if (!img.src.endsWith(".jpg") && !img.src.endsWith(".webp") && !img.src.endsWith(".png")) {
                  img.src = `${img.src}.jpg`;
                }
              }}
            />
          </div>
        )}

        <div className="space-y-2 text-xs">
          <p className="text-slate-400">
            Delivering high-resolution image asset directly via CDN:
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9"
            >
              <a href={targetUrl} target="_self">
                <ExternalLink size={14} className="mr-1.5" /> Open Image
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCopy(domainUrl || window.location.href)}
              className="border-slate-700 hover:bg-slate-800 text-xs h-9"
            >
              {copied ? <Check size={14} className="mr-1 text-emerald-400" /> : <Copy size={14} className="mr-1" />}
              {copied ? "Copied" : "Copy Domain Link"}
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <Link to="/" className="inline-flex items-center hover:text-white transition-colors">
            <ArrowLeft size={14} className="mr-1" /> Home
          </Link>
          <span className="font-mono text-[11px] text-slate-500">
            Cloud: {CLOUDINARY_CONFIG.cloudName}
          </span>
        </div>
      </div>
    </div>
  );
}
