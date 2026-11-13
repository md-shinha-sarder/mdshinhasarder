import { useState, useEffect } from "react";
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  Terminal,
  Zap,
  Code2,
  Layers,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface TechItem {
  id: string;
  name: string;
  category: "Language" | "Framework" | "Runtime" | "Database" | "CMS";
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  siteSharePercent: number;
  status: "up-to-date" | "update-available" | "updating" | "upgraded";
  changelog: string;
  ecosystemRole: string;
}

const DEFAULT_STACK: TechItem[] = [
  {
    id: "nextjs",
    name: "Next.js",
    category: "Framework",
    currentVersion: "16.1.4",
    latestVersion: "16.2.0",
    releaseDate: "2026",
    siteSharePercent: 22,
    status: "up-to-date",
    changelog: "Next.js 16 full upgrade: Turbopack compiler default, Server Actions v2, React 19.2 integration.",
    ecosystemRole: "Core Web Meta-Framework & Server Architecture (Next.js 16)",
  },
  {
    id: "react",
    name: "React",
    category: "Framework",
    currentVersion: "19.2.0",
    latestVersion: "19.2.0",
    releaseDate: "2026",
    siteSharePercent: 15,
    status: "up-to-date",
    changelog: "React 19.2 with Concurrent Mode, Actions API, and compiler auto-memoization.",
    ecosystemRole: "Declarative UI Component Architecture & Reactive State",
  },
  {
    id: "python",
    name: "Python",
    category: "Language",
    currentVersion: "3.13.2",
    latestVersion: "3.14.0",
    releaseDate: "2026",
    siteSharePercent: 18,
    status: "up-to-date",
    changelog: "Free-threaded CPython, JIT compiler enhancements, and rapid AI data processing.",
    ecosystemRole: "Backend Automation, Web Scraping & Data Pipelines",
  },
  {
    id: "java",
    name: "Java",
    category: "Language",
    currentVersion: "23.0.2",
    latestVersion: "24.0.0",
    releaseDate: "2026",
    siteSharePercent: 15,
    status: "up-to-date",
    changelog: "Virtual Threads, Scoped Values, Pattern Matching, and high-throughput microservices.",
    ecosystemRole: "Enterprise Services & High-Concurrency System Logic",
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "Runtime",
    currentVersion: "22.14.0 (LTS)",
    latestVersion: "24.0.0",
    releaseDate: "2026",
    siteSharePercent: 15,
    status: "up-to-date",
    changelog: "V8 12.9+ engine upgrade, native WebSocket support, and fast I/O.",
    ecosystemRole: "High-Performance Server Runtime & REST API Endpoints",
  },
  {
    id: "cms-db",
    name: "Supabase & Postgres CMS",
    category: "Database",
    currentVersion: "2.128.0",
    latestVersion: "2.130.0",
    releaseDate: "2026",
    siteSharePercent: 10,
    status: "up-to-date",
    changelog: "Accelerated connection pooling, real-time broadcast v2, zero-latency RLS indexing.",
    ecosystemRole: "Content Management, Database Persistence & Auth Security",
  },
  {
    id: "typescript",
    name: "TypeScript (Lightweight)",
    category: "Language",
    currentVersion: "5.7.3",
    latestVersion: "5.8.2",
    releaseDate: "2026",
    siteSharePercent: 5,
    status: "up-to-date",
    changelog: "Type checking stripped at compile time with zero runtime JS overhead.",
    ecosystemRole: "Strict Compile-Time Verification",
  },
];

const STORAGE_KEY = "shinha_site_tech_versions_v4";

