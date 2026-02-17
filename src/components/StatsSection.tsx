import { activeServices, comingSoonServices } from "@/data/services";

const StatsSection = () => {
  return (
    <div className="px-4">
      <div className="gradient-stats rounded-3xl p-6 flex items-center justify-around text-primary-foreground">
        <div className="text-center">
          <p className="text-4xl font-bold">{activeServices.length}</p>
          <p className="text-sm opacity-90">চালু সেবা</p>
        </div>
        <div className="w-px h-12 bg-primary-foreground/30" />
        <div className="text-center">
          <p className="text-4xl font-bold">{comingSoonServices.length}</p>
          <p className="text-sm opacity-90">আসছে</p>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
