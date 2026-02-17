import { Home, LayoutGrid, Phone, Bell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", route: "/" },
  { icon: LayoutGrid, label: "সেবা", route: "/services" },
  { icon: Phone, label: "জরুরি", route: "/service/ambulance" },
  { icon: Bell, label: "নোটিশ", route: "/notifications" },
  { icon: User, label: "প্রোফাইল", route: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-1 px-1">
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
                className="relative -mt-5 flex flex-col items-center"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isActive ? "gradient-primary scale-110" : "bg-primary"
                }`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[52px] ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
