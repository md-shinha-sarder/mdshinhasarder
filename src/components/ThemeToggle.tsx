import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({ className = "", showLabel = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
        isDark
          ? "bg-slate-800/80 text-amber-300 border-amber-400/30 hover:bg-slate-700 hover:border-amber-400/60 shadow-sm"
          : "bg-white text-indigo-700 border-indigo-200 hover:bg-slate-50 hover:border-indigo-400 shadow-sm"
      } ${className}`}
    >
      <span className="relative flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-700" />
        )}
      </span>
      {showLabel && (
        <span className="font-semibold tracking-wide select-none">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
