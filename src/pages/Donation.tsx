import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Copy, Send, Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DonationMethod {
  id: string;
  method_name: string;
  account_type: string;
  account_number: string;
  gradient_colors: string;
}

const gradientMap: Record<string, string> = {
  "from-pink-500 to-rose-500": "linear-gradient(135deg, #ec4899, #f43f5e)",
  "from-orange-400 to-amber-500": "linear-gradient(135deg, #fb923c, #f59e0b)",
  "from-purple-500 to-violet-500": "linear-gradient(135deg, #a855f7, #8b5cf6)",
};

const Donation = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [formData, setFormData] = useState({ name: "", phone: "", amount: "", method: "বিকাশ", trx_id: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("donation_methods").select("*").eq("is_active", true).order("sort_order");
      if (data) setMethods(data);
    };
    fetch();
  }, []);

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: "কপি হয়েছে!", description: num });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.trx_id) {
      toast({ title: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    setLoading(true);
    await (supabase.from as any)("donations").insert({
      donor_name: formData.name,
      phone: formData.phone,
      amount: parseFloat(formData.amount) || 0,
      payment_method: formData.method,
      trx_id: formData.trx_id,
      message: formData.message || null,
    });
    toast({ title: "ধন্যবাদ! তথ্য জমা হয়েছে।" });
    setFormData({ name: "", phone: "", amount: "", method: "বিকাশ", trx_id: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground">অনুদান</h1>
          <p className="text-xs text-muted-foreground">আমাদের পাশে দাঁড়ান</p>
        </div>
      </div>

      <div className="px-4 space-y-5 pb-8">
        {/* Info card */}
        <div className="glass-card p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <Heart className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="font-bold text-lg text-foreground">রামগঞ্জ সেবার পাশে দাঁড়ান</h2>
          <p className="text-sm text-muted-foreground mt-2">আপনার ক্ষুদ্র অনুদান আমাদের এই ডিজিটাল সেবা কার্যক্রম চালিয়ে রাখতে এবং নতুন ফিচার যুক্ত করতে সাহায্য করবে। এটি একটি স্বেচ্ছাসেবী উদ্যোগ।</p>
        </div>

        {/* Payment methods */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">💳 পেমেন্ট মেথড</h3>
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl p-4 flex items-center justify-between text-white"
                style={{ background: gradientMap[m.gradient_colors] || "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <div>
                  <p className="text-sm opacity-90">{m.method_name} ({m.account_type})</p>
                  <p className="text-xl font-bold">{m.account_number}</p>
                </div>
                <button onClick={() => copyNumber(m.account_number)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Donation form */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-foreground text-center">তথ্য জমা দিন</h3>
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">আপনার নাম</label>
            <input className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border" placeholder="আপনার নাম লিখুন"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">মোবাইল নাম্বার</label>
              <input className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border" placeholder="017XXXXXXXX"
                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">টাকার পরিমাণ</label>
              <input type="number" className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border" placeholder="0.00"
                value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">পেমেন্ট মেথড</label>
            <div className="flex gap-2">
              {["বিকাশ", "নগদ", "রকেট"].map((m) => (
                <button key={m} onClick={() => setFormData({ ...formData, method: m })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${formData.method === m ? "border-primary text-primary bg-primary/10" : "border-border text-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">ট্রানজেকশন আইডি (TrxID)</label>
            <input className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border" placeholder="TRXID দিন (যেমন: 9HSJ...)"
              value={formData.trx_id} onChange={(e) => setFormData({ ...formData, trx_id: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">বার্তা (অপশনাল)</label>
            <textarea className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border min-h-[80px]" placeholder="কিছু বলতে চাইলে লিখুন..."
              value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(195,80%,50%), hsl(170,70%,45%))" }}>
            <Send className="w-5 h-5" /> {loading ? "জমা হচ্ছে..." : "তথ্য জমা দিন"}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" /> <Lock className="w-4 h-4" /> নিরাপদ পেমেন্ট নিশ্চিত করুন
        </p>
      </div>
    </div>
  );
};

export default Donation;
