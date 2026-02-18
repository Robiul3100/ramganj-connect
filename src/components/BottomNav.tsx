import { Home, LayoutGrid, Heart, Bell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", route: "/" },
  { icon: LayoutGrid, label: "সেবা", route: "/services" },
  { icon: Heart, label: "অনুদান", route: "/donation" },
  { icon: Bell, label: "নোটিশ", route: "/notifications" },
  { icon: User, label: "প্রোফাইল", route: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Frosted glass backdrop */}
      <div className="bg-card/80 backdrop-blur-2xl border-t border-border/50 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]" style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
        <div className="max-w-4xl mx-auto flex items-end justify-around px-2 pt-2 pb-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.route === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.route);
            const isCenter = idx === 2;

            if (isCenter) {
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className="relative flex flex-col items-center -mt-6 group"
                  aria-label={item.label}
                >
                  {/* Outer glow ring */}
                  <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${isActive ? "opacity-50" : "opacity-0 group-hover:opacity-30"}`}
                    style={{ background: "linear-gradient(135deg, hsl(195,80%,50%), hsl(170,70%,45%))" }} />
                  {/* Main button */}
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isActive ? "scale-110" : "scale-100 group-hover:scale-105"}`}
                    style={{ background: "linear-gradient(135deg, hsl(195,80%,50%), hsl(170,70%,45%))" }}
                  >
                    <Icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2} />
                  </div>
                  <span className={`text-[10px] mt-1 leading-tight font-semibold transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[52px] group"
                aria-label={item.label}
              >
                {/* Active pill indicator */}
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${isActive ? "w-8 opacity-100" : "w-0 opacity-0"}`}
                  style={{ background: "linear-gradient(90deg, hsl(195,80%,50%), hsl(170,70%,45%))" }}
                />

                {/* Icon container */}
                <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10 scale-110" : "group-hover:bg-muted scale-100"}`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                <span className={`text-[10px] leading-tight transition-all duration-200 ${isActive ? "font-bold text-primary" : "font-medium text-muted-foreground group-hover:text-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
