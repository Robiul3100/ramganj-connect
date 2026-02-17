import { useState } from "react";
import { comingSoonServices } from "@/data/services";
import { Clock, X } from "lucide-react";

const ComingSoonSection = () => {
  const [selectedService, setSelectedService] = useState<typeof comingSoonServices[0] | null>(null);

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">আসছে শীঘ্রই</h2>
        <span className="text-sm font-semibold text-accent">{comingSoonServices.length} টি</span>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {comingSoonServices.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="glass-card relative flex flex-col items-center gap-2 py-4 px-1 opacity-90 hover:opacity-100 transition-opacity"
            >
              <span className="badge-coming absolute -top-2 right-1">আসছে</span>
              <div
                className="service-icon-wrapper"
                style={{ backgroundColor: service.iconBg, color: service.iconColor }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {service.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Coming Soon Dialog */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-foreground mb-4">শীঘ্রই আসছে!</h3>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: selectedService.iconBg }}>
              <Clock className="w-7 h-7" style={{ color: selectedService.iconColor }} />
            </div>
            <h4 className="font-bold text-lg text-foreground">{selectedService.name}</h4>
            <p className="text-sm text-muted-foreground mt-2">
              সেবাটি নিয়ে আমাদের কাজ চলছে। খুব শীঘ্রই এটি অ্যাপে যুক্ত করা হবে।
            </p>
            <button 
              onClick={() => setSelectedService(null)}
              className="mt-5 px-8 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${selectedService.iconColor}, ${selectedService.iconBg})` }}
            >
              অপেক্ষা করুন
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ComingSoonSection;
