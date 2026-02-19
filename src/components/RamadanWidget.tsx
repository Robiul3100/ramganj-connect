import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MapPin, MoreVertical } from "lucide-react";

/* ─── District Data ─── */
const BANGLADESH_DISTRICTS = [
  "লক্ষ্মীপুর", "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল",
  "সিলেট", "রংপুর", "ময়মনসিংহ", "কুমিল্লা", "নোয়াখালী", "ফেনী",
  "চাঁদপুর", "ব্রাহ্মণবাড়িয়া", "নারায়ণগঞ্জ", "গাজীপুর", "মুন্সিগঞ্জ",
  "মানিকগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "নেত্রকোনা", "শেরপুর",
  "জামালপুর", "নরসিংদী", "গোপালগঞ্জ", "ফরিদপুর", "মাদারীপুর",
  "শরীয়তপুর", "রাজবাড়ী", "সুনামগঞ্জ", "হবিগঞ্জ", "মৌলভীবাজার",
  "বগুড়া", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "পাবনা", "নাটোর", "সিরাজগঞ্জ",
  "জয়পুরহাট", "যশোর", "কুষ্টিয়া", "মেহেরপুর", "চুয়াডাঙ্গা",
  "ঝিনাইদহ", "মাগুরা", "নড়াইল", "সাতক্ষীরা", "বাগেরহাট",
  "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "ভোলা", "বরগুনা",
  "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট",
  "কুড়িগ্রাম", "গাইবান্ধা", "কক্সবাজার", "বান্দরবান", "রাঙ্গামাটি", "খাগড়াছড়ি",
];

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
  "গাজীপুর": { lat: 23.9999, lng: 90.4203 },
  "নারায়ণগঞ্জ": { lat: 23.6238, lng: 90.5 },
};

const DEFAULT_COORDS = { lat: 22.942, lng: 90.841 };

/* ─── Helpers ─── */
interface PrayerData {
  sehriEnd: string;
  iftarStart: string;
  date: string;
  ramadanDay: number | null;
  hijriMonth: number;
  hijriYear: number;
}

const toTotalSeconds = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
};

