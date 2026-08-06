import { Heart } from "lucide-react"

export default function ComputingLoading({ onRefresh, isRefreshing }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">

      {/* Pulsing avatar circle */}
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />

        <div className="relative w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-xl">
          <Heart className="w-12 h-12 text-white fill-white" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800">
        Finding your matches
      </h2>

      <p className="mt-3 text-gray-500 max-w-sm leading-relaxed">
        We’re updating your recommendations based on your location and preferences.
      </p>

      {/* Animated dots */}
      <div className="flex space-x-2 mt-6">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`mt-8 px-6 py-2 rounded-full shadow-md transition duration-200 ${
            isRefreshing
              ? "bg-primary/70 text-white cursor-wait"
              : "bg-primary text-white hover:opacity-90 active:scale-95"
          }`}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      )}

    </div>
  )
}
