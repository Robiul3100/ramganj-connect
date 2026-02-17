import { Menu, Users } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <button
        onClick={onMenuClick}
        className="w-12 h-12 rounded-full bg-card flex items-center justify-center shadow-sm"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="flex-1 ml-3">
        <h1 className="text-xl font-bold text-foreground leading-tight">রামগঞ্জ সেবা</h1>
        <p className="text-sm text-muted-foreground">আপনার ডিজিটাল সহযোগী</p>
      </div>

      <div className="relative">
        <button className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </button>
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-background" style={{ backgroundColor: "hsl(140, 70%, 45%)" }} />
      </div>
    </header>
  );
};

export default Navbar;
