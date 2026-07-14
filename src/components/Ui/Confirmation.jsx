import { useTranslation } from "react-i18next";

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, name }) => {
  const { t } = useTranslation("swipe");
  if (!isOpen) return null;

  const displayName = name || t("confirmation.fallbackName");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
          {t("confirmation.titlePrefix")}{action}
        </h2>
        <p className="text-sm text-gray-600">
          {t("confirmation.body", { action, name: displayName })}
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
            className={`px-4 py-2 rounded-xl text-white
             bg-primary
            hover:opacity-90 transition`}
          >
            {t("confirmation.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
