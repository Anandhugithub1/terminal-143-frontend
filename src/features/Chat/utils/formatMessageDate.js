// Groups messages by calendar day for the divider chips shown between
// bubbles (WhatsApp/iMessage-style "Today" / "Yesterday" / date), and
// tells the caller which message in a chronologically-sorted list starts
// a new day so a divider only renders once per day, not per message.
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function formatDateDivider(iso, t) {
  const date = new Date(iso)
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const oneDayMs = 24 * 60 * 60 * 1000

  if (target === today) return t('conversation.dateToday')
  if (target === today - oneDayMs) return t('conversation.dateYesterday')

  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

// True when `msg` is the first message of its calendar day within `messages`
// (chronologically sorted) — i.e. a date divider belongs right above it.
export function isNewDay(messages, index) {
  if (index === 0) return true
  const prev = new Date(messages[index - 1].sentAt)
  const curr = new Date(messages[index].sentAt)
  return startOfDay(prev) !== startOfDay(curr)
}
