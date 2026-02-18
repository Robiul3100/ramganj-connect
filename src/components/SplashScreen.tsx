import { useEffect, useState } from "react";
import logoImg from "@/assets/ramganj-logo.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);
    const finishTimer = setTimeout(() => onFinish(), 2900);
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
      {/* Logo with glass shining effect */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Glow behind logo */}
        <div
          className="absolute rounded-full blur-2xl opacity-30 animate-pulse"
          style={{
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle, hsl(200,85%,65%) 0%, hsl(185,70%,55%) 50%, transparent 80%)",
          }}
        />

        {/* Logo image container with shine effect */}
        <div className="relative overflow-hidden rounded-3xl" style={{ width: 200, height: 200 }}>
          <img
            src={logoImg}
            alt="Ramganj City Logo"
            className="w-full h-full object-contain animate-fade-in"
            style={{ animationDuration: "0.6s" }}
          />
          {/* Glass shine sweep */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.65) 48%, rgba(255,255,255,0.85) 52%, transparent 80%)",
              animation: "shine-sweep 2.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Text block */}
      <div className="flex flex-col items-center gap-1 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
        <p className="text-lg font-bold text-gray-800 tracking-wide">পরিকল্পনা ও বাস্তবায়ন</p>
        <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-1" />
        <p className="text-base font-bold" style={{ color: "#0097A7" }}>
          Ramganj City Organisation
        </p>
        <p className="text-sm text-gray-500 mt-1">রামগঞ্জকে দেখুন, রামগঞ্জকে জানুন</p>
        <p className="text-xs text-gray-400">www.ramganjcity.com</p>
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(200,85%,55%), hsl(185,70%,50%))",
            animation: "loading-bar 2.4s ease-in-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes shine-sweep {
          0% { transform: translateX(-150%); }
          40% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
