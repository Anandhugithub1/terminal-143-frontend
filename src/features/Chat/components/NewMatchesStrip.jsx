function getAge(dob) {
  if (!dob) return null
  return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
}

export default function NewMatchesStrip({ matches, onOpenChat }) {
  if (matches.length === 0) return null

  return (
    <div className="bg-white pt-3 pb-4">
      <p className="px-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
        Matches
      </p>
      <div className="flex gap-4 overflow-x-auto px-4 pt-2 scrollbar-hide">
        {matches.map((match) => {
          const age = getAge(match.dob)
          return (
            <button
              key={match.PK}
              onClick={() => onOpenChat(match.PK)}
              className="flex flex-col items-center gap-1 w-[52px] shrink-0"
            >
              <img
                src={match.photos?.[0]?.url}
                alt={match.name}
                className="w-[52px] h-[52px] rounded-full object-cover bg-gray-100"
                loading="lazy"
              />
              <span className="text-[11px] font-semibold text-gray-800 truncate w-full text-center">
                {match.name}
              </span>
              {age != null && <span className="text-[10px] text-gray-400 -mt-0.5">{age}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
