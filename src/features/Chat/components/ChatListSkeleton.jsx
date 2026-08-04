// Mirrors NewMatchesStrip + MatchRow's real dimensions so the list doesn't
// reflow when data swaps in. Each row's shimmer sweep is delayed slightly
// after the one above it, cascading down the list instead of every row
// animating in lockstep.
function StripItemSkeleton({ delay }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[52px] shrink-0">
      <div
        className="skeleton-shimmer w-[52px] h-[52px] rounded-full"
        style={{ '--shimmer-delay': `${delay}s` }}
      />
      <div
        className="skeleton-shimmer w-10 h-2.5 rounded"
        style={{ '--shimmer-delay': `${delay}s` }}
      />
    </div>
  );
}

function RowSkeleton({ delay, nameWidth = '42%', previewWidth = '68%', showDot = false }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div
        className="skeleton-shimmer w-12 h-12 rounded-full shrink-0"
        style={{ '--shimmer-delay': `${delay}s` }}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div
          className="skeleton-shimmer h-3 rounded"
          style={{ width: nameWidth, '--shimmer-delay': `${delay}s` }}
        />
        <div
          className="skeleton-shimmer h-2.5 rounded"
          style={{ width: previewWidth, '--shimmer-delay': `${delay}s` }}
        />
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
        <div
          className="skeleton-shimmer w-7 h-2 rounded"
          style={{ '--shimmer-delay': `${delay}s` }}
        />
        {showDot && (
          <div
            className="skeleton-shimmer w-[18px] h-[18px] rounded-full"
            style={{ '--shimmer-delay': `${delay}s` }}
          />
        )}
      </div>
    </div>
  );
}

export default function ChatListSkeleton() {
  return (
    <div>
      <div className="bg-white pt-3 pb-4">
        <div className="skeleton-shimmer h-3 w-24 rounded mx-4 mb-3" />
        <div className="flex gap-4 px-4 overflow-hidden">
          {[0, 0.08, 0.16, 0.24].map((delay, i) => (
            <StripItemSkeleton key={i} delay={delay} />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="pt-3">
        <div className="skeleton-shimmer h-3 w-16 rounded mx-4 mb-3" />
        <RowSkeleton delay={0} nameWidth="38%" previewWidth="60%" />
        <RowSkeleton delay={0.12} nameWidth="45%" previewWidth="50%" showDot />
        <RowSkeleton delay={0.24} nameWidth="34%" previewWidth="78%" />
        <RowSkeleton delay={0.36} nameWidth="42%" previewWidth="58%" />
        <RowSkeleton delay={0.48} nameWidth="46%" previewWidth="64%" />
      </div>
    </div>
  );
}
