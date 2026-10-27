import { useEffect, useState } from "react";
import { Radio, Clock, Calendar, Globe } from "lucide-react";

export const LiveClockWidget = () => {
  const [timeStr, setTimeStr] = useState("--:--:-- PM");
  const [dayName, setDayName] = useState("Today");
  const [fullEN, setFullEN] = useState("Loading…");
  const [dhakaDate, setDhakaDate] = useState("Dhaka (BST, UTC+6)");
  const [utcTime, setUtcTime] = useState("--:--:-- UTC");

  useEffect(() => {
    function update() {
      const now = new Date();

      // Dhaka Time (BST, UTC+6)
      const dhakaFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTimeStr(dhakaFormatter.format(now));

      const dayFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
      });
      setDayName(dayFormatter.format(now));

      const dateFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setFullEN(dateFormatter.format(now));

      const dhakaBrief = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setDhakaDate(`${dhakaBrief.format(now)} • Asia/Dhaka`);

      // UTC Time
      const utcFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setUtcTime(`${utcFormatter.format(now)} UTC`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div
        id="ahrw-live-widget"
        className="rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-900/40 bg-white dark:bg-slate-900/90 shadow-xl transition-colors duration-300"
      >
        {/* Top Header */}
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-emerald-600 dark:from-purple-900 dark:via-blue-900 dark:to-emerald-800">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/25">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <Radio className="w-3 h-3" />
              Live
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Today — {dayName}
            </h2>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-white drop-shadow-sm">
            {timeStr}
          </div>
        </div>

        {/* 3 Grid Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-gradient-to-b from-purple-50/50 via-slate-50 to-white dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-950">
          {/* Bangladesh Standard Time Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 to-orange-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> BST Timezone
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">UTC+6</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
              {timeStr}
            </div>
            <div className="pl-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {dhakaDate}
            </div>
          </div>

          {/* International Calendar Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Full Date
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gregorian</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
              {fullEN}
            </div>
            <div className="pl-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Official Standard Format
            </div>
          </div>

          {/* UTC Global Reference Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Global Time
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">UTC / GMT</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug font-mono">
              {utcTime}
            </div>
            <div className="pl-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Coordinated Universal Time
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          <span>Live Synchronized Time • High Precision Digital Clock</span>
          <span className="text-[11px] font-mono opacity-80">UTC+6 Bangladesh Standard Time (BST)</span>
        </div>
      </div>
    </div>
  );
};

export default LiveClockWidget;
