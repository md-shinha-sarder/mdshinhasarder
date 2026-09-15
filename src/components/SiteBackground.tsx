import { memo } from "react";

const SiteBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Deep Midnight Blue Layer */}
      <div className="absolute inset-0 bg-[#070e24]" />

      {/* Radial Gradient Ambient Glows (Vibrant Sapphire Blue / Cyan / Deep Royal Blue) */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-blue-600/22 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
      <div className="absolute top-[25%] -right-40 w-[750px] h-[750px] bg-sky-500/18 rounded-full blur-[170px] animate-pulse [animation-duration:12s]" />
      <div className="absolute top-[55%] -left-40 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[160px]" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-blue-500/18 rounded-full blur-[150px] animate-pulse [animation-duration:10s]" />
      <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-500/12 rounded-full blur-[140px]" />

      {/* Subtle Micro Dot Pattern Overlay for Clean Modern Tech Atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage: `radial-gradient(rgba(96, 165, 250, 0.35) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Deep Blue Vignette for Optical Depth and Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070e24]/40 via-transparent to-[#040817]/95" />
    </div>
  );
});

SiteBackground.displayName = "SiteBackground";

export default SiteBackground;
