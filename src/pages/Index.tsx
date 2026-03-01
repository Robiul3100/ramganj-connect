import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import PrayerTimesWidget from "@/components/PrayerTimesWidget";
import AnnouncementBar from "@/components/AnnouncementBar";

import ServiceGrid from "@/components/ServiceGrid";
import { QuickStatsWidget } from "@/components/DashboardWidgets";
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
        <PrayerTimesWidget />
        <AnnouncementBar />


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
