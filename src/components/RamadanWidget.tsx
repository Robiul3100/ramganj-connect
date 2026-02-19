import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MapPin, MoreVertical } from "lucide-react";

/* ─── Districts ─── */
const DISTRICTS = [
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

const COORDS: Record<string, [number, number]> = {
  "লক্ষ্মীপুর": [22.942, 90.841],
  "ঢাকা": [23.8103, 90.4125],
  "চট্টগ্রাম": [22.3569, 91.7832],
  "রাজশাহী": [24.3745, 88.6042],
  "খুলনা": [22.8456, 89.5403],
  "বরিশাল": [22.701, 90.3535],
  "সিলেট": [24.8949, 91.8687],
  "রংপুর": [25.7439, 89.2752],
  "ময়মনসিংহ": [24.7471, 90.4203],
  "কুমিল্লা": [23.4607, 91.1809],
  "নোয়াখালী": [22.8696, 91.0993],
  "ফেনী": [23.0233, 91.3975],
  "চাঁদপুর": [23.2333, 90.6667],
  "ব্রাহ্মণবাড়িয়া": [23.9608, 91.1115],
  "কক্সবাজার": [21.4272, 92.0058],
  "গাজীপুর": [23.9999, 90.4203],
  "নারায়ণগঞ্জ": [23.6238, 90.5],
};
const DEFAULT_COORD: [number, number] = [22.942, 90.841];

/* ─── Types ─── */
interface PrayerData {
  sehri: string;   // "HH:MM"
  iftar: string;   // "HH:MM"
  ramadanDay: number | null;
  hijriYear: number;
}

/* ─── Utils ─── */
const BN = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const hhmm2sec = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 3600 + m * 60;
};

