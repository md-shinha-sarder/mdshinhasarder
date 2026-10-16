import { memo } from "react";

const SiteBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 bg-white dark:bg-black transition-colors duration-300" />
  );
});

SiteBackground.displayName = "SiteBackground";

export default SiteBackground;
