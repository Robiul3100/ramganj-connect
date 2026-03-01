import { useState, useEffect } from "react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pt = new PrayerTimes(COORDS, now, PARAMS);
  const bangla = getBanglaDate(now);
  const hijri = getHijriDate(now);

  const prayerEntries = [
    { key: "fajr", name: "ফজর", time: pt.fajr, icon: "🌅" },
    { key: "sunrise", name: "সূর্যোদয়", time: pt.sunrise, icon: "☀️" },
    { key: "dhuhr", name: "জোহর", time: pt.dhuhr, icon: "🌤️" },
    { key: "asr", name: "আসর", time: pt.asr, icon: "🌥️" },
    { key: "maghrib", name: "মাগরিব", time: pt.maghrib, icon: "🌇" },
    { key: "isha", name: "এশা", time: pt.isha, icon: "🌙" },
  ];

  const waqtOrder = [pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha];
  let currentIdx = -1;
  for (let i = waqtOrder.length - 1; i >= 0; i--) {
    if (now >= waqtOrder[i]) { currentIdx = i; break; }
  }

  const prayerIndices = [0, 2, 3, 4, 5];
  let nextIdx = -1;
  for (const idx of prayerIndices) {
    if (now < waqtOrder[idx]) { nextIdx = idx; break; }
  }

  let countdown = "";
  if (nextIdx >= 0) {
    const diff = waqtOrder[nextIdx].getTime() - now.getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    countdown = `${toBn(hrs)}:${toBn(String(mins).padStart(2, "0"))}:${toBn(String(secs).padStart(2, "0"))}`;
  }

  return (
    <div className="px-3 sm:px-4">
      <div className="rounded-2xl bg-card border border-border/50 dark:border-border/30 shadow-sm dark:shadow-none overflow-hidden">
        
        {/* Top bar: date + countdown */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 border-b border-border/30 dark:border-border/20">
          {/* Date cluster */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/15 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-primary leading-none">{toBn(now.getDate())}</span>
              <span className="text-[7px] text-primary/60 leading-none mt-px uppercase tracking-wider">
                {banglaMonths[now.getMonth()].slice(0, 3)}
              </span>
            </div>
            <div className="min-w-0 space-y-px">
              <div className="text-[13px] font-semibold text-foreground leading-tight truncate">
                {banglaWeekdays[now.getDay()]}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight truncate">
                {toBn(bangla.day)} {bangla.month} • {toBn(hijri.day)} {hijri.month}
              </div>
            </div>
          </div>

          {/* Countdown */}
          {nextIdx >= 0 && (
            <div className="text-right flex-shrink-0 pl-2">
              <div className="text-[9px] text-muted-foreground leading-tight">
                {prayerEntries[nextIdx].name} পর্যন্ত
              </div>
              <div className="text-[15px] sm:text-base font-bold font-mono text-primary leading-tight tabular-nums">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Prayer grid — 3×2 */}
        <div className="grid grid-cols-3 divide-x divide-border/20 dark:divide-border/15">
          {prayerEntries.map((p, i) => {
            const isActive = i === currentIdx;
            const isNext = i === nextIdx;
            const isTopRow = i < 3;

            return (
              <div
                key={p.key}
                className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 transition-colors
                  ${isTopRow ? "border-b border-border/20 dark:border-border/15" : ""}
                  ${isActive
                    ? "bg-primary/10 dark:bg-primary/15"
                    : isNext
                    ? "bg-accent/40 dark:bg-accent/20"
                    : "bg-transparent"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <span className="text-xs leading-none">{p.icon}</span>
                <span className={`text-[10px] sm:text-[11px] mt-1 leading-none ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}>
                  {p.name}
                </span>
                <span className={`text-[14px] sm:text-[15px] font-semibold mt-0.5 leading-tight tabular-nums ${
                  isActive ? "text-primary" : "text-foreground"
                }`}>
                  {fmt(p.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-muted/30 dark:bg-muted/10 border-t border-border/20 dark:border-border/15">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center">
            📍 লক্ষ্মীপুর জেলার জন্য প্রযোজ্য
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
