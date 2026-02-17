import { comingSoonServices } from "@/data/services";

const ComingSoonSection = () => {
  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">আসছে শীঘ্রই</h2>
        <span className="text-sm font-semibold text-accent">{comingSoonServices.length} টি</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {comingSoonServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="glass-card relative flex flex-col items-center gap-2 py-4 px-1 opacity-90"
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
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ComingSoonSection;
