import { useState, useEffect } from "react";
import { User, Edit, Home, LogOut, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (data) setProfile(data);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate("/");
  };

  const menuItems = [
    { icon: Edit, label: "প্রোফাইল আপডেট করুন", action: () => {} },
    { icon: Home, label: "হোম", action: () => navigate("/") },
    { icon: Shield, label: "অ্যাডমিন প্যানেল", action: () => navigate("/admin-login"), show: true },
  ];

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-4 border-primary/20">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {profile?.display_name || user?.email || "অতিথি ব্যবহারকারী"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user ? user.email : "লগইন করুন"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "২৪ ঘণ্টা সাপোর্ট", icon: Phone },
            { label: "সকল সেবা এক অ্যাপে", icon: Home },
            { label: "আমাদের সাথে থাকুন", icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-3 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground">{item.label}</span>
            <span className="text-muted-foreground">›</span>
          </button>
        ))}

        {user && (
          <button
            onClick={handleLogout}
            className="w-full glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="flex-1 text-left font-semibold text-destructive">লগআউট করুন</span>
            <span className="text-muted-foreground">›</span>
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
