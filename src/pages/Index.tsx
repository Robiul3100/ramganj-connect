import { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import HeroSlider from "@/components/HeroSlider";
import AnnouncementBar from "@/components/AnnouncementBar";
import ServiceGrid from "@/components/ServiceGrid";
import ComingSoonSection from "@/components/ComingSoonSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import DrawerMenu from "@/components/DrawerMenu";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />

      <div className="space-y-5 pb-6 mt-2">
        <SearchBar />
        <HeroSlider />
        <AnnouncementBar />
        <ServiceGrid />
        <ComingSoonSection />
        <StatsSection />
        <Footer />
      </div>

      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default Index;
