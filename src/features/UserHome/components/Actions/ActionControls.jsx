import { RxCross1, RxHeart } from "react-icons/rx";
import { AiOutlineReload,  } from "react-icons/ai";

export default  function ActionControls({
    onReject,
    onRefresh,
    onLike,
    className = '',
  }) {
    return (
      <div
        className={
          `flex justify-center space-x-8 z-20 ` +
          className
        }
      >
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