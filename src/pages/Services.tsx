import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { services } from "@/data/services";
import BottomNav from "@/components/BottomNav";

const Services = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const active = services.filter(s => s.status === "active");
  const coming = services.filter(s => s.status === "coming_soon");

  const filteredActive = active.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredComing = coming.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <div className="gradient-primary px-4 py-5 pb-10 relative">
        <h1 className="text-xl font-bold text-white text-center">সেবাসমূহ</h1>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
      </div>

      <div className="px-4 -mt-2 space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="সেবা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filteredActive.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">চালু সেবা ({filteredActive.length})</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredActive.map((service) => {
                const Icon = service.icon;
                return (
                  <button key={service.id} onClick={() => service.route && navigate(service.route)}
                    className="glass-card-hover flex flex-col items-center gap-2 py-4 px-1">
                    <div className="service-icon-wrapper" style={{ backgroundColor: service.iconBg, color: service.iconColor }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">{service.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredComing.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">আসছে শীঘ্রই ({filteredComing.length})</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredComing.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="glass-card relative flex flex-col items-center gap-2 py-4 px-1 opacity-75">
                    <span className="badge-coming absolute -top-2 right-1">আসছে</span>
                    <div className="service-icon-wrapper" style={{ backgroundColor: service.iconBg, color: service.iconColor }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">{service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
