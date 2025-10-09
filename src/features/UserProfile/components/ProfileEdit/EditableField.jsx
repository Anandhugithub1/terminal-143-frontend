import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, X } from 'lucide-react';

export function EditableField({ icon: Icon, label, value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easier editing
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      onClick={() => !isEditing && setIsEditing(true)}
      className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
    >
      <div className="flex items-center space-x-3 min-w-0">
        <Icon size={20} className="text-gray-700 flex-shrink-0" />
        
        {isEditing ? (
          <div className="flex flex-col flex-grow min-w-0">
            <span className="text-sm text-gray-500 font-medium mb-1">{label}</span>
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex space-x-1">
                <button 
                  onClick={handleSave}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                  aria-label="Save"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={handleCancel}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-w-0">
            <span className="text-gray-700 font-medium truncate">{label}</span>
            <span className="text-gray-500 truncate">{value}</span>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="flex items-center space-x-2 ml-2">
          <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}


export const ConfirmModal = ({ open, onCancel, onConfirm, title, description }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};



export const UploadOptions = ({
  onRemove,
  onCamera,
  onGallery,
  onCancel, // <-- added back
  cameraLabel = 'Take Photo',
  galleryLabel = 'Choose from Gallery',
  removeLabel = 'Remove Photo',
  modalTitle = 'Remove Profile Photo?',
  modalDescription = 'Are you sure you want to remove your profile picture? This cannot be undone.',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleRemove = () => {
    setShowModal(false);
    onRemove();
  };

  const handleCancel = () => {
    setShowModal(false);
    if (onCancel) onCancel(); // call parent callback if provided
  };

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
          onClick={() => setShowModal(true)}
          className="w-full py-2 mb-2 bg-red-100 rounded-lg hover:bg-red-200"
        >
          {removeLabel}
        </button>
      </div>

      <ConfirmModal
        open={showModal}
        onCancel={handleCancel} 
        onConfirm={handleRemove}
        title={modalTitle}
        description={modalDescription}
      />
    </>
  );
};
