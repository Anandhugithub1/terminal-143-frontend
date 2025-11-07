export function formatLastSeen(raw) {
  // If backend already provided a friendly string, return it
  if (typeof raw === 'string') {
    return raw;
  }

  // If missing, return one of the two fallbacks (50/50)
  if (raw == null) {
    return Math.random() < 0.5 ? 'Last seen within a month' : 'Last seen: 2 months ago';
  }

  // Normalize numeric timestamps: accept seconds or ms
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 'Last seen within a month';
  }
  const ts = n > 1e12 ? n : n > 1e9 ? n * 1000 : n; // ms

  const diff = Date.now() - ts;
  if (diff < 0) return 'Last seen just now';

  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'Last seen just now';
  if (mins < 60) return 'Last seen within a day';

  const hours = Math.floor(mins / 60);
  if (hours < 24) return 'Last seen within a day';

  const days = Math.floor(hours / 24);
  if (days < 7) return 'Last seen within a week';
  if (days < 30) return 'Last seen within a month';
  if (days < 60) return 'Last seen: 2 months ago';
  return 'Last seen: more than 2 months ago';
}
