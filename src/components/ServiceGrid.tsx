import { useNavigate } from "react-router-dom";
import { activeServices } from "@/data/services";

const ServiceGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">চালু সেবাসমূহ</h2>
        <span className="text-sm font-semibold text-primary">{activeServices.length} টি</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {activeServices.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => service.route && navigate(service.route)}
              className="glass-card-hover flex flex-col items-center gap-2 py-4 px-1"
            >
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
    </section>
  );
};

export default ServiceGrid;
