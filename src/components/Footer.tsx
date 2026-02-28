import { Heart, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

const footerLinks = [
  { label: "সার্ভিস", path: "/services" },
  { label: "জরুরি কল", path: "/emergency-calls" },
  { label: "ব্লাড ব্যাংক", path: "/blood-bank" },
  { label: "সংবাদ", path: "/news" },
  { label: "যোগাযোগ", path: "/contact" },
  { label: "রামগঞ্জ সম্পর্কে", path: "/about-ramganj" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-4">
      {/* Top wave separator */}
      <div className="h-8 bg-gradient-to-b from-transparent to-card" />

      <div className="bg-card px-5 pb-8 pt-2 space-y-6">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={ramganjCityLogo}
            alt="রামগঞ্জ সিটি"
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-[260px]">
            রামগঞ্জের সকল সেবা ও তথ্য এক অ্যাপে
          </p>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-3 gap-2">
          {footerLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors py-2 px-1 rounded-xl hover:bg-secondary/60 text-center truncate"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Contact row */}
        <div className="flex items-center justify-center gap-5">
          <a href="tel:+8801234567890" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-3.5 h-3.5" />
            <span>কল</span>
          </a>
          <a href="mailto:info@ramganjcity.com" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-3.5 h-3.5" />
            <span>ইমেইল</span>
          </a>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>রামগঞ্জ, লক্ষ্মীপুর</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Bottom credit */}
        <div className="text-center space-y-1.5">
          <p className="text-[11px] text-muted-foreground/70">
            তৈরি করেছে{" "}
            <span className="font-semibold text-foreground/80">রামগঞ্জ আইটি সলিউশন</span>
          </p>
          <p className="text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-accent fill-accent" /> in Ramganj
          </p>
          <span className="inline-block text-[10px] text-muted-foreground/40 border border-border/50 rounded-full px-2.5 py-0.5 mt-1">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
