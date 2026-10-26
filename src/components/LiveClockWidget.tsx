import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export const LiveClockWidget = () => {
  const [timeBN, setTimeBN] = useState("--:--:-- PM");
  const [dayBN, setDayBN] = useState("শনিবার");
  const [fullBN, setFullBN] = useState("লোড হচ্ছে…");
  const [fullEN, setFullEN] = useState("Loading…");
  const [fullAR, setFullAR] = useState("جارٍ التحميل…");

  useEffect(() => {
    const bnDays = [
      "রবিবার",
      "সোমবার",
      "মঙ্গলবার",
      "বুধবার",
      "বৃহস্পতিবার",
      "শুক্রবার",
      "শনিবার",
    ];

    const bnMonths = [
      "বৈশাখ",
      "জ্যৈষ্ঠ",
      "আষাঢ়",
      "শ্রাবণ",
      "ভাদ্র",
      "আশ্বিন",
      "কার্তিক",
      "অগ্রহায়ণ",
      "পৌষ",
      "মাঘ",
      "ফাল্গুন",
      "চৈত্র",
    ];

    const mapBn: Record<string, string> = {
      "0": "০",
      "1": "১",
      "2": "২",
      "3": "৩",
      "4": "৪",
      "5": "৫",
      "6": "৬",
      "7": "৭",
      "8": "৮",
      "9": "৯",
    };

    function toBanglaDigits(str: string | number): string {
      return String(str).replace(/[0-9]/g, (d) => mapBn[d] || d);
    }

    function formatTimeBN(d: Date): string {
      let h = d.getHours();
      const m = d.getMinutes();
      const s = d.getSeconds();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      return `${toBanglaDigits(hh)}:${toBanglaDigits(mm)}:${toBanglaDigits(ss)} ${ampm}`;
    }

    function approxBanglaDate(gDate: Date) {
      const monthLens = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
      const y = gDate.getFullYear();
      const pohela = new Date(y, 3, 14);
      let bnYear: number, dayOfBnYear: number;
      if (gDate >= pohela) {
        bnYear = y - 593;
        dayOfBnYear = Math.floor((gDate.getTime() - pohela.getTime()) / 86400000) + 1;
      } else {
        bnYear = y - 594;
        const lastPohela = new Date(y - 1, 3, 14);
        dayOfBnYear = Math.floor((gDate.getTime() - lastPohela.getTime()) / 86400000) + 1;
      }
      let bnMonth = 0;
      let bnDay = dayOfBnYear;
      for (let i = 0; i < 12; i++) {
        if (bnDay > monthLens[i]) {
          bnDay -= monthLens[i];
          bnMonth++;
        } else {
          break;
        }
      }
      if (bnMonth > 11) bnMonth = 11;
      return { bnDay, bnMonthName: bnMonths[bnMonth], bnYear };
    }

    function update() {
      const now = new Date();
      const currentBnDay = bnDays[now.getDay()];
      setDayBN(currentBnDay);
      setTimeBN(formatTimeBN(now));

      try {
        setFullEN(
          new Intl.DateTimeFormat("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
          }).format(now)
        );
      } catch {
        setFullEN(now.toDateString());
      }

      try {
        setFullAR(
          new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(now)
        );
      } catch {
        setFullAR("اليوم والتاريخ الهجري");
      }

      const bd = approxBanglaDate(now);
      setFullBN(`${toBanglaDigits(bd.bnDay)} ${bd.bnMonthName} ${toBanglaDigits(bd.bnYear)} • ${currentBnDay}`);
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
              আজ — {dayBN}
            </h2>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-white drop-shadow-sm">
            {timeBN}
          </div>
        </div>

        {/* 3 Grid Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-gradient-to-b from-purple-50/50 via-slate-50 to-white dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-950">
          {/* Bengali Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 to-orange-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-amber-600 dark:text-amber-400">বাংলা</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">বার + তারিখ</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
              {fullBN}
            </div>
          </div>

          {/* English Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">English</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Day + Date</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
              {fullEN}
            </div>
          </div>

          {/* Hijri Card */}
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="pl-2 flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Hijri</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">اليوم + التاريخ</span>
            </div>
            <div className="pl-2 mt-2 font-bold text-slate-800 dark:text-slate-100 text-base leading-snug dir-rtl text-right font-sans">
              {fullAR}
            </div>
          </div>
        </div>

        <div className="px-5 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span>নোট: বাংলা তারিখ এখানে সাধারণ নিয়মে (আনুমানিক) দেখানো হয়।</span>
          <span className="text-[11px] font-mono opacity-70">UTC+6 Bangladesh Standard Time</span>
        </div>
      </div>
    </div>
  );
};

export default LiveClockWidget;
