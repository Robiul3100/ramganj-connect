import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import AnnouncementBar from "@/components/AnnouncementBar";
import RamadanWidget from "@/components/RamadanWidget";
import ServiceGrid from "@/components/ServiceGrid";
import FeaturedServices from "@/components/FeaturedServices";
import LatestNews from "@/components/LatestNews";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import DrawerMenu from "@/components/DrawerMenu";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      <div className="space-y-5 pb-6 mt-2">
        <HeroSlider />
        <RamadanWidget />
        <AnnouncementBar />
        <ServiceGrid />
        <LatestNews />
        <FeaturedServices />
        <StatsSection />
        <Footer />
      </div>

      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Index;
