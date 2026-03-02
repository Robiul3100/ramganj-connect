import { useEffect, useState } from "react";
import logoImg from "@/assets/ramganj-logo.webp";

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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ambient glow rings behind logo */}
      <div className="relative flex items-center justify-center mt-4">
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
            animation: "glow-pulse 2.5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full border border-primary/10"
          style={{
            width: 260,
            height: 260,
            animation: "ring-expand 2.5s ease-out infinite",
          }}
        />
        <div
          className="absolute rounded-full border border-primary/5"
          style={{
            width: 260,
            height: 260,
            animation: "ring-expand 2.5s ease-out 0.6s infinite",
          }}
        />

        {/* Logo with 3D pop-in */}
        <img
          src={logoImg}
          alt="Ramganj City Logo"
          className="relative z-10"
          style={{
            width: 220,
            height: 220,
            objectFit: "contain",
            animation: "logo-3d-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            filter: "drop-shadow(0 8px 24px hsl(var(--primary) / 0.18))",
          }}
        />
      </div>

      {/* Bouncing dots loader */}
      <div
        className="flex items-center gap-2 mt-5 mb-3"
        style={{ animation: "slide-up-text 0.5s ease-out 0.5s both" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full bg-primary"
            style={{
              width: 9,
              height: 9,
              animation: `dot-wave 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Text block with staggered reveals */}
      <div className="flex flex-col items-center gap-1.5 overflow-hidden">
        <p
          className="text-lg font-bold text-foreground tracking-wide"
          style={{ animation: "text-reveal 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both" }}
        >
          পরিকল্পনা ও বাস্তবায়ন
        </p>

        <div
          className="w-44 h-px my-0.5"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
            animation: "line-grow 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both",
          }}
        />

        <p
          className="text-base font-bold text-primary"
          style={{ animation: "text-reveal 0.6s cubic-bezier(0.22,1,0.36,1) 0.65s both" }}
        >
          Ramganj City Organisation
        </p>

        <p
          className="text-sm text-muted-foreground mt-0.5"
          style={{ animation: "text-reveal 0.6s cubic-bezier(0.22,1,0.36,1) 0.8s both" }}
        >
          রামগঞ্জকে দেখুন, রামগঞ্জকে জানুন
        </p>

        <p
          className="text-xs text-muted-foreground/60"
          style={{ animation: "text-reveal 0.6s cubic-bezier(0.22,1,0.36,1) 0.95s both" }}
        >
          www.ramganjcity.com
        </p>
      </div>

      {/* Developer credit */}
      <div
        className="absolute bottom-8 flex items-center justify-center"
        style={{ animation: "text-reveal 0.5s ease-out 1.1s both" }}
      >
        <p className="text-xs text-foreground/70">
          Developed by:{" "}
          <span className="text-destructive font-mono">&lt;/</span>
          <span className="text-foreground font-semibold">RSF ROBIUL</span>
          <span className="text-destructive font-mono">&lt;/&gt;</span>
        </p>
      </div>

      <style>{`
        @keyframes logo-3d-pop {
          0% { opacity: 0; transform: scale(0.4) rotateY(90deg); }
          60% { opacity: 1; transform: scale(1.05) rotateY(-5deg); }
          100% { opacity: 1; transform: scale(1) rotateY(0deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes dot-wave {
          0%, 60%, 100% { transform: translateY(0) scale(0.7); opacity: 0.4; }
          30% { transform: translateY(-8px) scale(1); opacity: 1; }
        }
        @keyframes text-reveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes line-grow {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
