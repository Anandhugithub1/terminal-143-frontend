import { useState } from "react";

// A minimal 7-bucket bar chart for "posts per day, last N days" — one
// series, no legend needed (the section title already names it). Hand-built
// rather than a charting library since this is a single small embedded
// widget, not a page of charts. Mark spec: thin bars, rounded data-ends,
// recessive baseline, a hover tooltip (an interactive chart by default —
// see the dataviz skill's interaction rules), tabular-nums on the count.
export default function ActivityTrendChart({ buckets, dayLabels }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="px-1">
      <div className="flex items-end gap-2 h-24">
        {buckets.map((bucket, i) => {
          const heightPct = (bucket.count / max) * 100;
          const isHovered = hoverIdx === i;
          const isToday = i === buckets.length - 1;

          return (
            <div
              key={bucket.dayStart}
              className="flex-1 flex flex-col items-center justify-end h-full relative"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-7 bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap tabular-nums z-10">
                  {bucket.count} {bucket.count === 1 ? "post" : "posts"}
                </div>
              )}
              <div
                className={`w-full rounded-t-[3px] transition-colors ${
                  bucket.count === 0
                    ? "bg-gray-100"
                    : isToday
                    ? "bg-primary"
                    : isHovered
                    ? "bg-primary/70"
                    : "bg-primary/35"
                }`}
                style={{ height: bucket.count === 0 ? "3px" : `${Math.max(heightPct, 6)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-1.5">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-[10px] font-medium ${
              i === dayLabels.length - 1 ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