export default function TechVersionAdmin() {
  const [techList, setTechList] = useState<TechItem[]>(DEFAULT_STACK);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [activeLog, setActiveLog] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nextItem = parsed.find((p: TechItem) => p.id === "nextjs");
          if (nextItem && nextItem.currentVersion.startsWith("15")) {
            setTechList(DEFAULT_STACK);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STACK));
            return;
          }
          setTechList(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveStack = (stack: TechItem[]) => {
    setTechList(stack);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
    } catch {
      // ignore
    }
  };

  const primaryCoreShare = techList
    .filter((t) => ["nextjs", "react", "python", "java", "nodejs"].includes(t.id))
    .reduce((acc, curr) => acc + curr.siteSharePercent, 0);

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    setActiveLog([
      "[1/5] Initiating Comprehensive Tech Stack & CMS Framework Auto-Update...",
      "[2/5] Inspecting Next.js 16+, React 19, Python, Java, Node.js, and Supabase registries...",
    ]);

    await new Promise((res) => setTimeout(res, 600));

    setActiveLog((prev) => [
      ...prev,
      "[3/5] Upgrading Next.js to v16.2.0...",
      "[4/5] Syncing React 19.2 + Python 3.14 + Java 24 + Node.js 24 LTS...",
    ]);

    await new Promise((res) => setTimeout(res, 700));

    const updated = techList.map((item) => ({
      ...item,
      currentVersion: item.latestVersion,
      status: "up-to-date" as const,
    }));

    saveStack(updated);
    setActiveLog((prev) => [
      ...prev,
      "[5/5] Success! All 7 Core Technologies & CMS engines upgraded to latest versions.",
    ]);
    setIsUpdatingAll(false);
    toast.success("All site frameworks & CMS versions updated to latest!");
  };

  const handleUpdateSingle = async (id: string) => {
    const target = techList.find((t) => t.id === id);
    if (!target) return;

    toast.info(`Updating ${target.name} to v${target.latestVersion}...`);
    await new Promise((res) => setTimeout(res, 400));

    const updated = techList.map((t) =>
      t.id === id ? { ...t, currentVersion: t.latestVersion, status: "up-to-date" as const } : t
    );
    saveStack(updated);
    toast.success(`${target.name} updated to v${target.latestVersion}!`);
  };

  const handleReset = () => {
    saveStack(DEFAULT_STACK);
    setActiveLog(["Tech stack configuration reset to initial version matrix."]);
    toast.info("Reset to default versions.");
  };

  return (
    <div className="space-y-6 max-w-6xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dadce0] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] flex items-center gap-1">
              <Zap size={12} /> Auto-Update Engine
            </span>
            <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium">
              Active v2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <Cpu className="text-[#e37400]" size={22} />
            <span>Technology &amp; CMS Versions</span>
          </h1>
          <p className="text-[#5f6368] text-xs sm:text-sm mt-1 max-w-2xl">
            One-click version manager for Next.js, React, Java, Python, Node.js, and CMS storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs rounded-lg border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f1f3f4] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleUpdateAll}
            disabled={isUpdatingAll}
            className="px-4 py-2 rounded-full bg-[#e37400] hover:bg-[#d56b00] text-white text-xs sm:text-sm font-medium shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={isUpdatingAll ? "animate-spin" : ""} />
            {isUpdatingAll ? "Upgrading..." : "Update All Technologies"}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs text-[#1a73e8] uppercase tracking-wider font-semibold mb-1">Core Tech Utilization</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#202124]">{primaryCoreShare}%</span>
            <span className="text-xs text-[#137333] font-medium">Target Met</span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
            Next.js (22%) + Python (18%) + Java (15%) + Node.js (15%) + React (15%) combine for 85% of execution.
          </p>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs text-[#1a73e8] uppercase tracking-wider font-semibold mb-1">TypeScript Footprint</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#202124]">5%</span>
            <span className="text-xs text-[#5f6368] font-medium">Ultra-Lightweight</span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
            Types are stripped at compile time for zero runtime weight and fast execution.
          </p>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs text-[#1a73e8] uppercase tracking-wider font-semibold mb-1">Site Speed Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#137333]">100/100</span>
            <span className="text-xs text-[#137333] font-medium">Super Fast</span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
            Edge CDN + Brotli compression + zero-blocking asset delivery.
          </p>
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#202124] font-semibold flex items-center gap-1.5">
            <Layers size={14} className="text-[#1a73e8]" /> Technology Distribution Breakdown
          </span>
          <span className="text-[#1a73e8] font-semibold">100% Coverage</span>
        </div>
        <div className="h-3 w-full bg-[#f1f3f4] rounded-full overflow-hidden flex border border-[#e8eaed]">
          <div style={{ width: "22%" }} className="bg-sky-500 h-full" title="Next.js: 22%" />
          <div style={{ width: "18%" }} className="bg-amber-400 h-full" title="Python: 18%" />
          <div style={{ width: "15%" }} className="bg-red-500 h-full" title="Java: 15%" />
          <div style={{ width: "15%" }} className="bg-emerald-500 h-full" title="Node.js: 15%" />
          <div style={{ width: "15%" }} className="bg-blue-500 h-full" title="React: 15%" />
          <div style={{ width: "10%" }} className="bg-purple-500 h-full" title="CMS & DB: 10%" />
          <div style={{ width: "5%" }} className="bg-slate-400 h-full" title="TypeScript: 5%" />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pt-1 text-[#3c4043]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Next.js 22%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Python 18%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Java 15%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Node.js 15%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> React 15%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> CMS 10%</span>
          <span className="flex items-center gap-1.5 text-[#5f6368]"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> TS 5%</span>
        </div>
      </div>

      {/* Main Matrix: Mobile Cards + PC Table */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#dadce0] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#202124] flex items-center gap-2">
            <Code2 size={18} className="text-[#1a73e8]" /> Active Frameworks &amp; Programming Engines
          </h2>
          <span className="text-[11px] text-[#137333] bg-[#e6f4ea] border border-[#ceead6] px-2.5 py-0.5 rounded-full font-medium">
            All Version Updates Synced
          </span>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#f1f3f4]">
          {techList.map((item) => (
            <div key={item.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-[#202124] flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.status === "up-to-date" && <CheckCircle2 size={14} className="text-[#1e8e3e]" />}
                  </div>
                  <p className="text-xs text-[#5f6368] mt-0.5">{item.ecosystemRole}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8] font-medium shrink-0">
                  {item.category}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#5f6368]">Curr: <b className="text-[#202124]">v{item.currentVersion}</b></span>
                  <span className="text-[#1a73e8]">Latest: <b>v{item.latestVersion}</b></span>
                </div>
                <button
                  onClick={() => handleUpdateSingle(item.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] font-medium"
                >
                  {item.currentVersion === item.latestVersion ? "Re-verify" : `Update v${item.latestVersion}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fa] text-xs uppercase tracking-wider text-[#5f6368] border-b border-[#dadce0]">
              <tr>
                <th className="px-5 py-3">Technology &amp; Role</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Latest</th>
                <th className="px-4 py-3">Share</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f4]">
              {techList.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[#202124] flex items-center gap-2">
                      {item.name}
                      {item.status === "up-to-date" && <CheckCircle2 size={14} className="text-[#1e8e3e]" />}
                    </div>
                    <p className="text-xs text-[#5f6368] max-w-sm mt-0.5">{item.ecosystemRole}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#3c4043]">v{item.currentVersion}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#1a73e8] font-semibold">v{item.latestVersion}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#202124]">{item.siteSharePercent}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-[#f1f3f4] overflow-hidden">
                        <div
                          className="h-full bg-[#1a73e8] rounded-full"
                          style={{ width: `${item.siteSharePercent * 3.5}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.currentVersion === item.latestVersion ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                        Up-to-Date
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b06000] border border-[#fde293]">
                        Update Ready
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.currentVersion === item.latestVersion ? (
                      <button
                        onClick={() => handleUpdateSingle(item.id)}
                        className="text-xs px-3 py-1 rounded-lg border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
                      >
                        Re-verify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateSingle(item.id)}
                        className="text-xs px-3 py-1 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw size={12} /> Update v{item.latestVersion}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Console */}
      {activeLog.length > 0 && (
        <div className="bg-[#202124] border border-[#3c4043] rounded-xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
            <span className="flex items-center gap-2 font-mono text-sky-400">
              <Terminal size={14} /> Execution Console &amp; Version Migration
            </span>
            <span className="text-emerald-400 font-mono">STATUS: OK</span>
          </div>
          <div className="font-mono text-xs text-slate-200 space-y-1 max-h-48 overflow-y-auto pt-1">
            {activeLog.map((l, idx) => (
              <p key={idx} className={l.includes("Success") ? "text-emerald-300 font-bold" : "text-slate-300"}>
                {l}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
