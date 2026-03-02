import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, LayoutDashboard, Shield, Users, TrendingUp,
  Clock, Newspaper, Bell, Globe, Layers, Phone, Droplets,
  Heart, Building2, Megaphone, SlidersHorizontal, Info, History,
  Settings, Activity, Menu, X, Image as ImageIcon, Home, ChevronDown, ChevronRight,
  Zap, Plus
} from "lucide-react";

export type AdminTab = "dashboard" | "services" | "categories" | "pending" | "users" | "activity" | "emergency" | "blood" | "donations" | "announcements" | "slider" | "about" | "timeline" | "news" | "site_settings" | "advertisements" | "offices" | "analytics" | "notifications" | "app_settings" | "service_grid" | "all_services" | "all_settings";

// Bottom nav pages (4 main pages)
const bottomNavItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "all_services", label: "সেবা", icon: Globe },
  { id: "all_settings", label: "সেটিংস", icon: Settings },
  { id: "analytics", label: "অ্যানালিটিক্স", icon: TrendingUp },
];

const tabGroups = [
  {
    label: "প্রধান",
    icon: LayoutDashboard,
    items: [
      { id: "dashboard" as AdminTab, label: "ড্যাশবোর্ড", icon: LayoutDashboard },
      { id: "all_services" as AdminTab, label: "সেবা ম্যানেজার", icon: Globe },
      { id: "all_settings" as AdminTab, label: "সেটিংস", icon: Settings },
      { id: "analytics" as AdminTab, label: "অ্যানালিটিক্স", icon: TrendingUp },
    ],
  },
  {
    label: "সেবা ম্যানেজমেন্ট",
    icon: Globe,
    items: [
      { id: "services" as AdminTab, label: "সেবাসমূহ", icon: Globe },
      { id: "pending" as AdminTab, label: "অপেক্ষমান", icon: Clock },
      { id: "categories" as AdminTab, label: "ক্যাটাগরি", icon: Layers },
      { id: "service_grid" as AdminTab, label: "সার্ভিস গ্রিড", icon: SlidersHorizontal },
      { id: "news" as AdminTab, label: "নিউজ", icon: Newspaper },
      { id: "slider" as AdminTab, label: "স্লাইডার", icon: SlidersHorizontal },
      { id: "advertisements" as AdminTab, label: "বিজ্ঞাপন", icon: ImageIcon },
      { id: "about" as AdminTab, label: "সম্পর্কে", icon: Info },
      { id: "emergency" as AdminTab, label: "জরুরি কল", icon: Phone },
      { id: "blood" as AdminTab, label: "রক্তদাতা", icon: Droplets },
      { id: "donations" as AdminTab, label: "অনুদান", icon: Heart },
      { id: "offices" as AdminTab, label: "অফিস", icon: Building2 },
      { id: "announcements" as AdminTab, label: "ঘোষণা", icon: Megaphone },
      { id: "timeline" as AdminTab, label: "টাইমলাইন", icon: History },
    ],
  },
  {
    label: "সিস্টেম",
    icon: Settings,
    items: [
      { id: "site_settings" as AdminTab, label: "সাইট সেটিং", icon: Settings },
      { id: "app_settings" as AdminTab, label: "অ্যাপ সেটিং", icon: Globe },
      { id: "notifications" as AdminTab, label: "নোটিফিকেশন", icon: Bell },
      { id: "users" as AdminTab, label: "ইউজার", icon: Users },
      { id: "activity" as AdminTab, label: "অ্যাক্টিভিটি লগ", icon: Activity },
    ],
  },
];
interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser: any;
  pendingCount: number;
  children: React.ReactNode;
}

const AdminLayout = ({ activeTab, onTabChange, currentUser, pendingCount, children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const activeTabData = tabGroups.flatMap(g => g.items).find(t => t.id === activeTab);

  const SidebarContent = () => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {tabGroups.map(group => {
        const isCollapsed = collapsedGroups.has(group.label);
        const hasActive = group.items.some(t => t.id === activeTab);
        return (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] uppercase tracking-[0.08em] font-bold transition-colors ${
                hasActive ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <span>{group.label}</span>
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {!isCollapsed && (
              <div className="space-y-0.5 mt-0.5">
                {group.items.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id + tab.label}
                      onClick={() => { onTabChange(tab.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                      {tab.id === "pending" && pendingCount > 0 && (
                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"
                        }`}>{pendingCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Single Admin Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-2xl border-b-2 border-border/40">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Menu className="w-4.5 h-4.5 text-foreground" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <Shield className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground leading-tight">অ্যাডমিন প্যানেল</h1>
                <p className="text-[10px] text-muted-foreground">রামগঞ্জ সেবা</p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <LayoutDashboard className="w-3 h-3" />
            <span>/</span>
            <span className="font-medium text-foreground">{activeTabData?.label || "ড্যাশবোর্ড"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              title="হোমপেজ"
            >
              <Home className="w-4 h-4 text-foreground" />
            </button>
            {pendingCount > 0 && (
              <button
                onClick={() => onTabChange("pending")}
                className="relative w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Bell className="w-4 h-4 text-foreground" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-[250px] shrink-0 sticky top-[3.75rem] h-[calc(100vh-3.75rem)] border-r border-border/40 bg-card/30">
          <SidebarContent />
          <div className="p-3 border-t border-border/40">
            <div className="px-3 py-2">
              <p className="text-[10px] text-muted-foreground/70 truncate">{currentUser?.email}</p>
              <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> অনলাইন
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col animate-slide-in-left">
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">অ্যাডমিন প্যানেল</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <SidebarContent />
              <div className="p-3 border-t border-border/40">
                <div className="px-3 py-2">
                  <p className="text-[10px] text-muted-foreground/70 truncate">{currentUser?.email}</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 pb-24 lg:p-6 lg:pb-6">
          {/* Mobile tab title */}
          <div className="lg:hidden mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              {activeTabData && <activeTabData.icon className="w-5 h-5 text-primary" />}
              {activeTabData?.label || "ড্যাশবোর্ড"}
            </h2>
          </div>
          {children}
        </main>
      </div>

      {/* Admin Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/80 backdrop-blur-2xl border-t-2 border-border/40" style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
        <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
          {bottomNavItems.map(item => {
            // "all_services" is active if current tab is any service-related tab
            const serviceSubTabs: AdminTab[] = ["all_services", "services", "pending", "categories", "service_grid", "news", "slider", "advertisements", "about", "timeline", "emergency", "blood", "donations", "offices", "announcements"];
            const settingsSubTabs: AdminTab[] = ["all_settings", "site_settings", "app_settings", "notifications", "users", "activity"];
            
            const isActive = item.id === "all_services"
              ? serviceSubTabs.includes(activeTab)
              : item.id === "all_settings"
              ? settingsSubTabs.includes(activeTab)
              : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all relative min-w-[56px]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-primary shadow-md shadow-primary/25 scale-105"
                    : "bg-transparent"
                }`}>
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                </div>
                <span className={`text-[9px] font-semibold transition-colors leading-tight ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>{item.label}</span>
                {item.id === "all_services" && pendingCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
