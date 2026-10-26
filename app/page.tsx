"use client";
import React, { useState, useEffect } from "react";
import { PhotoUploadBox, UploadResult } from "@/components/admin/PhotoUploadBox";
import { Check, Copy, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  localUrl: string;
  cloudinary_url?: string;
  created_at?: string;
}

export default function Page() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploadedItems, setUploadedItems] = useState<MediaItem[]>([]);
  const [featuredPhoto, setFeaturedPhoto] = useState<{
    name: string;
    domainUrl: string;
    displaySrc: string;
  }>({
    name: "Official Site Logo",
    domainUrl: "https://mdshinhasarder.com/images/site-logo.png",
    displaySrc: "/images/site-logo.png",
  });

  useEffect(() => {
    try {
      const lastRaw = localStorage.getItem("shinha_last_uploaded_photo");
      if (lastRaw) {
        const last = JSON.parse(lastRaw);
        if (last && last.domainUrl) {
          setFeaturedPhoto({
            name: last.filename || last.name || "Uploaded Photo",
            domainUrl: last.domainUrl,
            displaySrc: last.localUrl || last.domainUrl,
          });
        }
      }

      const listRaw = localStorage.getItem("shinha_media_items");
      if (listRaw) {
        const list = JSON.parse(listRaw);
        if (Array.isArray(list)) {
          setUploadedItems(list);
        }
      }
    } catch (_e) {
      void _e;
    }
  }, []);

  const handleUploadSuccess = (res: UploadResult) => {
    const newFeatured = {
      name: res.filename,
      domainUrl: res.domainUrl,
      displaySrc: res.localUrl,
    };
    setFeaturedPhoto(newFeatured);

    const newItem: MediaItem = {
      id: `upload-${Date.now()}`,
      name: res.filename,
      url: res.domainUrl,
      localUrl: res.localUrl,
      cloudinary_url: res.cdnUrl,
      created_at: new Date().toISOString(),
    };
    setUploadedItems((prev) => [newItem, ...prev.filter((x) => x.url !== res.domainUrl)]);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 max-w-5xl mx-auto flex flex-col items-center gap-8">
      {/* Header */}
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-400" />
          Cloudinary CDN + Domain Image Architecture (borle8go)
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Media Gallery &amp; Photo Link Creator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Upload any photo to automatically save to the <code className="text-cyan-300 font-mono">/images/</code> folder and generate permanent <code className="text-emerald-300 font-mono">https://mdshinhasarder.com/images/[filename]</code> domain links.
        </p>
      </header>

      {/* Direct Photo Upload Box */}
      <section className="w-full">
        <PhotoUploadBox
          label="Photo Upload Box — Direct Domain Link Creator"
          description="Whichever photo you upload is instantly saved to /images/ and displayed below with its domain link."
          onUploadSuccess={handleUploadSuccess}
        />
      </section>

      {/* Featured Uploaded Photo (Shows the EXACT photo uploaded) */}
      <section className="w-full bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-4">
        <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={15} className="text-blue-400" />
            Currently Featured Photo (Live Preview)
          </h2>
          <span className="text-xs font-mono text-cyan-300 truncate max-w-[200px]">
            {featuredPhoto.name}
          </span>
        </div>

        {/* Real Exact Image Preview Container */}
        <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-black/60 aspect-video flex items-center justify-center p-2">
          <img
            src={featuredPhoto.displaySrc}
            alt={featuredPhoto.name}
            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/images/site-logo.png";
            }}
          />
        </div>

        {/* Domain Link Card */}
        <div className="w-full max-w-md space-y-2">
          <div className="text-xs text-slate-400 font-medium text-left">
            Official Website Domain Link:
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-blue-500/40 rounded-lg p-2">
            <code className="text-xs font-mono text-cyan-300 truncate flex-1 select-all text-left">
              {featuredPhoto.domainUrl}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(featuredPhoto.domainUrl)}
              className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shrink-0 flex items-center gap-1 transition-colors"
            >
              {copiedUrl === featuredPhoto.domainUrl ? <Check size={13} /> : <Copy size={13} />}
              {copiedUrl === featuredPhoto.domainUrl ? "Copied" : "Copy Link"}
            </button>
            <a
              href={featuredPhoto.displaySrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 shrink-0 flex items-center gap-1"
            >
              <ExternalLink size={13} /> Open
            </a>
          </div>
        </div>
      </section>

      {/* Uploaded Photos Gallery */}
      {uploadedItems.length > 0 && (
        <section className="w-full space-y-4">
          <h3 className="text-lg font-bold text-slate-200 flex items-center justify-between">
            <span>Uploaded Photos Library ({uploadedItems.length})</span>
            <span className="text-xs font-normal text-slate-400 font-mono">/images/</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition-colors p-3 gap-2"
              >
                <div
                  onClick={() =>
                    setFeaturedPhoto({
                      name: item.name,
                      domainUrl: item.url,
                      displaySrc: item.localUrl || item.url,
                    })
                  }
                  className="rounded-lg overflow-hidden bg-black/60 aspect-square flex items-center justify-center p-1 cursor-pointer"
                  title="Click to feature this photo"
                >
                  <img
                    src={item.localUrl || item.url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/images/site-logo.png";
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-200 truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400 truncate" title={item.url}>
                    {item.url}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url)}
                    className="w-full text-[11px] py-1.5 px-2 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    {copiedUrl === item.url ? <Check size={12} /> : <Copy size={12} />}
                    {copiedUrl === item.url ? "Copied Link" : "Copy Link"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
