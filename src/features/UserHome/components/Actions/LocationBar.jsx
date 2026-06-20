import { HiOutlineLocationMarker } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const LocationBar = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="px-5 mt-3">
      <div className="w-full bg-white rounded-full px-4 py-3 shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineLocationMarker className="w-5 h-5 text-black" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            {subtitle && (
              <span className="text-xs text-gray-500 -mt-0.5">{subtitle}</span>
            )}
          </div>
        </div>

        <button
          aria-label="Change location"
          onClick={() => navigate("/profile/edit-location")}
          className="text-sm font-medium text-pink-600"
        >
          Change
        </button>
      </div>
    </div>
  );
};

export default LocationBar;
