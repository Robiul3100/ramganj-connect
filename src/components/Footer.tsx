import { Heart, Phone, Mail, MapPin, Facebook, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

const footerLinks = [
  { label: "সম্পর্কে", path: "/about-ramganj" },
  { label: "যোগাযোগ", path: "/contact" },
  { label: "সার্ভিস", path: "/services" },
  { label: "জরুরি কল", path: "/emergency-calls" },
  { label: "সংবাদ", path: "/news" },
  { label: "ব্লাড ব্যাংক", path: "/blood-bank" },
  { label: "অফিস সমূহ", path: "/offices" },
  { label: "ডোনেশন", path: "/donation" },
  { label: "প্রাইভেসি পলিসি", path: "/privacy-policy" },
  { label: "ডিসক্লেইমার", path: "/disclaimer" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-3">
      <div className="h-5 bg-gradient-to-b from-transparent to-card" />

      <div className="bg-card px-4 pb-6 pt-1.5 space-y-4">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-1">
          <img src={ramganjCityLogo} alt="রামগঞ্জ সিটি" className="h-9 w-auto object-contain" />
          <p className="text-[11px] text-muted-foreground text-center leading-snug max-w-[240px]">
            রামগঞ্জের সকল সেবা ও তথ্য এক অ্যাপে
          </p>
        </div>

        {/* Quick links — 2 columns */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {footerLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-secondary/60 text-start truncate"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Contact row */}
        <div className="flex items-center justify-center gap-4">
          <a href="tel:+8801234567890" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-3 h-3" /> কল
          </a>
          <a href="mailto:info@ramganjcity.com" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-3 h-3" /> ইমেইল
          </a>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3" /> রামগঞ্জ, লক্ষ্মীপুর
          </span>
        </div>

        {/* Social + credit */}
        <div className="flex items-center justify-center gap-2.5">
          <a href="https://facebook.com/ramganjcity" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a href="https://youtube.com/@ramganjcity" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Youtube className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-muted-foreground/70">
            তৈরি করেছে <span className="font-semibold text-foreground/80">রবিউল ইসলাম ইদরিস</span>
          </p>
          <p className="text-[9px] text-muted-foreground/50 flex items-center justify-center gap-1">
            Made with <Heart className="w-2.5 h-2.5 text-accent fill-accent" /> in Ramganj
          </p>
          <span className="inline-block text-[9px] text-muted-foreground/40 border border-border/50 rounded-full px-2 py-0.5">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
