import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      // Check if user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await (supabase.from as any)("user_roles").select("role").eq("user_id", user.id);
        if (roles && roles.some(r => r.role === "admin")) {
          navigate("/admin");
        } else {
          toast({ title: "অ্যাক্সেস নেই", description: "আপনার এডমিন অ্যাক্সেস নেই।", variant: "destructive" });
          await supabase.auth.signOut();
        }
      }
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

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
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
              <input type="password" required className="w-full bg-muted/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border border-border"
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            <LogIn className="w-5 h-5" /> {loading ? "লগইন হচ্ছে..." : "লগইন"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
