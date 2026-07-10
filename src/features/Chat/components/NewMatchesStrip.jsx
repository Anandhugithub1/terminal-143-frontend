export default function NewMatchesStrip({ matches, onOpenChat }) {
  if (matches.length === 0) return null

  return (
    <div className="pt-2 pb-3 border-b border-gray-100">
      <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        New Matches
      </p>
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
        {matches.map((match) => (
          <button
            key={match.PK}
            onClick={() => onOpenChat(match.PK)}
            className="flex flex-col items-center gap-1 w-16 shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-pink-300">
              <img
                src={match.photos?.[0]?.url}
                alt={match.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
                loading="lazy"
              />
            </div>
            <span className="text-xs text-gray-700 truncate w-full text-center">
              {match.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
