import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  color?: string;
  onAdd?: () => void;
}

const PageHeader = ({ title, color = "var(--gradient-primary)", onAdd }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden" style={{ background: color }}>
      <div className="flex items-center justify-between px-4 py-5 pb-12">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {onAdd ? (
          <button onClick={onAdd} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        ) : <div className="w-10" />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
    </div>
  );
};

export default PageHeader;
