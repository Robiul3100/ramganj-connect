import { useState } from "react";
import { Phone, X, AlertTriangle, Droplets, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingActions = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  const actions = [
    { icon: AlertTriangle, label: "জরুরি কল", route: "/emergency-calls", color: "bg-destructive text-destructive-foreground" },
    { icon: Droplets, label: "ব্লাড ব্যাংক", route: "/blood-bank", color: "bg-destructive text-destructive-foreground" },
    { icon: Building2, label: "অফিস", route: "/offices", color: "bg-primary text-primary-foreground" },
  ];

  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-2">
      {/* Action items */}
      {open && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.route}
                onClick={() => { navigate(action.route); setOpen(false); }}
                className={`flex items-center gap-2 ${action.color} rounded-full pl-3 pr-4 py-2.5 shadow-lg text-xs font-semibold transition-transform hover:scale-105`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ boxShadow: "0 4px 20px hsl(0 84% 60% / 0.4)" }}
        aria-label="জরুরি মেনু"
      >
        {open ? <X className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingActions;
