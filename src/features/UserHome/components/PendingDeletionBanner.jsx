import { AlertTriangle } from "lucide-react";

function formatDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  const msLeft = expiresAt * 1000 - Date.now();
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  return daysLeft > 0 ? daysLeft : 0;
}

export default function PendingDeletionBanner({ expiresAt, onRestore, isRestoring }) {
  const daysLeft = formatDaysLeft(expiresAt);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-900">
            Your account is scheduled for deletion
          </p>
          <p className="text-sm text-rose-800/80 mt-1">
            {daysLeft != null
              ? `It will be permanently removed in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
              : "It will be permanently removed soon."}{" "}
            Want to keep it?
          </p>

          <button
            onClick={onRestore}
            disabled={isRestoring}
            className="mt-3 px-4 py-1.5 text-sm bg-rose-600 text-white rounded-full disabled:opacity-50"
          >
            {isRestoring ? "Restoring…" : "Restore my account"}
          </button>
        </div>
      </div>
    </div>
  );
}
