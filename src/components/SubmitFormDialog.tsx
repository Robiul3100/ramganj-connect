import { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";

interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "select" | "textarea" | "date" | "tel";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface SubmitFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  headerColor?: string;
}

const SubmitFormDialog = ({ open, onClose, title, subtitle, fields, onSubmit, headerColor = "var(--gradient-primary)" }: SubmitFormDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [captchaA] = useState(Math.floor(Math.random() * 9) + 1);
  const [captchaB] = useState(Math.floor(Math.random() * 9) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      toast.error("নিরাপত্তা প্রশ্নের উত্তর সঠিক নয়!");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
      setCaptchaAnswer("");
      onClose();
    } catch { 
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="rounded-t-3xl p-5 flex items-center justify-between" style={{ background: headerColor }}>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-foreground mb-1 block">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border min-h-[80px]"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              ) : (
                <input
                  type={field.type || "text"}
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              )}
            </div>
          ))}

          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-foreground mb-2">নিরাপত্তা প্রশ্ন: {captchaA} + {captchaB} = ?</p>
            <input
              type="number"
              className="w-full bg-card rounded-2xl px-4 py-3 text-sm outline-none border border-border"
              placeholder="যোগফল লিখুন"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ background: headerColor }}
          >
            {loading ? "জমা হচ্ছে..." : <>জমা দিন <Send className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitFormDialog;

