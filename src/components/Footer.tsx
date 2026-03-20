import { Heart, Phone, Mail, MapPin, Facebook, Youtube, ArrowUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

const footerLinks = [
  {
    title: "তথ্য",
    links: [
      { label: "সম্পর্কে", path: "/about-ramganj" },
      { label: "যোগাযোগ", path: "/contact" },
      { label: "সংবাদ", path: "/news" },
      { label: "ডোনেশন", path: "/donation" },
    ],
  },
  {
    title: "সেবা",
    links: [
      { label: "সার্ভিস", path: "/services" },
      { label: "জরুরি কল", path: "/emergency-calls" },
      { label: "ব্লাড ব্যাংক", path: "/blood-bank" },
      { label: "অফিস সমূহ", path: "/offices" },
    ],
  },
  {
    title: "আইনি",
    links: [
      { label: "প্রাইভেসি পলিসি", path: "/privacy-policy" },
      { label: "ডিসক্লেইমার", path: "/disclaimer" },
    ],
  },
];

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-6 relative">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="bg-card/80 backdrop-blur-sm">
        {/* Top section */}
        <div className="px-5 pt-6 pb-4">
          {/* Logo + tagline + scroll top */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center p-1.5">
                <img src={ramganjCityLogo} alt="রামগঞ্জ সিটি" className="h-full w-auto object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">রামগঞ্জ সিটি</h3>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                  রামগঞ্জের সকল সেবা ও তথ্য এক অ্যাপে
                </p>
              </div>
            </div>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/15 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4 text-primary group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-2">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className="block text-[11px] text-muted-foreground hover:text-primary transition-colors py-1 text-start truncate w-full"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <a
              href="tel:+8801234567890"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1.5 transition-colors border border-border/50"
            >
              <Phone className="w-3 h-3" /> কল করুন
            </a>
            <a
              href="mailto:info@ramganjcity.com"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1.5 transition-colors border border-border/50"
            >
              <Mail className="w-3 h-3" /> ইমেইল
            </a>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 border border-border/50">
              <MapPin className="w-3 h-3" /> রামগঞ্জ, লক্ষ্মীপুর
            </span>
          </div>

          {/* Social row */}
          <div className="flex items-center gap-2">
            <a
              href="https://facebook.com/ramganjcity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-[#1877F2]/10 border border-border/50 hover:border-[#1877F2]/30 flex items-center justify-center text-muted-foreground hover:text-[#1877F2] transition-all duration-200"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@ramganjcity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-destructive/10 border border-border/50 hover:border-destructive/30 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground/60">
                তৈরি করেছে{" "}
                <button
                  onClick={() => navigate("/developer")}
                  className="font-semibold text-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-0.5"
                >
                  রবিউল ইসলাম ইদরিস
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </p>
              <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1 mt-0.5">
                Made with <Heart className="w-2.5 h-2.5 text-accent fill-accent" /> in Ramganj
              </p>
            </div>
            <span className="text-[9px] text-muted-foreground/40 border border-border/40 rounded-full px-2.5 py-0.5 font-medium">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
