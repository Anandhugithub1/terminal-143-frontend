/* ================= features/profiles/utils.js ================= */
// Helper to format “last seen” into relative text
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
    } else {
      // For anything >24h ago, show full locale date
      return new Date(isoString).toLocaleDateString();
    }
  }