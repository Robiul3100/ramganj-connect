import { Phone, Mail, MapPin, Globe, MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

const contactItems = [
  { icon: Phone, label: "ফোন", value: "01XXX-XXXXXX", href: "tel:01XXXXXXXXX", color: "text-primary", bg: "bg-primary/10" },
  { icon: Mail, label: "ইমেইল", value: "info@ramganj-connect.app", href: "mailto:info@ramganj-connect.app", color: "text-accent", bg: "bg-accent/10" },
  { icon: MapPin, label: "ঠিকানা", value: "রামগঞ্জ, লক্ষ্মীপুর", href: "#", color: "text-primary", bg: "bg-primary/10" },
  { icon: Globe, label: "ওয়েবসাইট", value: "ramganj-connect.lovable.app", href: "https://ramganj-connect.lovable.app", color: "text-primary", bg: "bg-primary/10" },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="যোগাযোগ" color="var(--gradient-primary)" />

      <div className="px-4 -mt-2 space-y-3">
        {contactItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="glass-card p-4 flex items-center gap-4 block"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-bold text-foreground">{item.value}</p>
            </div>
          </a>
        ))}

        <div className="glass-card p-5 text-center mt-6">
          <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-foreground">আমাদের সাথে যোগাযোগ করুন</h3>
          <p className="text-sm text-muted-foreground mt-1">
            যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Contact;
