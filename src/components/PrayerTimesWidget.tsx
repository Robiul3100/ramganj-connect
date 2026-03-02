import { useState, useEffect } from "react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

const COORDS = new Coordinates(22.9447, 90.8282);
const PARAMS = CalculationMethod.Karachi();

const toBn = (n: number | string): string => {
  const b = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => b[parseInt(d)]);
};

const banglaWeekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const banglaMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const banglaMonthsBangla = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
const hijriMonths = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];

const getBanglaDate = (date: Date) => {
  const bengaliEpochDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  const startMonth = 3;
  const startDay = 14;
  let year = date.getFullYear() - 593;
  const gMonth = date.getMonth();
  const gDay = date.getDate();
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = [31, isLeap(date.getFullYear()) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = 0;

  if (gMonth < startMonth || (gMonth === startMonth && gDay < startDay)) {
    year--;
    dayOfYear = daysInMonth[startMonth] - startDay + 1;
    for (let m = startMonth + 1; m < 12; m++) dayOfYear += daysInMonth[m];
    for (let m = 0; m < gMonth; m++) dayOfYear += daysInMonth[m];
    dayOfYear += gDay - 1;
  } else {
    dayOfYear = gDay - startDay;
    for (let m = startMonth; m < gMonth; m++) dayOfYear += daysInMonth[m];
  }

  let bMonth = 0;
  let remaining = dayOfYear;
  while (bMonth < 12 && remaining >= bengaliEpochDays[bMonth]) {
    remaining -= bengaliEpochDays[bMonth];
    bMonth++;
  }
  if (bMonth >= 12) bMonth = 11;
  return { day: remaining + 1, month: banglaMonthsBangla[bMonth], year };
};

const getHijriDate = (date: Date) => {
  const epoch = new Date(622, 6, 16).getTime();
  const days = Math.floor((date.getTime() - epoch) / 86400000);
  const lunarMonths = days / 29.530588853;
  const totalMonths = Math.floor(lunarMonths);
  return {
    day: Math.floor((lunarMonths - totalMonths) * 29.530588853) + 1,
    month: hijriMonths[totalMonths % 12] || "রমজান",
    year: Math.floor(totalMonths / 12) + 1,
  };
};

const fmt = (d: Date): string => {
  let h = d.getHours();
  const m = d.getMinutes();
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}`;
};

const PrayerTimesWidget = () => {
  const [now, setNow] = useState(new Date());
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
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

  const prayers = [
    { name: "ফজর", time: fmt(pt.fajr), icon: "🌅" },
    { name: "সূর্যোদয়", time: fmt(pt.sunrise), icon: "☀️", highlight: true },
    { name: "জোহর", time: fmt(pt.dhuhr), icon: "🌤️" },
    { name: "আসর", time: fmt(pt.asr), icon: "🌥️" },
    { name: "মাগরিব", time: fmt(pt.maghrib), icon: "🌙" },
    { name: "এশা", time: fmt(pt.isha), icon: "🌃" },
  ];

  return (
    <div className="px-3 sm:px-4">
      <div className="rounded-2xl bg-card border border-border/50 dark:border-border/30 shadow-sm overflow-hidden">
        
        {/* Top notice bar */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 dark:bg-muted/20 border-b border-border/30 dark:border-border/20">
          <span className="text-[11px] sm:text-xs text-foreground/80 dark:text-foreground/70 font-medium text-center leading-snug">
            নামাজের সময়সূচি কেবলমাত্র লক্ষ্মীপুর জেলার জন্য প্রযোজ্য
          </span>
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
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
                  {banglaWeekdays[now.getDay()]}
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
              <div key={p.name} className="flex items-center gap-1.5 sm:gap-2 py-1">
                <span className="text-sm sm:text-lg leading-none">{p.icon}</span>
                <span className={`text-[12px] sm:text-[14px] leading-tight ${
                  p.highlight 
                    ? "text-destructive font-bold" 
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
