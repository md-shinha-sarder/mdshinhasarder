import { memo } from "react";

const SiteBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Deep Obsidian Layer */}
      <div className="absolute inset-0 bg-[#080b12]" />

      {/* Radial Gradient Ambient Glows (Warm Gold / Deep Indigo / Amber) */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] animate-pulse [animation-duration:8s]" />
      <div className="absolute top-[30%] -right-40 w-[700px] h-[700px] bg-amber-600/8 rounded-full blur-[160px] animate-pulse [animation-duration:12s]" />
      <div className="absolute top-[60%] -left-40 w-[650px] h-[650px] bg-blue-900/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-amber-400/8 rounded-full blur-[140px] animate-pulse [animation-duration:10s]" />

      {/* Subtle Micro Dot Pattern Overlay for Modern Executive Texture */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(245, 185, 66, 0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Subtle Top-to-Bottom Vignette for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
    </div>
  );
});

SiteBackground.displayName = "SiteBackground";

export default SiteBackground;
