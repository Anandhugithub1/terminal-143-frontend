import { RxCross1 } from "react-icons/rx";
import { AiOutlineReload } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";

const ACTIONS = [
  { label: "Pass", Icon: RxCross1, size: 30, color: "text-white" },
  { label: "Refresh", Icon: AiOutlineReload, size: 30, color: "text-sky-400" },
  { label: "Like", Icon: FaHeart, size: 25, color: "text-rose-400" },
];

export default function ActionControls({ onReject, onRefresh, onLike, className = "" }) {
  const handlers = [onReject, onRefresh, onLike];

  return (
    <div className={`flex justify-center items-center space-x-8 transition-all duration-300 ${className}`}>
      {ACTIONS.map(({ label, Icon, size, color }, i) => (
        <button
          key={label}
          aria-label={label}
          onClick={handlers[i]}
          className={`w-16 h-16 flex items-center justify-center bg-black ${color} rounded-full shadow-lg active:scale-95 transition-transform`}
        >
          <Icon size={size} />
        </button>
      ))}
    </div>
  );
}
