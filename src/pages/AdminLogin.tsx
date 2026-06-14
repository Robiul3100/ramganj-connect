import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Mail, Lock, LogIn, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Setup mode is only available via direct URL (?setup=1) and only when no admin exists.
  const [isSetup, setIsSetup] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("setup") === "1"
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await (supabase.from as any)("user_roles").select("role").eq("user_id", user.id);
        if (roles && roles.some((r: any) => r.role === "admin")) {
          navigate("/admin");
        } else {
          toast({ title: "অ্যাক্সেস নেই", description: "আপনার এডমিন অ্যাক্সেস নেই।", variant: "destructive" });
          await supabase.auth.signOut();
        }
      }
    }
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const ownerEmail = (import.meta.env.VITE_ADMIN_OWNER_EMAIL as string | undefined) || "";
    if (!ownerEmail || email.toLowerCase() !== ownerEmail.toLowerCase()) {
      toast({ title: "ত্রুটি", description: "শুধুমাত্র অনুমোদিত ইমেইল দিয়ে সেটআপ করা যাবে।", variant: "destructive" });
      return;
    }
    if (password.length < 12) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে।", variant: "destructive" });
      return;
    }
    const setupSecret = window.prompt("Setup secret (from server env SETUP_ADMIN_SECRET):");
    if (!setupSecret) {
      toast({ title: "ত্রুটি", description: "Setup secret প্রয়োজন।", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("setup-admin", {
        body: { email, password },
        headers: { "X-Setup-Secret": setupSecret },
      });
      if (res.error || res.data?.error) {
        toast({ title: "ত্রুটি", description: res.data?.error || res.error?.message, variant: "destructive" });
      } else {
        toast({ title: "সফল!", description: "এডমিন অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।" });
        setIsSetup(false);
      }
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err?.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">এডমিন লগইন</h1>
          <p className="text-sm text-muted-foreground mt-1">রামগঞ্জ সেবা ম্যানেজমেন্ট</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors mb-4"
        >
          <Home className="w-4 h-4" /> হোমপেজে যান
        </button>

        <form onSubmit={isSetup ? handleSetup : handleLogin} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" required className="w-full bg-muted/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border border-border"
                placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" required minLength={12} className="w-full bg-muted/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border border-border"
                placeholder="কমপক্ষে ১২ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            <LogIn className="w-5 h-5" /> {loading ? "অপেক্ষা করুন..." : isSetup ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন"}
          </button>
          {isSetup && (
            <button type="button" onClick={() => setIsSetup(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              লগইন পেজে ফিরুন
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;