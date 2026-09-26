import { memo } from "react";

const SiteBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Layer: Deep Void Black */}
      <div className="absolute inset-0 bg-[#040406]" />

      {/* Uploaded High-Tech Gold Circuit Wallpaper Layer */}
      <div
        className="absolute inset-0 bg-[url('/site-bg-circuit.svg')] bg-cover bg-center bg-no-repeat opacity-95 transition-opacity"
      />

      {/* Luminous Warm Amber & Gold Accent Glows */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-amber-500/12 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-12 w-[550px] h-[550px] bg-yellow-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle Micro Star/Circuit Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 193, 7, 0.45) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Gentle Vignette for optimal foreground readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />
    </div>
  );
});

SiteBackground.displayName = "SiteBackground";

export default SiteBackground;
