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
  const isRamadan = hijri.month === "রমজান";

  // Sehri = Fajr - 10 min, Iftar = Maghrib
  const sehriTime = new Date(pt.fajr.getTime() - 10 * 60000);
  const iftarTime = pt.maghrib;

  const prayerEntries = [
    { key: "fajr", name: "ফজর", time: pt.fajr, icon: "🌅" },
    { key: "sunrise", name: "সূর্যোদয়", time: pt.sunrise, icon: "🌤️" },
    { key: "dhuhr", name: "জোহর", time: pt.dhuhr, icon: "☀️" },
    { key: "asr", name: "আসর", time: pt.asr, icon: "🌤" },
    { key: "maghrib", name: "মাগরিব", time: pt.maghrib, icon: "🌙" },
    { key: "isha", name: "এশা", time: pt.isha, icon: "🌑" },
  ];

  // Determine current waqt and next waqt
  const waqtOrder = [pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha];
  let currentIdx = -1;
  for (let i = waqtOrder.length - 1; i >= 0; i--) {
    if (now >= waqtOrder[i]) { currentIdx = i; break; }
  }

  // Next prayer (skip sunrise as it's not a prayer)
  let nextIdx = -1;
  const prayerIndices = [0, 2, 3, 4, 5]; // fajr, dhuhr, asr, maghrib, isha
  for (const idx of prayerIndices) {
    if (now < waqtOrder[idx]) { nextIdx = idx; break; }
  }

  // Countdown to next prayer
  let countdown = "";
  if (nextIdx >= 0) {
    const diff = waqtOrder[nextIdx].getTime() - now.getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    countdown = `${toBn(hrs)}ঘ ${toBn(String(mins).padStart(2, "0"))}মি ${toBn(String(secs).padStart(2, "0"))}সে`;
  }

  return (
    <div className="px-4">
      <div
        className="rounded-2xl border border-border/60 bg-card p-4 space-y-3"
        style={{ boxShadow: "var(--shadow-card, 0 2px 12px rgba(0,0,0,0.08))" }}
      >
        {/* Header */}
        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <span className="text-destructive text-sm">⚠</span>
          নামাজের সময়সূচি কেবলমাত্র লক্ষ্মীপুর জেলার জন্য প্রযোজ্য
        </div>

        {/* Countdown bar */}
        {nextIdx >= 0 && (
          <div className="text-center bg-primary/10 rounded-lg py-1.5 px-3">
            <span className="text-xs text-muted-foreground">পরবর্তী: </span>
            <span className="text-xs font-bold text-primary">{prayerEntries[nextIdx].name}</span>
            <span className="text-xs text-muted-foreground"> — </span>
            <span className="text-sm font-mono font-bold text-primary">{countdown}</span>
          </div>
        )}

        {/* Date + Prayers */}
        <div className="flex gap-4">
          {/* Left: Date */}
          <div className="flex-shrink-0 space-y-1.5 min-w-[90px]">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground leading-none">
                {toBn(now.getDate())}
              </span>
              <div className="text-xs text-muted-foreground leading-tight">
                <div>{banglaMonths[now.getMonth()]}</div>
                <div>{banglaWeekdays[now.getDay()]}</div>
              </div>
            </div>
            <div className="text-[11px] text-primary flex items-center gap-1">
              📅 {toBn(bangla.day)} {bangla.month} {toBn(bangla.year)}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              🗓️ {toBn(hijri.day)} {hijri.month} {toBn(hijri.year)}
            </div>
          </div>

          {/* Right: Prayer grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {prayerEntries.map((p, i) => {
              const isActive = i === currentIdx;
              return (
                <div
                  key={p.key}
                  className={`flex items-center gap-1.5 text-sm rounded-md px-1.5 py-0.5 transition-colors ${
                    isActive ? "bg-primary/15 font-bold" : ""
                  }`}
                >
                  <span className="text-xs">{p.icon}</span>
                  <span className={isActive ? "text-primary" : "text-muted-foreground"}>{p.name} :</span>
                  <span className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {fmt(p.time)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ramadan Sehri/Iftar */}
        {isRamadan && (
          <div className="flex gap-3 pt-1">
            <div className="flex-1 bg-accent/60 rounded-xl py-2 px-3 text-center">
              <div className="text-[10px] text-muted-foreground">সেহরি শেষ</div>
              <div className="text-base font-bold text-foreground">{fmt(sehriTime)}</div>
            </div>
            <div className="flex-1 bg-primary/10 rounded-xl py-2 px-3 text-center">
              <div className="text-[10px] text-muted-foreground">ইফতার</div>
              <div className="text-base font-bold text-primary">{fmt(iftarTime)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
