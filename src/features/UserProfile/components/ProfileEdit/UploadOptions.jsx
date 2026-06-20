import { useState } from "react";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog";

export const UploadOptions = ({
  onRemove,
  onCamera,
  onGallery,
  onCancel,
  cameraLabel = "Take Photo",
  galleryLabel = "Choose from Gallery",
  removeLabel = "Remove Photo",
  modalTitle = "Remove Profile Photo?",
  modalDescription = "Are you sure you want to remove your profile picture? This cannot be undone.",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-lg w-64">
        <button
          onClick={onCamera}
          className="w-full py-2 mb-2 bg-blue-100 rounded-lg hover:bg-blue-200"
        >
          {cameraLabel}
        </button>
        <button
          onClick={onGallery}
          className="w-full py-2 mb-2 bg-green-100 rounded-lg hover:bg-green-200"
        >
          {galleryLabel}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-2 mb-2 bg-red-100 rounded-lg hover:bg-red-200"
        >
          {removeLabel}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          if (onCancel) onCancel();
        }}
        onConfirm={onRemove}
        title={modalTitle}
        message={modalDescription}
        confirmLabel="Remove"
      />
    </>
  );
};
