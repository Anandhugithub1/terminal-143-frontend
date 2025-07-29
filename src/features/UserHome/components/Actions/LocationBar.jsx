import { HiOutlineLocationMarker } from "react-icons/hi";




export default function LocationBar() {
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
