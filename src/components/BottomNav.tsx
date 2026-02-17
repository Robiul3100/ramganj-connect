import { Home, Phone, Bell, User, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", route: "/" },
  { icon: Search, label: "সেবাসমূহ", route: "/services" },
  { icon: Phone, label: "যোগাযোগ", route: "/contact" },
  { icon: Bell, label: "নোটিশ", route: "/notifications" },
  { icon: User, label: "প্রোফাইল", route: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.route === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.route);
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
