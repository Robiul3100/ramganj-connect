import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import AnnouncementBar from "@/components/AnnouncementBar";
import SmartSearch from "@/components/SmartSearch";
import ServiceGrid from "@/components/ServiceGrid";
import { NoticeWidget, EmergencyWidget, DoctorsWidget, OfficesWidget, QuickStatsWidget } from "@/components/DashboardWidgets";
import LatestNews from "@/components/LatestNews";
import FeaturedServices from "@/components/FeaturedServices";
import Footer from "@/components/Footer";
import DrawerMenu from "@/components/DrawerMenu";
import BottomNav from "@/components/BottomNav";
import FloatingActions from "@/components/FloatingActions";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      <div className="space-y-5 pb-6 mt-2">
        <HeroSlider />
        <AnnouncementBar />

        {/* Smart Search */}
        <div className="px-4">
          <SmartSearch />
        </div>

        {/* Dashboard Widgets */}
        <div className="px-4 space-y-3">
          <EmergencyWidget />
          <div className="grid grid-cols-1 gap-3">
            <NoticeWidget />
            <DoctorsWidget />
            <OfficesWidget />
          </div>
        </div>

        <ServiceGrid />
        <QuickStatsWidget />
        <LatestNews />
        <FeaturedServices />
        <Footer />
      </div>

      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <FloatingActions />
      <BottomNav />
    </div>
  );
};

export default Index;
