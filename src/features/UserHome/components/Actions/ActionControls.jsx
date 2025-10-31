import { RxCross1,  } from "react-icons/rx";
import { AiOutlineReload } from "react-icons/ai";
import {  FaHeart, } from "react-icons/fa";

export default function ActionControls({
  onReject,
  onRefresh,
  onLike,
  className = '',
}) {
  return (
    <div
      className={`flex justify-center items-center space-x-8 transition-all duration-300 ${className}`}
    >
      {/* Reject Button — Black bg, white X */}
      <button
        onClick={onReject}
        className="w-16 h-16 flex items-center justify-center bg-black text-white rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <RxCross1 size={30} />
      </button>

      {/* Refresh Button — Black bg, light blue icon */}
      <button
        onClick={onRefresh}
        className="w-16 h-16 flex items-center justify-center bg-black text-[#4aa3cf] rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <AiOutlineReload size={30} />
      </button>

      {/* Like Button — Black bg, light red heart */}
      <button
        onClick={onLike}
        className="w-16 h-16 flex items-center justify-center bg-black text-[#ff4d67] rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <FaHeart size={25} />
      </button>
    </div>
  );
}
