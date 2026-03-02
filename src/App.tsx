import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserPreferencesProvider } from "@/hooks/useUserPreferences";
import SplashScreen from "@/components/SplashScreen";
import NotificationListener from "@/components/NotificationListener";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import useNetworkStatus from "@/hooks/useNetworkStatus";
import PageTracker from "@/components/PageTracker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmergencyCalls from "./pages/EmergencyCalls";
import BloodBank from "./pages/BloodBank";
import Donation from "./pages/Donation";
import AboutRamganj from "./pages/AboutRamganj";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Notifications from "./pages/Notifications";
import Services from "./pages/Services";
import CategoryServices from "./pages/CategoryServices";
import TuitionMedia from "./pages/TuitionMedia";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Offices from "./pages/Offices";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  useNetworkStatus();

  return (
    <ThemeProvider defaultTheme="system" storageKey="ramganj-theme">
      <UserPreferencesProvider>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NotificationListener />
            <PWAInstallPrompt />
            <MaintenanceGuard>
              <PageTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/service/tuition" element={<TuitionMedia />} />
                <Route path="/service/:slug" element={<CategoryServices />} />
                <Route path="/emergency-calls" element={<EmergencyCalls />} />
                <Route path="/blood-bank" element={<BloodBank />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/about-ramganj" element={<AboutRamganj />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/offices" element={<Offices />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MaintenanceGuard>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
};

export default App;
