import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmergencyCalls from "./pages/EmergencyCalls";
import BloodBank from "./pages/BloodBank";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import Complaints from "./pages/Complaints";
import ExpatriateCorner from "./pages/ExpatriateCorner";
import Donation from "./pages/Donation";
import AboutRamganj from "./pages/AboutRamganj";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LostFound from "./pages/LostFound";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/emergency-calls" element={<EmergencyCalls />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/expatriate-corner" element={<ExpatriateCorner />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/about-ramganj" element={<AboutRamganj />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
