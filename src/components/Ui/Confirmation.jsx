import { useTranslation } from "react-i18next";

// The request API still speaks "reject"/"accept" (see useMatchRequestResponse),
// but that's not how we want it to read to the user — a match request isn't
// being "rejected", the viewer is just passing on it, or matching. Map the
// action value to its display word here, once, instead of at each call site.
const ACTION_LABELS = {
  reject: "pass",
  accept: "match",
};

// "pass on X" vs "match with X" need different prepositions, so each action
// gets its own body copy rather than one template shared across both.
const BODY_KEYS = {
  reject: "confirmation.bodyPass",
  accept: "confirmation.bodyMatch",
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, name }) => {
  const { t } = useTranslation("swipe");
  if (!isOpen) return null;

  const displayName = name || t("confirmation.fallbackName");
  const displayAction = ACTION_LABELS[action] || action;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
          {t("confirmation.titlePrefix")}{displayAction}
        </h2>
        <p className="text-sm text-gray-600">
          {t(BODY_KEYS[action] || "confirmation.body", { action: displayAction, name: displayName })}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            {t("confirmation.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white capitalize
             bg-primary
            hover:opacity-90 transition`}
          >
            {displayAction}
          </button>
        </div>
      </div>
    </div>
  );
};
