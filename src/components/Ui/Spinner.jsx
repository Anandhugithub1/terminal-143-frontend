// Plain CSS (Tailwind's animate-bounce) rather than framer-motion: this is
// used as the Suspense fallback for every lazy route, so it sits in the
// eager entry bundle. Pulling in framer-motion just for a 3-dot bounce
// dragged the whole animation library into that critical-path chunk.
export function LoadingSpinner() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 0.2}s` }}
            className="h-4 w-4 animate-bounce bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg"
          />
        ))}
      </div>
    </div>
  );
}
