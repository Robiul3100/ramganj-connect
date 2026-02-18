import { useEffect, useState } from "react";
import logoImg from "@/assets/ramganj-logo.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    const finishTimer = setTimeout(() => onFinish(), 4000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Clean logo with smooth shine sweep — larger, shifted slightly down */}
      <div className="relative overflow-hidden mt-8" style={{ width: 270, height: 270 }}>
        <img
          src={logoImg}
          alt="Ramganj City Logo"
          className="w-full h-full object-contain"
          style={{ animation: "logo-appear 0.5s ease-out both" }}
        />
        {/* Smooth glass shine — wider, softer beam */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.12) 60%, transparent 75%)",
            animation: "shine-smooth 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
          }}
        />
      </div>

      {/* Facebook Lite style bouncing dots loader — between logo and text */}
      <div
        className="flex items-center gap-2 mt-3 mb-2"
        style={{ animation: "slide-up-text 0.5s ease-out 0.25s both" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 10,
              height: 10,
              background: "#0097A7",
              animation: `fb-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Text block — each line slides up with stagger */}
      <div className="flex flex-col items-center gap-1 overflow-hidden">
        <p
          className="text-lg font-bold text-gray-800 tracking-wide"
          style={{ animation: "slide-up-text 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both" }}
        >
          পরিকল্পনা ও বাস্তবায়ন
        </p>

        <div
          className="w-40 h-px my-1"
          style={{
            background: "linear-gradient(90deg, transparent, #0097A7, transparent)",
            animation: "slide-up-text 0.55s cubic-bezier(0.22,1,0.36,1) 0.48s both",
          }}
        />

        <p
          className="text-base font-bold"
          style={{
            color: "#0097A7",
            animation: "slide-up-text 0.55s cubic-bezier(0.22,1,0.36,1) 0.58s both",
          }}
        >
          Ramganj City Organisation
        </p>

        <p
          className="text-sm text-gray-500 mt-1"
          style={{ animation: "slide-up-text 0.55s cubic-bezier(0.22,1,0.36,1) 0.70s both" }}
        >
          রামগঞ্জকে দেখুন, রামগঞ্জকে জানুন
        </p>

        <p
          className="text-xs text-gray-400"
          style={{ animation: "slide-up-text 0.55s cubic-bezier(0.22,1,0.36,1) 0.82s both" }}
        >
          www.ramganjcity.com
        </p>
      </div>

      {/* Developer credit at bottom */}
      <div
        className="absolute bottom-8 flex items-center justify-center"
        style={{ animation: "slide-up-text 0.5s ease-out 1s both" }}
      >
        <p className="text-xs" style={{ color: "#111" }}>
          Developed by:{" "}
          <span style={{ color: "#e53e3e" }}>&lt;/</span>
          <span style={{ color: "#111", fontWeight: 600 }}>RSF ROBIUL</span>
          <span style={{ color: "#e53e3e" }}>&lt;/&gt;</span>
        </p>
      </div>

      <style>{`
        @keyframes logo-appear {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shine-smooth {
          0%   { transform: translateX(-160%); }
          50%  { transform: translateX(160%); }
          100% { transform: translateX(160%); }
        }
        @keyframes slide-up-text {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fb-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
