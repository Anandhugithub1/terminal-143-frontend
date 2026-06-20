import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, onBack, action, className = "" }) {
  const navigate = useNavigate();
  return (
    <header className={`flex items-center px-4 py-3 border-b border-gray-100 bg-white ${className}`}>
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-primary" />
      </button>
      <h1 className="ml-2 text-base font-semibold text-gray-900 flex-1">{title}</h1>
      {action}
    </header>
  );
}
