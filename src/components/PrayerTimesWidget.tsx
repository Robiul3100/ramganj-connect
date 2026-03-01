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
  const ampm = h >= 12 ? "PM" : "AM";
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
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden">
        {/* Location badge */}
        <div className="bg-muted/50 px-3 py-1.5 flex items-center justify-center gap-1.5 border-b border-border/30">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground">
            📍 লক্ষ্মীপুর জেলা • নামাজের সময়সূচি
          </span>
        </div>

        {/* Date section */}
        <div className="px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-xl font-bold text-primary leading-none">{toBn(now.getDate())}</span>
              <span className="text-[8px] sm:text-[9px] text-primary/70 leading-none mt-0.5">
                {banglaMonths[now.getMonth()].slice(0, 3)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-semibold text-foreground truncate">
                {banglaWeekdays[now.getDay()]}
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                {toBn(bangla.day)} {bangla.month} {toBn(bangla.year)} বঙ্গাব্দ
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                {toBn(hijri.day)} {hijri.month} {toBn(hijri.year)} হিজরি
              </div>
            </div>
          </div>

          {/* Countdown pill */}
          {nextIdx >= 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 text-center flex-shrink-0">
              <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
                {prayerEntries[nextIdx].icon} {prayerEntries[nextIdx].name} বাকি
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-primary leading-tight tracking-wide">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Prayer times grid */}
        <div className="px-2 sm:px-3 pb-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {prayerEntries.map((p, i) => {
              const isActive = i === currentIdx;
              const isNext = i === nextIdx;
              return (
                <div
                  key={p.key}
                  className={`relative rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 text-center transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                      : isNext
                      ? "bg-primary/10 border border-primary/25 ring-1 ring-primary/10"
                      : "bg-muted/40 border border-border/20"
                  }`}
                >
                  <span className="text-xs sm:text-sm block">{p.icon}</span>
                  <span className={`text-[10px] sm:text-xs font-medium block mt-0.5 ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {p.name}
                  </span>
                  <span className={`text-sm sm:text-base font-bold block leading-tight ${
                    isActive ? "text-primary-foreground" : isNext ? "text-primary" : "text-foreground"
                  }`}>
                    {fmt(p.time)}
                  </span>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary/60 rounded-full border-2 border-card animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