const fmtSec = (s: number) => {
  if (s <= 0) return "০০:০০:০০";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return BN(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`);
};

const ordinalBn = (n: number) => {
  const map: Record<number,string> = {
    1:"১ই",2:"২রা",3:"৩রা",4:"৪ঠা",5:"৫ই",6:"৬ই",7:"৭ই",8:"৮ই",9:"৯ই",10:"১০ই",
    11:"১১ই",12:"১২ই",13:"১৩ই",14:"১৪ই",15:"১৫ই",16:"১৬ই",17:"১৭ই",18:"১৮ই",19:"১৯ই",20:"২০শে",
    21:"২১শে",22:"২২শে",23:"২৩শে",24:"২৪শে",25:"২৫শে",26:"২৬শে",27:"২৭শে",28:"২৮শে",29:"২৯শে",30:"৩০শে",
  };
  return map[n] || BN(n);
};

/* ─── API ─── */
const fetchPrayer = async (district: string): Promise<PrayerData | null> => {
  try {
    const [lat, lng] = COORDS[district] ?? DEFAULT_COORD;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,"0");
    const mm = String(now.getMonth()+1).padStart(2,"0");
    const yyyy = now.getFullYear();
    const r = await fetch(
      `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=1&school=1`
    );
    const j = await r.json();
    if (j.code !== 200) return null;
    const { timings, date: { hijri } } = j.data;
    const hijriMonth = hijri?.month?.number ?? 0;
    return {
      sehri: (timings.Fajr ?? "04:30").slice(0,5),
      iftar: (timings.Maghrib ?? "18:10").slice(0,5),
      ramadanDay: hijriMonth === 9 ? parseInt(hijri.day) : null,
      hijriYear: parseInt(hijri?.year ?? "0"),
    };
  } catch { return null; }
};

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
const RamadanWidget = () => {
  const [enabled, setEnabled] = useState(false);
  const [district, setDistrict] = useState(
    () => localStorage.getItem("ramadan_district") || "লক্ষ্মীপুর"
  );
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");
  const [cdLabel, setCdLabel] = useState("");
  const [showDist, setShowDist] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const rafRef = useRef(0);
  const prevSec = useRef(-1);

  /* Setting */
  useEffect(() => {
    const get = async () => {
      const { data: s } = await (supabase.from as any)("site_settings")
        .select("value").eq("key","ramadan_widget_enabled").single();
      setEnabled(s?.value === "true");
    };
    get();
    const ch = supabase.channel("rmdn_s")
      .on("postgres_changes",{event:"*",schema:"public",table:"site_settings"}, get)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  /* Fetch prayer */
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchPrayer(district).then(d => { setData(d); setLoading(false); });
  }, [enabled, district]);

  /* Countdown */
  const tick = useCallback(() => {
    if (!data) { rafRef.current = requestAnimationFrame(tick); return; }
    const now = new Date();
    if (now.getSeconds() === prevSec.current) { rafRef.current = requestAnimationFrame(tick); return; }
    prevSec.current = now.getSeconds();

    const cur = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
    const sehriSec = hhmm2sec(data.sehri);
    const iftarSec = hhmm2sec(data.iftar);

    if (cur < sehriSec) {
      setCountdown(fmtSec(sehriSec - cur));
      setCdLabel("সেহরির বাকি আছে");
    } else if (cur < iftarSec) {
      setCountdown(fmtSec(iftarSec - cur));
      setCdLabel("ইফতারের বাকি আছে");
    } else {
      setCountdown("০০:০০:০০");
      setCdLabel("আজকের ইফতার শেষ 🌙");
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [data]);

  useEffect(() => {
    if (!enabled || !data) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, data, tick]);

  const pickDistrict = (d: string) => {
    setDistrict(d);
    localStorage.setItem("ramadan_district", d);
    setShowDist(false);
  };

  if (!enabled) return null;

  const yearSuffix = data?.hijriYear ? `'${String(data.hijriYear).slice(-2)}` : "'২৬";

  /* ── RENDER ── */
  return (
    <div className="px-4">
      {/* click‑outside overlay */}
      {(showDist || showMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowDist(false); setShowMenu(false); }} />
      )}

      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(155deg,#1e6b3d 0%,#175930 50%,#0f4020 100%)",
          boxShadow: "0 12px 40px -6px rgba(10,50,25,0.55)",
        }}
      >
        {/* ─ Bokeh ─ */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-2 right-[72px] w-9 h-9 rounded-full border border-white/[0.12]" />
          <div className="absolute top-7 right-10  w-5 h-5 rounded-full border border-white/[0.10]" />
          <div className="absolute -top-10 right-28 w-24 h-24 rounded-full bg-white/[0.04]" />
          <div className="absolute top-16 right-6   w-3 h-3 rounded-full bg-white/[0.12]" />
          <div className="absolute bottom-20 left-8 w-3 h-3 rounded-full bg-white/[0.12]" />
          <div className="absolute -bottom-6 left-14 w-16 h-16 rounded-full bg-white/[0.03]" />
        </div>

        {/* ─ Top bar ─ */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <h2 className="font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(20px,5.8vw,28px)", letterSpacing: "-0.01em" }}>
              রমজানের সময়সূচী {yearSuffix}
            </h2>
            <button
              onClick={() => { setShowDist(!showDist); setShowMenu(false); }}
              className="mt-1 text-green-200/80 text-sm hover:text-white transition-colors"
            >
              {district} জেলা
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Location btn */}
            <button
              onClick={() => { setShowDist(!showDist); setShowMenu(false); }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label="জেলা বাছুন"
            >
              <MapPin className="w-5 h-5 text-white" />
            </button>
            {/* More btn */}
            <div className="relative">
              <button
                onClick={() => { setShowMenu(!showMenu); setShowDist(false); }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.15)" }}
                aria-label="মেনু"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-12 rounded-2xl overflow-hidden shadow-2xl z-50 w-48"
                  style={{ background: "#164f2a", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {[
                    { label: "🔄 রিফ্রেশ করুন", action: () => { setShowMenu(false); setLoading(true); fetchPrayer(district).then(d=>{ setData(d); setLoading(false); }); } },
                    { label: "📍 জেলা বদলান", action: () => { setShowMenu(false); setShowDist(true); } },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      className="w-full text-left px-4 py-3 text-sm text-white/85 border-b last:border-0 transition-colors hover:bg-white/10"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─ District dropdown ─ */}
        {showDist && (
          <div
            className="absolute left-4 right-4 z-50 rounded-2xl shadow-2xl overflow-y-auto"
            style={{ top: 78, maxHeight: 250, background: "#143d1f", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {DISTRICTS.map(d => (
              <button key={d} onClick={() => pickDistrict(d)}
                className="w-full text-left px-4 py-3 text-sm border-b last:border-0 transition-colors"
                style={{
                  color: d === district ? "#86efac" : "rgba(255,255,255,0.8)",
                  background: d === district ? "rgba(255,255,255,0.1)" : "transparent",
                  fontWeight: d === district ? 700 : 400,
                  borderColor: "rgba(255,255,255,0.06)",
                }}>
                {d}
              </button>
            ))}
          </div>
        )}

        {/* ─ White Card ─ */}
        <div
          className="relative z-10 mx-3 mb-3 rounded-[18px] overflow-hidden"
          style={{ background: "#ffffff", boxShadow: "0 6px 30px rgba(0,0,0,0.18)" }}
        >
          {loading ? (
            /* Skeleton */
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-[3px] animate-spin"
                style={{ borderColor: "#22c55e", borderTopColor: "transparent" }} />
              <p className="text-sm" style={{ color: "#9ca3af" }}>সময়সূচী আনা হচ্ছে…</p>
            </div>
          ) : data ? (
            <>
              {/* Card header row */}
              <div className="flex items-start justify-between px-5 pt-4 pb-3"
                style={{ borderBottom: "1.5px solid #f3f4f6" }}>
                <div>
                  {data.ramadanDay !== null && (
                    <p className="font-semibold text-sm" style={{ color: "#16a34a" }}>
                      {ordinalBn(data.ramadanDay)} রমজান
                    </p>
                  )}
                  <p className="font-bold text-base" style={{ color: "#111827" }}>
                    আজকের সময়সূচী
                  </p>
                </div>
                <button
                  className="text-xs font-semibold px-4 py-2 rounded-full mt-0.5 transition-colors hover:bg-green-50"
                  style={{ border: "2px solid #15803d", color: "#15803d" }}
                >
                  রমজান ক্যালেন্ডার
                </button>
              </div>

              {/* ─ Three-column times ─ */}
              <div className="grid grid-cols-3 py-5 px-1">
                {/* Sehri */}
                <div className="flex flex-col items-center gap-2 px-3"
                  style={{ borderRight: "1.5px solid #e5e7eb" }}>
                  <span
                    className="font-extrabold leading-none tracking-tight"
                    style={{
                      fontSize: "clamp(22px,6vw,32px)",
                      color: "#111827",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {BN(data.sehri)}
                  </span>
                  <span className="text-center leading-snug" style={{ fontSize: 11, color: "#6b7280" }}>
                    পরবর্তী সেহরির শেষ
                  </span>
                  <button className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity"
                    style={{ fontSize: 12, color: "#16a34a" }}>
                    <Bell style={{ width: 14, height: 14 }} /> আলার্ম
                  </button>
                </div>

                {/* Countdown */}
                <div className="flex flex-col items-center justify-center gap-1.5 px-2">
                  <span
                    className="font-extrabold leading-none text-center"
                    style={{
                      fontSize: "clamp(16px,4.5vw,24px)",
                      color: "#16a34a",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {countdown}
                  </span>
                  <span className="text-center leading-snug" style={{ fontSize: 11, color: "#6b7280" }}>
                    {cdLabel}
                  </span>
                </div>

                {/* Iftar */}
                <div className="flex flex-col items-center gap-2 px-3"
                  style={{ borderLeft: "1.5px solid #e5e7eb" }}>
                  <span
                    className="font-extrabold leading-none tracking-tight"
                    style={{
                      fontSize: "clamp(22px,6vw,32px)",
                      color: "#111827",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {BN(data.iftar)}
                  </span>
                  <span className="text-center leading-snug" style={{ fontSize: 11, color: "#6b7280" }}>
                    আজকের ইফতার শুরু
                  </span>
                  <button className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity"
                    style={{ fontSize: 12, color: "#16a34a" }}>
                    <Bell style={{ width: 14, height: 14 }} /> আলার্ম
                  </button>
                </div>
              </div>

              {/* Footer credit */}
              <div className="pb-2 flex justify-center">
                <span style={{ fontSize: 10, color: "#d1d5db" }}>
                  Aladhan API • {district}
                </span>
              </div>
            </>
          ) : (
            /* Error */
            <div className="py-8 flex flex-col items-center gap-3">
              <p className="text-sm" style={{ color: "#9ca3af" }}>সময়সূচী আনা যায়নি</p>
              <button
                onClick={() => { setLoading(true); fetchPrayer(district).then(d=>{ setData(d); setLoading(false); }); }}
                className="text-xs font-bold px-5 py-2 rounded-full"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RamadanWidget;
