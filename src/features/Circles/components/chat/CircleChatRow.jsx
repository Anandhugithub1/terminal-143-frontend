import { useTranslation } from 'react-i18next'

function formatTimestamp(iso, t) {
  if (!iso) return ''
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = diffMs / 60000
  if (diffMin < 1) return t('matchRow.timeNow')
  if (diffMin < 60) return t('matchRow.timeMinutes', { count: Math.floor(diffMin) })
  const diffHr = diffMin / 60
  if (diffHr < 24) return t('matchRow.timeHours', { count: Math.floor(diffHr) })
  const diffDay = diffHr / 24
  if (diffDay < 7) return t('matchRow.timeDays', { count: Math.floor(diffDay) })
  return t('matchRow.timeLastWeek')
}

const RING_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-blue-400 to-primary',
  'from-purple-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-orange-400 to-amber-500',
]

// Same rhythm/typography as MatchRow, with the single avatar swapped for the
// circle's cover photo (or a gradient-fill initial, matching Circles' own
// StoryAvatar fallback convention) and the age-suffix swapped for member
// count. Row itself is a single button — there's no separate "view profile"
// affordance the way MatchRow has, since a circle isn't a person.
export default function CircleChatRow({ circle, preview, index, onOpenChat }) {
  const { t } = useTranslation('chat')

  const unread = preview?.unreadCount || 0
  const chatEnabled = preview?.chatEnabled !== false
  const hasConversation = !!preview?.lastMessage
  const previewText = !chatEnabled
    ? t('circleList.chatOffBadge')
    : hasConversation
      ? `${preview.lastMessageMine ? t('circleList.youPrefix') : ''}${preview.lastMessage}`
      : t('circleConversation.memberCount', { count: circle.memberCount ?? 0 })
  const gradient = RING_GRADIENTS[index % RING_GRADIENTS.length]

  return (
    <button onClick={onOpenChat} className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
      <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden">
        {circle.coverPhoto ? (
          <img src={circle.coverPhoto} alt={circle.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-base font-bold text-white">{circle.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14.5px] font-bold text-gray-900 truncate">{circle.name}</span>
          {!chatEnabled && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
              {t('circleList.chatOffBadge')}
            </span>
          )}
          {chatEnabled && !hasConversation && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
              {t('circleList.newBadge')}
            </span>
          )}
        </div>
        <p
          className={`truncate text-[13px] mt-0.5 ${
            unread > 0 && chatEnabled ? 'text-gray-800 font-semibold' : 'text-gray-400'
          }`}
        >
          {previewText}
        </p>
      </div>

      <div className="shrink-0 self-start flex flex-col items-end gap-1 pt-0.5">
        <span className={`text-[11px] ${unread > 0 && chatEnabled ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          {chatEnabled ? formatTimestamp(preview?.lastMessageAt, t) : ''}
        </span>
        {unread > 0 && chatEnabled && (
          <span
            className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center leading-none"
            aria-label={`${unread} unread`}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </div>
    </button>
  )
}
