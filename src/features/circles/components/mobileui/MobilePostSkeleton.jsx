export function MobilePostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-border-clr">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
      <div className="h-8 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}