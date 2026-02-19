import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MapPin, ChevronDown, Moon } from "lucide-react";

const BANGLADESH_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "লক্ষ্মীপুর", "কুমিল্লা", "নোয়াখালী", "ফেনী", "চাঁদপুর", "ব্রাহ্মণবাড়িয়া",
  "নারায়ণগঞ্জ", "গাজীপুর", "মুন্সিগঞ্জ", "মানিকগঞ্জ", "টাঙ্গাইল", "ময়মনসিংহ",
  "কিশোরগঞ্জ", "নেত্রকোনা", "শেরপুর", "জামালপুর", "নরসিংদী", "গোপালগঞ্জ",
  "ফরিদপুর", "মাদারীপুর", "শরীয়তপুর", "রাজবাড়ী", "সুনামগঞ্জ", "হবিগঞ্জ",
  "মৌলভীবাজার", "বগুড়া", "রাজশাহী", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "পাবনা",
  "নাটোর", "সিরাজগঞ্জ", "জয়পুরহাট", "যশোর", "কুষ্টিয়া", "মেহেরপুর",
  "চুয়াডাঙ্গা", "ঝিনাইদহ", "মাগুরা", "নড়াইল", "সাতক্ষীরা", "বাগেরহাট",
  "খুলনা", "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "ভোলা", "বরগুনা",
  "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট", "কুড়িগ্রাম",
  "গাইবান্ধা", "কক্সবাজার", "বান্দরবান", "রাঙ্গামাটি", "খাগড়াছড়ি",
];

// District to Aladhan lat/lng map (approximate)
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "লক্ষ্মীপুর": { lat: 22.942, lng: 90.841 },
  "ঢাকা": { lat: 23.8103, lng: 90.4125 },
  "চট্টগ্রাম": { lat: 22.3569, lng: 91.7832 },
  "রাজশাহী": { lat: 24.3745, lng: 88.6042 },
  "খুলনা": { lat: 22.8456, lng: 89.5403 },
  "বরিশাল": { lat: 22.701, lng: 90.3535 },
  "সিলেট": { lat: 24.8949, lng: 91.8687 },
  "রংপুর": { lat: 25.7439, lng: 89.2752 },
  "ময়মনসিংহ": { lat: 24.7471, lng: 90.4203 },
  "কুমিল্লা": { lat: 23.4607, lng: 91.1809 },
  "নোয়াখালী": { lat: 22.8696, lng: 91.0993 },
  "ফেনী": { lat: 23.0233, lng: 91.3975 },
  "চাঁদপুর": { lat: 23.2333, lng: 90.6667 },
  "ব্রাহ্মণবাড়িয়া": { lat: 23.9608, lng: 91.1115 },
  "কক্সবাজার": { lat: 21.4272, lng: 92.0058 },
};

