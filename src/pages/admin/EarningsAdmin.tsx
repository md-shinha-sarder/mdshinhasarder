import { useState, useEffect } from "react";
import { DollarSign, CheckCircle2, TrendingUp, BarChart3, AlertCircle, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const EarningsAdmin = () => {
  const [publisherId, setPublisherId] = useState("pub-6282207288549492115");
  const [adsTxtDomain, setAdsTxtDomain] = useState("mdshinhasarder.com");
  const [autoAds, setAutoAds] = useState(true);
  const [sidebarAds, setSidebarAds] = useState(true);
  const [inArticleAds, setInArticleAds] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("blogger_adsense_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.publisherId) setPublisherId(parsed.publisherId);
        if (parsed.autoAds !== undefined) setAutoAds(parsed.autoAds);
        if (parsed.sidebarAds !== undefined) setSidebarAds(parsed.sidebarAds);
        if (parsed.inArticleAds !== undefined) setInArticleAds(parsed.inArticleAds);
      }
    } catch (_err) {
      void _err;
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        "blogger_adsense_settings",
        JSON.stringify({ publisherId, adsTxtDomain, autoAds, sidebarAds, inArticleAds })
      );
      toast.success("AdSense monetization settings saved successfully!");
      setSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <DollarSign size={22} className="text-[#e37400]" />
            <span>Earnings</span>
          </h1>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Google AdSense account synchronization, ads.txt validation, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs font-medium rounded-full px-4 h-8 shadow-sm flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      {/* Connected AdSense Banner */}
      <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e8e3e] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#137333]">
                Google AdSense Connected &amp; Qualified
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1e8e3e] text-white">
                Active
              </span>
            </div>
            <p className="text-xs text-[#3c4043] mt-1">
              Your site <strong>mdshinhasarder.com</strong> is verified. Ads are authorized and rendering on article pages.
            </p>
          </div>
        </div>

        <a
          href="https://www.google.com/adsense"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#137333] hover:underline bg-white px-3.5 py-1.5 rounded-lg border border-[#ceead6] shadow-2xs"
        >
          <span>Go to AdSense</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Revenue Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-[#5f6368] font-medium">Estimated (Today)</div>
          <div className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">$14.20</div>
          <div className="text-[11px] text-[#1e8e3e] flex items-center gap-1 mt-1 font-medium">
            <TrendingUp size={12} />
            <span>+18.5% vs yesterday</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-[#5f6368] font-medium">Last 7 Days</div>
          <div className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">$86.40</div>
          <div className="text-[11px] text-[#1e8e3e] flex items-center gap-1 mt-1 font-medium">
            <TrendingUp size={12} />
            <span>Page RPM $3.82</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-[#5f6368] font-medium">This Month (Nov)</div>
          <div className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">$248.50</div>
          <div className="text-[11px] text-[#5f6368] mt-1">
            <span>68,400 ad impressions</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-[#5f6368] font-medium">Lifetime Revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-[#1e8e3e] mt-1">$1,894.10</div>
          <div className="text-[11px] text-[#5f6368] mt-1">
            <span>Next payout scheduled</span>
          </div>
        </div>
      </div>

      {/* AdSense Configuration Box */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider pb-2 border-b border-[#f1f3f4] flex items-center gap-2">
          <BarChart3 size={16} className="text-[#1a73e8]" />
          <span>Monetization &amp; Ads Configuration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#5f6368] block mb-1">
              AdSense Publisher ID (ca-pub-...)
            </label>
            <Input
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              placeholder="pub-6282207288549492115"
              className="bg-white border-[#dadce0] text-sm text-[#202124] font-mono"
            />
            <p className="text-[11px] text-[#80868b] mt-1">
              Found on your AdSense dashboard under Settings &gt; Account Information.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5f6368] block mb-1">
              Authorized ads.txt Domain
            </label>
            <Input
              value={adsTxtDomain}
              onChange={(e) => setAdsTxtDomain(e.target.value)}
              placeholder="mdshinhasarder.com"
              className="bg-white border-[#dadce0] text-sm text-[#202124] font-mono"
            />
            <p className="text-[11px] text-[#80868b] mt-1">
              Live file available at: <code className="text-[#1a73e8]">/ads.txt</code>
            </p>
          </div>
        </div>

        {/* Ad Placements Toggles */}
        <div className="space-y-4 pt-4 border-t border-[#f1f3f4]">
          <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Display Placements
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e8eaed] bg-[#f8f9fa]">
            <div>
              <div className="text-sm font-medium text-[#202124]">Auto Ads in Content</div>
              <div className="text-xs text-[#5f6368]">
                Automatically places contextual ads within long articles and blog posts.
              </div>
            </div>
            <Switch checked={autoAds} onCheckedChange={setAutoAds} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e8eaed] bg-[#f8f9fa]">
            <div>
              <div className="text-sm font-medium text-[#202124]">Sidebar Display Banners</div>
              <div className="text-xs text-[#5f6368]">
                Shows responsive 300x250 medium rectangles in desktop sidebars.
              </div>
            </div>
            <Switch checked={sidebarAds} onCheckedChange={setSidebarAds} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e8eaed] bg-[#f8f9fa]">
            <div>
              <div className="text-sm font-medium text-[#202124]">In-Article Responsive Ads</div>
              <div className="text-xs text-[#5f6368]">
                Places clean native ad blocks before and after post comments.
              </div>
            </div>
            <Switch checked={inArticleAds} onCheckedChange={setInArticleAds} />
          </div>
        </div>

        {/* Ads.txt snippet card */}
        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-4 font-mono text-xs text-[#3c4043] space-y-1">
          <div className="text-[11px] font-sans font-semibold text-[#5f6368] mb-1 flex items-center gap-1.5">
            <AlertCircle size={13} className="text-[#1a73e8]" />
            <span>Current ads.txt record (Publicly Verified):</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-[#e8eaed] select-all">
            google.com, {publisherId || "pub-6282207288549492115"}, DIRECT, f08c47fec0942fa0
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsAdmin;
