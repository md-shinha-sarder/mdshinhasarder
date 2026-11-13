import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Palette, Save, Sun, Moon } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useTheme } from "@/hooks/useTheme";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const DEFAULT_THEME = {
  site_title: "MD. Shinha Sarder",
  site_tagline: "Founder & CEO of IT Tech BD and Biostar TV World",
  logo_url: "/profile.webp",
  favicon_url: "/favicon.webp",
  primary_color: "42 87% 55%",
  background_color: "222 47% 6%",
  font_heading: "Playfair Display",
  font_body: "Plus Jakarta Sans",
};

const COLOR_PRESETS = [
  { name: "Codify Blue", primary: "221 83% 53%", bg: "222 47% 6%" },
  { name: "Blogger Orange", primary: "28 100% 45%", bg: "222 47% 6%" },
  { name: "Gold Classic", primary: "42 87% 55%", bg: "222 47% 6%" },
  { name: "Emerald Tech", primary: "152 69% 40%", bg: "222 47% 6%" },
];

const ThemeAdmin = () => {
  const [s, setS] = useState<any>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();
        if (data) setS({ ...DEFAULT_THEME, ...data });
      } catch {
        // fallback to default theme
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        id: 1,
        site_title: s.site_title,
        site_tagline: s.site_tagline,
        logo_url: s.logo_url,
        favicon_url: s.favicon_url,
        primary_color: s.primary_color,
        background_color: s.background_color,
        font_heading: s.font_heading,
        font_body: s.font_body,
      };
      const { error } = await supabase.from("site_settings").upsert(payload);
      if (error) return toast.error(error.message);
      toast.success("Theme & branding settings saved!");
      if (s.primary_color) document.documentElement.style.setProperty("--primary", s.primary_color);
      if (s.background_color) document.documentElement.style.setProperty("--background", s.background_color);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[#5f6368] text-sm p-4">Loading theme settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <Palette size={22} className="text-[#e37400]" />
            <span>Theme &amp; Branding</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Customize public site display mode (Mobile &amp; PC), brand identity, colors, and typography.
          </p>
        </div>

        <Button
          onClick={save}
          disabled={saving}
          className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs sm:text-sm font-medium rounded-full px-5 h-9 shadow-sm flex items-center gap-1.5"
        >
          <Save size={15} />
          <span>{saving ? "Saving..." : "Save Theme"}</span>
        </Button>
      </div>

      {/* Public Display Mode Switch */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-[#202124]">Public Website Appearance Mode</h2>
        <p className="text-xs text-[#5f6368]">
          Choose the default color scheme for visitors on Mobile and PC (Admin Panel always uses clean Blogger Light mode).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              toast.success("Public website switched to Light Mode");
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              theme === "light"
                ? "border-[#1a73e8] bg-[#e8f0fe]/60 ring-1 ring-[#1a73e8]"
                : "border-[#dadce0] bg-[#f8f9fa] hover:bg-[#f1f3f4]"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-[#dadce0] flex items-center justify-center text-[#e37400] shrink-0">
              <Sun size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#202124]">Clean Light Mode</div>
              <div className="text-xs text-[#5f6368]">Bright editorial Blogger reading experience</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              toast.success("Public website switched to Dark Mode");
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              theme === "dark"
                ? "border-[#1a73e8] bg-[#e8f0fe]/60 ring-1 ring-[#1a73e8]"
                : "border-[#dadce0] bg-[#f8f9fa] hover:bg-[#f1f3f4]"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#0f172a] border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
              <Moon size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#202124]">Midnight Dark Mode</div>
              <div className="text-xs text-[#5f6368]">Deep navy contrast for night viewing</div>
            </div>
          </button>
        </div>
      </div>

      {/* Identity, Media & Colors */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-6 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Site Title</Label>
            <Input
              value={s.site_title || ""}
              onChange={(e) => setS({ ...s, site_title: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Tagline</Label>
            <Input
              value={s.site_tagline || ""}
              onChange={(e) => setS({ ...s, site_tagline: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f1f3f4]">
          <MediaPicker
            label="Brand Logo"
            value={resolveMediaUrl(s.logo_url || "")}
            onChange={(url) => setS({ ...s, logo_url: url })}
          />
          <MediaPicker
            label="Site Favicon"
            value={resolveMediaUrl(s.favicon_url || "")}
            onChange={(url) => setS({ ...s, favicon_url: url })}
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-[#f1f3f4]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-xs font-semibold text-[#202124]">Quick Color Presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setS({ ...s, primary_color: preset.primary, background_color: preset.bg })
                  }
                  className="text-[11px] px-2.5 py-1 rounded-full border border-[#dadce0] bg-[#f8f9fa] hover:bg-[#e8f0fe] text-[#3c4043] font-medium transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Primary Color (HSL)</Label>
              <Input
                placeholder="42 87% 55%"
                value={s.primary_color || ""}
                onChange={(e) => setS({ ...s, primary_color: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Background Color (HSL)</Label>
              <Input
                placeholder="222 47% 6%"
                value={s.background_color || ""}
                onChange={(e) => setS({ ...s, background_color: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f1f3f4]">
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Heading Font</Label>
            <Input
              value={s.font_heading || ""}
              onChange={(e) => setS({ ...s, font_heading: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Body Font</Label>
            <Input
              value={s.font_body || ""}
              onChange={(e) => setS({ ...s, font_body: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        <p className="text-xs text-[#5f6368]">
          Tip: HSL format uses three space-separated values, e.g. <code className="text-[#1a73e8]">42 87% 55%</code>.
        </p>

        <Button
          onClick={save}
          disabled={saving}
          className="w-full sm:w-auto bg-[#e37400] hover:bg-[#d56b00] text-white font-medium rounded-xl px-6"
        >
          <Save size={15} className="mr-1.5" />
          {saving ? "Saving..." : "Save Theme"}
        </Button>
      </div>
    </div>
  );
};

export default ThemeAdmin;