interface PrayerData {
  sehriEnd: string;   // "HH:MM"
  iftarStart: string; // "HH:MM"
  date: string;
  ramadanDay: number | null;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const formatCountdown = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const fetchPrayerTimes = async (district: string): Promise<PrayerData | null> => {
  try {
    const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS["লক্ষ্মীপুর"];
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=1&school=1`
    );
    const json = await res.json();
    if (json.code !== 200) return null;

    const timings = json.data.timings;
    const hijri = json.data.date?.hijri;

    // Sehri = Fajr, Iftar = Maghrib
    const sehriEnd = timings.Fajr?.slice(0, 5) || "04:30";
    const iftarStart = timings.Maghrib?.slice(0, 5) || "18:00";

    // Calculate Ramadan day from hijri date
    let ramadanDay: number | null = null;
    if (hijri?.month?.number === 9) {
      ramadanDay = parseInt(hijri.day);
    }

    return {
      sehriEnd,
      iftarStart,
      date: dateStr,
      ramadanDay,
    };
  } catch {
    return null;
  }
};

const RamadanWidget = () => {
  const [enabled, setEnabled] = useState(false);
  const [district, setDistrict] = useState(() => localStorage.getItem("ramadan_district") || "লক্ষ্মীপুর");
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [countdownLabel, setCountdownLabel] = useState("লোড হচ্ছে...");
  const [targetTime, setTargetTime] = useState("");
  const [targetLabel, setTargetLabel] = useState("");
  const [showDistrict, setShowDistrict] = useState(false);
  const [isRamadan, setIsRamadan] = useState(false);
  const rafRef = useRef<number>(0);
  const lastSecRef = useRef(-1);

  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await (supabase.from as any)("site_settings")
        .select("value")
        .eq("key", "ramadan_widget_enabled")
        .single();
      setEnabled(data?.value === "true");
    };
    fetchSetting();

    const ch = supabase.channel("ramadan_setting_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, fetchSetting)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchPrayerTimes(district).then((data) => {
      setPrayerData(data);
      if (data?.ramadanDay) setIsRamadan(true);
      else setIsRamadan(false);
    });
  }, [enabled, district]);

  const tick = useCallback(() => {
    if (!prayerData) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSec = now.getSeconds();

    // Only update state if second changed
    if (currentSec === lastSecRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastSecRef.current = currentSec;

    const sehriMinutes = toMinutes(prayerData.sehriEnd);
    const iftarMinutes = toMinutes(prayerData.iftarStart);
    const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    let targetSec: number;
    let label: string;
    let tTime: string;
    let tLabel: string;

    if (currentMinutes < sehriMinutes) {
      // Before sehri
      const targetTotalSec = sehriMinutes * 60;
      targetSec = targetTotalSec - currentTotalSec;
      label = "সেহরির বাকি আছে";
      tTime = prayerData.sehriEnd;
      tLabel = "সেহরির শেষ";
    } else if (currentMinutes < iftarMinutes) {
      // Before iftar
      const targetTotalSec = iftarMinutes * 60;
      targetSec = targetTotalSec - currentTotalSec;
      label = "ইফতারের বাকি আছে";
      tTime = prayerData.iftarStart;
      tLabel = "আজকের ইফতার";
    } else {
      // After iftar
      targetSec = 0;
      label = "ইফতার হয়ে গেছে 🌙";
      tTime = prayerData.iftarStart;
      tLabel = "আজকের ইফতার";
    }

    if (targetSec > 0) {
      setCountdown(formatCountdown(targetSec));
    } else if (targetSec === 0) {
      setCountdown("00:00:00");
    }
    setCountdownLabel(label);
    setTargetTime(tTime);
    setTargetLabel(tLabel);

    rafRef.current = requestAnimationFrame(tick);
  }, [prayerData]);

  useEffect(() => {
    if (!enabled || !prayerData) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, prayerData, tick]);

  const handleDistrictSelect = (d: string) => {
    setDistrict(d);
    localStorage.setItem("ramadan_district", d);
    setShowDistrict(false);
  };

  if (!enabled) return null;

  return (
    <div className="px-4">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(145,55%,22%) 0%, hsl(155,50%,18%) 50%, hsl(140,45%,14%) 100%)",
          boxShadow: "0 8px 32px -4px rgba(20,80,40,0.5)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-2 right-16 w-8 h-8 rounded-full border border-white/10" />
        <div className="absolute top-6 right-8 w-4 h-4 rounded-full bg-white/8" />
        <div className="absolute -top-6 right-28 w-16 h-16 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/3 -translate-x-6 translate-y-6" />

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Moon className="w-4 h-4 text-green-300" fill="currentColor" />
              <h2 className="text-white font-bold text-lg leading-tight">
                রমজানের সময়সূচী
              </h2>
            </div>

            {/* District selector */}
            <button
              onClick={() => setShowDistrict(!showDistrict)}
              className="flex items-center gap-1 text-green-200/80 text-sm hover:text-green-100 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{district} জেলা</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDistrict ? "rotate-180" : ""}`} />
            </button>
          </div>

          {isRamadan && prayerData?.ramadanDay && (
            <div className="text-right">
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
                <p className="text-green-200 text-xs">আজ</p>
                <p className="text-white font-bold text-base">{prayerData.ramadanDay}ই রমজান</p>
              </div>
            </div>
          )}
        </div>

        {/* District Dropdown */}
        {showDistrict && (
          <div
            className="absolute top-20 left-4 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "hsl(145,55%,16%)", border: "1px solid rgba(255,255,255,0.15)", maxHeight: 220, overflowY: "auto" }}
          >
            {BANGLADESH_DISTRICTS.filter((d, i, arr) => arr.indexOf(d) === i).map((d) => (
              <button
                key={d}
                onClick={() => handleDistrictSelect(d)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${d === district ? "text-green-300 font-semibold bg-white/10" : "text-white/80 hover:bg-white/8 hover:text-white"}`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* White card */}
        <div
          className="relative z-10 mx-4 mb-4 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {prayerData ? (
            <>
              {/* Card header */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                <div>
                  {isRamadan && prayerData.ramadanDay ? (
                    <p className="text-green-700 font-semibold text-sm">{prayerData.ramadanDay}ই রমজান</p>
                  ) : (
                    <p className="text-gray-500 text-sm">আজকের সময়সূচী</p>
                  )}
                  <p className="text-gray-800 font-bold text-sm">আজকের সময়সূচী</p>
                </div>
                <button
                  className="border-2 border-green-700 text-green-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-50 transition-colors"
                  onClick={() => {}}
                >
                  রমজান ক্যালেন্ডার
                </button>
              </div>

              {/* Times row */}
              <div className="px-2 py-4 grid grid-cols-3 divide-x divide-gray-100">
                {/* Sehri */}
                <div className="flex flex-col items-center gap-2 px-3">
                  <p
                    className="font-bold text-gray-800 leading-none"
                    style={{ fontSize: "clamp(18px, 5vw, 26px)", fontFeatureSettings: "'tnum'" }}
                  >
                    {prayerData.sehriEnd}
                  </p>
                  <p className="text-gray-500 text-xs text-center leading-tight">পরবর্তী সেহরির শেষ</p>
                  <button className="flex items-center gap-1 text-green-700 text-xs font-semibold hover:text-green-800 transition-colors">
                    <Bell className="w-3.5 h-3.5" /> আলার্ম
                  </button>
                </div>

                {/* Countdown */}
                <div className="flex flex-col items-center justify-center gap-1 px-2">
                  <p
                    className="font-bold leading-none text-center"
                    style={{
                      fontSize: "clamp(14px, 4vw, 20px)",
                      fontFeatureSettings: "'tnum'",
                      color: "hsl(145,60%,35%)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {countdown}
                  </p>
                  <p className="text-gray-500 text-xs text-center leading-tight">{countdownLabel}</p>
                </div>

                {/* Iftar */}
                <div className="flex flex-col items-center gap-2 px-3">
                  <p
                    className="font-bold text-gray-800 leading-none"
                    style={{ fontSize: "clamp(18px, 5vw, 26px)", fontFeatureSettings: "'tnum'" }}
                  >
                    {prayerData.iftarStart}
                  </p>
                  <p className="text-gray-500 text-xs text-center leading-tight">আজকের ইফতার শুরু</p>
                  <button className="flex items-center gap-1 text-green-700 text-xs font-semibold hover:text-green-800 transition-colors">
                    <Bell className="w-3.5 h-3.5" /> আলার্ম
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-8 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">সময়সূচী লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RamadanWidget;
