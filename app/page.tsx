"use client";
import React, { useState } from "react";
import { CldImage } from "next-cloudinary";

export default function Page() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const domainAssets = [
    {
      title: "Profile Portrait",
      src: "cld-sample-5",
      domainUrl: "https://mdshinhasarder.com/profile.webp",
      alt: "MD. Shinha Sarder - Official Portrait",
    },
    {
      title: "Hero Background",
      src: "samples/landscapes/nature-mountains",
      domainUrl: "https://mdshinhasarder.com/hero-bg.jpg",
      alt: "Creative Tech Studio Background",
    },
    {
      title: "Author & Researcher",
      src: "samples/people/smiling-man",
      domainUrl: "https://mdshinhasarder.com/hero-portrait.jpg",
      alt: "MD. Shinha Sarder - Author & Researcher",
    },
  ];

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 max-w-6xl mx-auto flex flex-col items-center gap-8">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          Cloudinary CDN Integration • Cloud: borle8go
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Media Gallery
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Ultra-fast media delivery architecture combining Cloudinary smart transformations with MD. Shinha Sarder canonical SEO domain links.
        </p>
      </header>

      {/* Featured Cloudinary Asset (as requested) */}
      <section className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Featured Dynamic Transformation
        </h2>
        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-950">
          <CldImage
            src="cld-sample-5"
            width={500}
            height={500}
            crop={{
              type: "auto",
              source: true,
            }}
            alt="Optimized Asset"
            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="mt-4 w-full flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="font-mono text-cyan-400">cld-sample-5</span>
          <span className="text-emerald-400 font-medium">Auto-format (f_auto, q_auto)</span>
        </div>
      </section>

      {/* Domain Photo Links Architecture */}
      <section className="w-full mt-4 space-y-4">
        <h3 className="text-xl font-bold text-slate-200">
          Canonical Domain Image Links (https://mdshinhasarder.com/...)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {domainAssets.map((asset, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors"
            >
              <div className="rounded-lg overflow-hidden mb-3 bg-slate-950 aspect-square flex items-center justify-center">
                <CldImage
                  src={asset.src}
                  width={300}
                  height={300}
                  crop="fill"
                  alt={asset.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-sm text-slate-200">{asset.title}</div>
                <div className="text-xs font-mono text-blue-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                  {asset.domainUrl}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(asset.domainUrl)}
                  className="w-full text-xs py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                >
                  {copiedUrl === asset.domainUrl ? "Copied Domain URL!" : "Copy Domain Link"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
