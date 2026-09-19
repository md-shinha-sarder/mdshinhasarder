import { memo } from "react";

const SiteBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Layer: Pure Solid Deep Black */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle Space & Cyan/Blue Glows on Black Canvas */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-700/18 rounded-full blur-[160px] animate-pulse [animation-duration:9s]" />
      <div className="absolute top-[25%] -right-40 w-[700px] h-[700px] bg-sky-600/14 rounded-full blur-[180px] animate-pulse [animation-duration:12s]" />
      <div className="absolute top-[60%] -left-32 w-[650px] h-[650px] bg-indigo-700/15 rounded-full blur-[160px]" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-blue-600/16 rounded-full blur-[150px]" />

      {/* Subtle Micro Star/Dot Grid on Pitch Black */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(96, 165, 250, 0.4) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Vignette border */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
    </div>
  );
});

SiteBackground.displayName = "SiteBackground";

export default SiteBackground;
