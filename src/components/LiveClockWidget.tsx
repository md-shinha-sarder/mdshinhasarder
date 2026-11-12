import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

// Bengali month transliterations and calculations
const BENGALI_MONTHS = [
  "Boishakh",
  "Joishtho",
  "Asharh",
  "Shrabon",
  "Bhadro",
  "Ashwin",
  "Kartik",
  "Agrahayan",
  "Poush",
  "Magh",
  "Falgun",
  "Choitro",
];

const SEASONS = [
  "Summer (Grishto)",
  "Monsoon (Borsha)",
  "Autumn (Shorot)",
  "Late Autumn (Hemanta)",
  "Winter (Sheet)",
  "Spring (Boshonto)",
];

function getBengaliDateEnglish(date: Date) {
  // Approximate standard revised calendar for Bangladesh
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed (0=Jan)
  const year = date.getFullYear();

  // Bengali New Year starts on April 14
  let bYear = year - 593;
  let bMonth = 0;
  let bDay = 1;

  // Month days mapping (Revised BD calendar: first 5 months have 31 days, rest 30 days, Falgun 29 or 30 in leap year)
  if (month < 3 || (month === 3 && day < 14)) {
    bYear = year - 594;
  }

  // Simplified calculation for display
  const startOfBoishakh = new Date(year, 3, 14); // Apr 14
  let diffDays = Math.floor((date.getTime() - startOfBoishakh.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    const prevStart = new Date(year - 1, 3, 14);
    diffDays = Math.floor((date.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  const monthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29, 30];
  let accumulated = 0;
  for (let m = 0; m < 12; m++) {
    if (diffDays < accumulated + monthLengths[m]) {
      bMonth = m;
      bDay = diffDays - accumulated + 1;
      break;
    }
    accumulated += monthLengths[m];
  }

  const seasonIndex = Math.floor(bMonth / 2) % 6;
  return `${bDay} ${BENGALI_MONTHS[bMonth]} ${bYear} BS • ${SEASONS[seasonIndex]}`;
}

export const LiveClockWidget = () => {
  const [timeStr, setTimeStr] = useState("--:--:-- PM");
  const [dayName, setDayName] = useState("Today");
  const [bengaliDate, setBengaliDate] = useState("Loading...");
  const [englishDate, setEnglishDate] = useState("Loading...");
  const [hijriDate, setHijriDate] = useState("Loading...");

  useEffect(() => {
    function update() {
      const now = new Date();

      // Dhaka Time Clock
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTimeStr(timeFormatter.format(now));

      // Day Name
      const dayFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
      });
      const dName = dayFormatter.format(now);
      setDayName(dName);

      // English Date (Day + Date)
      const enFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setEnglishDate(enFormatter.format(now));

      // Bengali Date in English transliteration
      setBengaliDate(getBengaliDateEnglish(now));

      // Hijri Date in English
      try {
        const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setHijriDate(`${hijriFormatter.format(now)} AH`);
      } catch {
        setHijriDate("Islamic Calendar Date");
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full my-6 font-['Poppins','Karla',sans-serif]">
      {/* Container matching .ahrw in XML */}
      <div className="rounded-[18px] overflow-hidden border border-black/[0.08] bg-white shadow-[0_12px_34px_rgba(0,0,0,0.10)]">
        {/* Top Header matching .ahrw-top */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#5e26cd] via-[#050796] to-[#0a4275] text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/25">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <Radio className="w-3.5 h-3.5" />
              Live
            </span>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Today — {dayName}
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-white">
            {timeStr}
          </div>
        </div>

        {/* 3 Grid Cards matching .ahrw-grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f8fafc]">
          {/* Card 1: Bengali (in English) */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0a4275] text-sm">Bengali Calendar</span>
              <span className="text-xs text-[#64748b]">Day + Date (English)</span>
            </div>
            <div className="font-semibold text-sm text-[#1e2a38] mt-1 leading-snug">
              {bengaliDate}
            </div>
          </div>

          {/* Card 2: English (Gregorian) */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#2563eb] text-sm">English Calendar</span>
              <span className="text-xs text-[#64748b]">Day + Date</span>
            </div>
            <div className="font-semibold text-sm text-[#1e2a38] mt-1 leading-snug">
              {englishDate}
            </div>
          </div>

          {/* Card 3: Hijri (Islamic) */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#059669] text-sm">Hijri Calendar</span>
              <span className="text-xs text-[#64748b]">Islamic Era</span>
            </div>
            <div className="font-semibold text-sm text-[#1e2a38] mt-1 leading-snug">
              {hijriDate}
            </div>
          </div>
        </div>

        {/* Note in English matching .ahrw-note */}
        <div className="px-5 py-3 text-xs text-[#64748b] bg-white border-t border-[#f1f5f9] text-center sm:text-left">
          Note: Bengali date is calculated according to the standard revised calendar (approximate).
        </div>
      </div>
    </div>
  );
};

export default LiveClockWidget;
