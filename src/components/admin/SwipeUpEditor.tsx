import { Drawer } from "vaul";
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
  return (
    <Drawer.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg outline-none">
          <div className="bg-card rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            <div className={`mx-4 rounded-2xl bg-gradient-to-r ${headerGradient} p-4 flex items-center justify-between mb-1`}>
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <div>
                  <Drawer.Title className="text-sm font-bold text-white leading-tight">{title}</Drawer.Title>
                  {subtitle && <p className="text-[11px] text-white/70 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default SwipeUpEditor;