const formatHHMMSS = (secs: number) => {
  if (secs <= 0) return "০০:০০:০০";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Convert English digits → Bengali digits
const toBengaliDigits = (str: string) =>
  str.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const fetchPrayerTimes = async (district: string): Promise<PrayerData | null> => {
  try {
    const coords = DISTRICT_COORDS[district] || DEFAULT_COORDS;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=1&school=1`
    );
    const json = await res.json();
    if (json.code !== 200) return null;

    const timings = json.data.timings;
    const hijri = json.data.date?.hijri;

    const sehriEnd = timings.Fajr?.slice(0, 5) || "04:30";
    const iftarStart = timings.Maghrib?.slice(0, 5) || "18:00";

    const hijriMonth: number = hijri?.month?.number || 0;
    const hijriYear: number = parseInt(hijri?.year || "0");
    let ramadanDay: number | null = null;
    if (hijriMonth === 9) {
      ramadanDay = parseInt(hijri.day);
    }

    return { sehriEnd, iftarStart, date: dateStr, ramadanDay, hijriMonth, hijriYear };
  } catch {
    return null;
  }
};

/* ─── Ordinal in Bengali ─── */
const bengaliOrdinal = (n: number) => {
  const ordinals: Record<number, string> = {
    1: "১ম", 2: "২য়", 3: "৩য়", 4: "৪র্থ", 5: "৫ম",
    6: "৬ষ্ঠ", 7: "৭ম", 8: "৮ম", 9: "৯ম", 10: "১০ম",
  };
  return ordinals[n] || `${toBengaliDigits(String(n))}তম`;
};

/* ─── Main Component ─── */
const RamadanWidget = () => {
  const [enabled, setEnabled] = useState(false);
  const [district, setDistrict] = useState(
    () => localStorage.getItem("ramadan_district") || "লক্ষ্মীপুর"
  );
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");
  const [countdownLabel, setCountdownLabel] = useState("লোড হচ্ছে...");
  const [showDistrict, setShowDistrict] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const rafRef = useRef<number>(0);
  const lastSecRef = useRef(-1);

  /* Realtime setting fetch */
  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await (supabase.from as any)("site_settings")
        .select("value")
        .eq("key", "ramadan_widget_enabled")
        .single();
      setEnabled(data?.value === "true");
    };
    fetchSetting();
    const ch = supabase
      .channel("ramadan_setting_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, fetchSetting)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  /* Fetch prayer times when district changes */
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchPrayerTimes(district).then((d) => {
      setPrayerData(d);
      setLoading(false);
    });
  }, [enabled, district]);

  /* Countdown engine */
  const tick = useCallback(() => {
    if (!prayerData) { rafRef.current = requestAnimationFrame(tick); return; }

    const now = new Date();
    const curSec = now.getSeconds();
    if (curSec === lastSecRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
    lastSecRef.current = curSec;

    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const sehriSec = toTotalSeconds(prayerData.sehriEnd);
    const iftarSec = toTotalSeconds(prayerData.iftarStart);

    let remaining: number;
    let label: string;

    if (nowSec < sehriSec) {
      remaining = sehriSec - nowSec;
      label = "সেহরির বাকি আছে";
    } else if (nowSec < iftarSec) {
      remaining = iftarSec - nowSec;
      label = "ইফতারের বাকি আছে";
    } else {
      remaining = 0;
      label = "আজকের ইফতার শেষ 🌙";
    }

    setCountdown(toBengaliDigits(formatHHMMSS(remaining)));
    setCountdownLabel(label);

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

  const isRamadan = prayerData?.ramadanDay != null;
  const ramadanDayBn = prayerData?.ramadanDay
    ? `${bengaliOrdinal(prayerData.ramadanDay)} রমজান`
    : null;
  const yearSuffix = prayerData?.hijriYear
    ? `'${String(prayerData.hijriYear).slice(-2)}`
    : "'২৬";

  return (
    <div className="px-4">
      {/* ── Outer green container ── */}
      <div
        className="relative rounded-3xl overflow-visible"
        style={{
          background: "linear-gradient(160deg, #1a5c35 0%, #174d2c 40%, #123d22 100%)",
          boxShadow: "0 10px 40px -6px rgba(15,60,30,0.55)",
        }}
      >
        {/* Decorative bokeh circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-3 right-20 w-10 h-10 rounded-full border border-white/10" />
          <div className="absolute top-8 right-10 w-5 h-5 rounded-full border border-white/10" />
          <div className="absolute -top-8 right-32 w-20 h-20 rounded-full bg-white/[0.04]" />
          <div className="absolute top-16 right-6 w-3 h-3 rounded-full bg-white/10" />
          <div className="absolute bottom-14 left-6 w-3 h-3 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 left-10 w-14 h-14 rounded-full bg-white/[0.03]" />
        </div>

        {/* ── Header ── */}
        <div className="relative z-10 px-5 pt-5 pb-4 flex items-start justify-between">
          {/* Title + district */}
          <div>
            <h2 className="text-white font-bold leading-tight" style={{ fontSize: "clamp(18px, 5.5vw, 26px)" }}>
              রমজানের সময়সূচী {yearSuffix}
            </h2>
            {/* District selector button */}
            <button
              onClick={() => { setShowDistrict(!showDistrict); setShowMenu(false); }}
              className="flex items-center gap-1 mt-1 text-green-200/80 text-sm hover:text-white transition-colors"
            >
              <span>{district} জেলা</span>
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => { setShowDistrict(!showDistrict); setShowMenu(false); }}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="জেলা বাছুন"
            >
              <MapPin className="w-4 h-4 text-white" />
            </button>
            <div className="relative">
              <button
                onClick={() => { setShowMenu(!showMenu); setShowDistrict(false); }}
                className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="মেনু"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-11 rounded-2xl overflow-hidden shadow-2xl z-50 w-44"
                  style={{ background: "#174d2c", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    🔄 রিফ্রেশ
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors border-t border-white/10"
                    onClick={() => { setShowDistrict(true); setShowMenu(false); }}
                  >
                    📍 জেলা পরিবর্তন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── District Dropdown ── */}
        {showDistrict && (
          <div
            className="absolute left-4 right-4 z-50 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              top: "72px",
              background: "#143d20",
              border: "1px solid rgba(255,255,255,0.15)",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {BANGLADESH_DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => handleDistrictSelect(d)}
                className="w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/[0.06] last:border-0"
                style={{
                  color: d === district ? "#6ee7a0" : "rgba(255,255,255,0.8)",
                  background: d === district ? "rgba(255,255,255,0.1)" : "transparent",
                  fontWeight: d === district ? 700 : 400,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* ── White Card ── */}
        <div
          className="relative z-10 mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.98)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          }}
        >
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div
                className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "#22c55e", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "#6b7280" }}>সময়সূচী লোড হচ্ছে...</p>
            </div>
          ) : prayerData ? (
            <>
              {/* Card top row */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  {ramadanDayBn && (
                    <p className="font-semibold text-sm" style={{ color: "#15803d" }}>{ramadanDayBn}</p>
                  )}
                  <p className="font-bold text-sm" style={{ color: "#1f2937" }}>আজকের সময়সূচী</p>
                </div>
                <button
                  className="text-xs font-semibold px-4 py-2 rounded-full transition-colors hover:opacity-80"
                  style={{
                    border: "2px solid #15803d",
                    color: "#15803d",
                    background: "transparent",
                  }}
                >
                  রমজান ক্যালেন্ডার
                </button>
              </div>

              {/* ── Three columns ── */}
              <div className="grid grid-cols-3 py-4 px-1" style={{ borderBottom: "1px solid #f3f4f6" }}>
                {/* Sehri */}
                <div
                  className="flex flex-col items-center gap-1.5 px-2"
                  style={{ borderRight: "1px solid #e5e7eb" }}
                >
                  <p
                    className="font-bold leading-none"
                    style={{
                      fontSize: "clamp(20px, 5.5vw, 28px)",
                      color: "#1f2937",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {toBengaliDigits(prayerData.sehriEnd)}
                  </p>
                  <p className="text-center leading-tight" style={{ fontSize: 11, color: "#6b7280" }}>
                    পরবর্তী সেহরির শেষ
                  </p>
                  <button
                    className="flex items-center gap-1 font-semibold transition-colors hover:opacity-70"
                    style={{ color: "#16a34a", fontSize: 12 }}
                  >
                    <Bell style={{ width: 13, height: 13 }} /> আলার্ম
                  </button>
                </div>

                {/* Countdown */}
                <div className="flex flex-col items-center justify-center gap-1 px-2">
                  <p
                    className="font-bold leading-none text-center"
                    style={{
                      fontSize: "clamp(15px, 4.2vw, 22px)",
                      color: "#16a34a",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {countdown}
                  </p>
                  <p className="text-center leading-tight" style={{ fontSize: 11, color: "#6b7280" }}>
                    {countdownLabel}
                  </p>
                </div>

                {/* Iftar */}
                <div
                  className="flex flex-col items-center gap-1.5 px-2"
                  style={{ borderLeft: "1px solid #e5e7eb" }}
                >
                  <p
                    className="font-bold leading-none"
                    style={{
                      fontSize: "clamp(20px, 5.5vw, 28px)",
                      color: "#1f2937",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {toBengaliDigits(prayerData.iftarStart)}
                  </p>
                  <p className="text-center leading-tight" style={{ fontSize: 11, color: "#6b7280" }}>
                    আজকের ইফতার শুরু
                  </p>
                  <button
                    className="flex items-center gap-1 font-semibold transition-colors hover:opacity-70"
                    style={{ color: "#16a34a", fontSize: 12 }}
                  >
                    <Bell style={{ width: 13, height: 13 }} /> আলার্ম
                  </button>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="px-4 py-2 flex items-center justify-center">
                <p style={{ fontSize: 10, color: "#9ca3af" }}>
                  তথ্যসূত্র: Aladhan API • {district} জেলা
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center gap-2">
              <p className="text-sm" style={{ color: "#6b7280" }}>সময়সূচী লোড করা সম্ভব হয়নি।</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchPrayerTimes(district).then((d) => { setPrayerData(d); setLoading(false); });
                }}
                className="text-xs font-semibold px-4 py-2 rounded-full"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {(showDistrict || showMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowDistrict(false); setShowMenu(false); }}
        />
      )}
    </div>
  );
};

export default RamadanWidget;
