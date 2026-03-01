import { useState, useEffect } from "react";
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from "adhan";

// Lakshmipur, Bangladesh coordinates
const COORDS = new Coordinates(22.9447, 90.8282);
const PARAMS = CalculationMethod.Karachi();

const toBengaliNum = (n: number | string): string => {
  const bengali = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => bengali[parseInt(d)]);
};

const banglaWeekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const banglaMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const banglaMonthsBangla = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];

const hijriMonths = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];

// Simple Gregorian to Bengali calendar conversion
const getBanglaDate = (date: Date) => {
  // Bengali new year starts April 14
  const bengaliEpochDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30]; // days in each Bengali month
  const startMonth = 3; // April (0-indexed)
  const startDay = 14;

  let year = date.getFullYear() - 593;
  let dayOfYear = 0;
  const gMonth = date.getMonth();
  const gDay = date.getDate();

  // Calculate days from April 14 to current date
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = [31, isLeap(date.getFullYear()) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (gMonth < startMonth || (gMonth === startMonth && gDay < startDay)) {
    year--;
    // Count from April 14 of previous year
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
  const bDay = remaining + 1;

  return { day: bDay, month: banglaMonthsBangla[bMonth], year: year };
};

// Approximate Hijri date calculation
const getHijriDate = (date: Date) => {
  const epoch = new Date(622, 6, 16).getTime();
  const diff = date.getTime() - epoch;
  const days = Math.floor(diff / 86400000);
  const hijriDayLength = 29.530588853;
  const lunarMonths = days / hijriDayLength;
  const totalMonths = Math.floor(lunarMonths);
  const hijriYear = Math.floor(totalMonths / 12) + 1;
  const hijriMonth = (totalMonths % 12);
  const hijriDay = Math.floor((lunarMonths - totalMonths) * hijriDayLength) + 1;

  return { day: hijriDay, month: hijriMonths[hijriMonth] || "রমজান", year: hijriYear };
};

const formatTime = (d: Date): string => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${toBengaliNum(h)}:${toBengaliNum(String(m).padStart(2, "0"))}`;
};

const PrayerTimesWidget = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const pt = new PrayerTimes(COORDS, now, PARAMS);
  const bangla = getBanglaDate(now);
  const hijri = getHijriDate(now);

  const prayers = [
    { name: "ফজর", time: pt.fajr, icon: "🌅" },
    { name: "সূর্যোদয়", time: pt.sunrise, icon: "🌤️" },
    { name: "জোহর", time: pt.dhuhr, icon: "☀️" },
    { name: "আসর", time: pt.asr, icon: "🌤" },
    { name: "মাগরিব", time: pt.maghrib, icon: "🌙" },
    { name: "এশা", time: pt.isha, icon: "🌑" },
  ];

  return (
    <div className="px-4">
      <div
        className="rounded-2xl border border-border/60 bg-card p-4 space-y-3"
        style={{ boxShadow: "var(--shadow-card, 0 2px 12px rgba(0,0,0,0.08))" }}
      >
        {/* Header notice */}
        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <span className="text-destructive text-sm">⚠</span>
          নামাজের সময়সূচি কেবলমাত্র লক্ষ্মীপুর জেলার জন্য প্রযোজ্য
        </div>

        {/* Date section + prayer grid */}
        <div className="flex gap-4">
          {/* Left: Date info */}
          <div className="flex-shrink-0 space-y-1.5 min-w-[90px]">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground leading-none">
                {toBengaliNum(now.getDate())}
              </span>
              <div className="text-xs text-muted-foreground leading-tight">
                <div>{banglaMonths[now.getMonth()]}</div>
                <div>{banglaWeekdays[now.getDay()]}</div>
              </div>
            </div>
            <div className="text-[11px] text-primary flex items-center gap-1">
              📅 {toBengaliNum(bangla.day)} {bangla.month} {toBengaliNum(bangla.year)}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              🗓️ {toBengaliNum(hijri.day)} {hijri.month} {toBengaliNum(hijri.year)}
            </div>
          </div>

          {/* Right: Prayer times grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {prayers.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-sm">
                <span className="text-xs">{p.icon}</span>
                <span className="text-muted-foreground">{p.name} :</span>
                <span className="font-semibold text-foreground">{formatTime(p.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
