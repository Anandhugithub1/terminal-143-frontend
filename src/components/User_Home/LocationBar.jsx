import { HiOutlineLocationMarker } from "react-icons/hi";
import { RxCross1, RxHeart } from "react-icons/rx";
import { AiOutlineReload,  } from "react-icons/ai";


export function LocationBar() {
  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <HiOutlineLocationMarker />
        <span>Thailand</span>
        <span className="text-gray-400 text-xs">
          • JC Street, Acer Point, Thailand
        </span>
      </div>
      <button className="text-text-pr text-sm">Change</button>
    </div>
  );
}

export function ActionControls({ onReject, onRefresh, onLike }) {
    return (
      <div className="fixed bottom-16 inset-x-0 flex justify-center space-x-8 z-20">
        <button
          onClick={onReject}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg"
        >
          <RxCross1 size={28} />
        </button>
        <button
          onClick={onRefresh}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg"
        >
          <AiOutlineReload size={28} />
        </button>
        <button
          onClick={onLike}
          className="w-16 h-16 flex items-center justify-center text-text-pr bg-black rounded-full shadow-lg"
        >
          <RxHeart size={28} />
        </button>
      </div>
    );
  }