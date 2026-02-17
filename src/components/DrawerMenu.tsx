import { X, Home, UserCircle, Shield, Headphones, Heart } from "lucide-react";

interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "হোম", active: true },
  { icon: UserCircle, label: "অ্যাডমিন লগইন", active: false },
  { icon: Shield, label: "গোপনীয়তা নীতিমালা", active: false },
  { icon: Headphones, label: "হেল্প ও সাপোর্ট", active: false },
];

const DrawerMenu = ({ open, onClose }: DrawerMenuProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] h-full bg-card flex flex-col animate-slide-in-left shadow-2xl">
        {/* Header */}
        <div className="gradient-primary p-6 pb-8">
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-primary-foreground mt-4">রামগঞ্জ সেবা</h2>
          <p className="text-sm text-primary-foreground/80">আপনার ডিজিটাল সঙ্গী</p>
        </div>

        {/* Menu items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">© 2026 রামগঞ্জ সেবা</p>
          <p className="text-xs text-muted-foreground">সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>
    </div>
  );
};

export default DrawerMenu;
