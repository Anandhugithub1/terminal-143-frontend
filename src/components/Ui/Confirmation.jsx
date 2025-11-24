export const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, name }) => {
  if (!isOpen) return null;

  const displayName = name || "this user"; // fallback if no name is available

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
          Confirm {action}
        </h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to{" "}
          <strong className="capitalize">{action}</strong> the match request from{" "}
          <strong>{displayName}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white 
             bg-primary
            hover:opacity-90 transition`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
