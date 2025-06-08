export function formatLastSeen(isoString) {
  if (!isoString) return 'Unknown';

  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffMs < minute) {
    return 'Active just now';
  } else if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `Active ${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (diffMs < day) {
    const hrs = Math.floor(diffMs / hour);
    return `Active ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  } else if (diffMs < day * 7) {
    const days = Math.floor(diffMs / day);
    return `Last seen ${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    // For anything more than 7 days ago, show full locale date
    return `Last seen on ${new Date(isoString).toLocaleDateString()}`;
  }
}
