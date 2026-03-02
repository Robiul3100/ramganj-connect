import { useEffect } from "react";
import { X } from "lucide-react";

interface SwipeUpEditorProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerGradient?: string;
  children: React.ReactNode;
}

const SwipeUpEditor = ({ open, onClose, title, subtitle, icon, headerGradient = "from-primary to-primary/80", children }: SwipeUpEditorProps) => {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className={`mx-3 mt-3 rounded-xl bg-gradient-to-r ${headerGradient} p-3.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
              {subtitle && <p className="text-[11px] text-white/70 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SwipeUpEditor;
