import { useState, useEffect } from "react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Clock } from "lucide-react";

const COORDS = new Coordinates(22.9447, 90.8282);
const PARAMS = CalculationMethod.Karachi();

const toBn = (n: number | string): string => {
  const b = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => b[parseInt(d)]);
};

const banglaWeekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const banglaMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const banglaMonthsBangla = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];

const getBanglaDate = (date: Date) => {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-indexed
  const gDay = date.getDate();
  
  // Bengali new year starts on April 14 (or 15 in leap years)
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const bNewYearDay = isLeap(gYear) ? 14 : 14;
  
  // Bengali year
  let bYear = gYear - 593;
  if (gMonth < 3 || (gMonth === 3 && gDay < bNewYearDay)) {
    bYear--;
  }
  
  // Days in each Bengali month: Baishakh(31), Jyaistha(31), Ashar(31), Shraban(31), Bhadra(31), Ashwin(30), Kartik(30), Agrahayana(30), Poush(30), Magh(30), Falgun(30), Chaitra(30)
  const bMonthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  
  // Gregorian start dates for each Bengali month (approx)
  // Baishakh: Apr 14, Jyaistha: May 15, Ashar: Jun 15, Shraban: Jul 16, Bhadra: Aug 16, Ashwin: Sep 16
  // Kartik: Oct 16, Agrahayana: Nov 15, Poush: Dec 15, Magh: Jan 14, Falgun: Feb 13, Chaitra: Mar 15
  const gStartMonths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // Gregorian month (0-indexed)
  const gStartDays   = [14, 15, 15, 16, 16, 16, 16, 15, 15, 14, 13, 15];
  
  let bMonth = 0;
  let bDay = 1;
  
  for (let i = 11; i >= 0; i--) {
    const sm = gStartMonths[i];
    const sd = gStartDays[i];
    
    let startDate: Date;
    if (i >= 9) {
      // Magh(Jan), Falgun(Feb), Chaitra(Mar) — these belong to the current Gregorian year
      startDate = new Date(gYear, sm, sd);
    } else {
      // Baishakh(Apr) through Poush(Dec)
      // If we're in Jan-Mar, these months started in the previous Gregorian year
      if (gMonth <= 2 && i <= 8) {
        startDate = new Date(gYear - 1, sm, sd);
      } else {
        startDate = new Date(gYear, sm, sd);
      }
    }
    
    if (date >= startDate) {
      bMonth = i;
      const diffTime = date.getTime() - startDate.getTime();
      bDay = Math.floor(diffTime / 86400000) + 1;
      if (bDay > bMonthDays[i]) {
        bDay = bMonthDays[i];
      }
      break;
    }
  }
  
  return { day: bDay, month: banglaMonthsBangla[bMonth], year: bYear };
};

const getHijriDate = (date: Date) => {
  try {
    // Use Intl API for accurate Hijri date
    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = hijriFormatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1446');
    
    const hijriMonths = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];
    
    return {
      day,
      month: hijriMonths[(month - 1) % 12],
      year,
    };
  } catch {
    return { day: 1, month: "রমজান", year: 1446 };
  }
};

const fmt = (d: Date): string => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))} ${ampm}`;
};

const fmtClock = (d: Date): string => {
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}:${toBn(String(s).padStart(2, "0"))} ${ampm}`;
};

const PrayerTimesWidget = () => {
  const [now, setNow] = useState(new Date());
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data } = await (supabase.from as any)("site_settings")
        .select("value")
        .eq("key", "prayer_times_enabled")
        .maybeSingle();
      setEnabled(data ? data.value === "true" : true);
    };
    check();
  }, []);

  if (enabled === null) return null;
  if (!enabled) return null;

  const pt = new PrayerTimes(COORDS, now, PARAMS);
  const bangla = getBanglaDate(now);
  const hijri = getHijriDate(now);

  // Determine current/next prayer
  const prayerList = [
    { name: "ফজর", time: pt.fajr, icon: "🌅" },
    { name: "সূর্যোদয়", time: pt.sunrise, icon: "☀️", highlight: true },
    { name: "জোহর", time: pt.dhuhr, icon: "🌤️" },
    { name: "আসর", time: pt.asr, icon: "🌥️" },
    { name: "মাগরিব", time: pt.maghrib, icon: "🌙" },
    { name: "এশা", time: pt.isha, icon: "🌃" },
  ];

  // Find current prayer (the one whose time has passed most recently)
  let currentPrayerIndex = -1;
  for (let i = prayerList.length - 1; i >= 0; i--) {
    if (now >= prayerList[i].time) {
      currentPrayerIndex = i;
      break;
    }
  }

  const prayers = prayerList.map((p, i) => ({
    name: p.name,
    time: fmt(p.time),
    icon: p.icon,
    highlight: p.highlight,
    isCurrent: i === currentPrayerIndex,
  }));

  return (
    <div className="px-3 sm:px-4">
      <div className="rounded-2xl bg-card border border-border/50 dark:border-border/30 shadow-sm overflow-hidden">
        
        {/* Top notice bar with real-time clock */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 dark:bg-muted/20 border-b border-border/30 dark:border-border/20">
          <span className="text-[11px] sm:text-xs text-foreground/80 dark:text-foreground/70 font-medium leading-snug">
            লক্ষ্মীপুর জেলার নামাজের সময়সূচি
          </span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] sm:text-sm font-bold text-primary tabular-nums font-mono">
              {fmtClock(now)}
            </span>
          </div>
        </div>

        {/* Main content: date left + prayers right */}
        <div className="flex items-stretch">
          
          {/* Left: Date section */}
          <div className="flex flex-col justify-center items-start px-3 sm:px-5 py-3 sm:py-4 border-r border-border/30 dark:border-border/20 min-w-[105px] sm:min-w-[140px] space-y-1.5">
            {/* Gregorian date */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-4xl font-extrabold text-foreground leading-none">
                {toBn(now.getDate())}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-sm font-semibold text-foreground/80 leading-tight">
                  {banglaMonths[now.getMonth()]}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  {banglaWeekdays[now.getDay()]}, {toBn(now.getFullYear())}
                </span>
              </div>
            </div>

            {/* Bengali date */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base">📅</span>
              <span className="text-[11px] sm:text-sm font-bold text-primary leading-tight">
                {toBn(bangla.day)} {bangla.month} {toBn(bangla.year)}
              </span>
            </div>

            {/* Hijri date */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base">🗓️</span>
              <span className="text-[11px] sm:text-sm font-bold text-primary leading-tight">
                {toBn(hijri.day)} {hijri.month} {toBn(hijri.year)}
              </span>
            </div>
          </div>

          {/* Right: Prayer times grid — 2 columns, 3 rows */}
          <div className="flex-1 grid grid-cols-2 py-2 sm:py-3 px-2.5 sm:px-4 gap-y-1 sm:gap-y-1.5 gap-x-2 sm:gap-x-4">
            {prayers.map((p) => (
              <div key={p.name} className={`flex items-center gap-1.5 sm:gap-2 py-1 rounded-lg px-1 ${p.isCurrent ? "bg-primary/10 dark:bg-primary/15" : ""}`}>
                <span className="text-sm sm:text-lg leading-none">{p.icon}</span>
                <span className={`text-[12px] sm:text-[14px] leading-tight ${
                  p.highlight 
                    ? "text-destructive font-bold" 
                    : p.isCurrent
                    ? "text-primary font-bold"
                    : "text-foreground font-semibold"
                }`}>
                  {p.name} : {p.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
