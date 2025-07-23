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




export function UploadOptions({ onCamera, onGallery, onCancel, onRemove }) {
  return (
    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-lg z-10 w-52">
      <h3 className="text-center font-semibold mb-2">Upload Photo</h3>
      <button onClick={onCamera} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Use Camera
      </button>
      <button onClick={onGallery} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Choose from Gallery
      </button>
      <button onClick={onRemove} className="w-full py-2 mb-2 bg-red-100 rounded-lg hover:bg-red-200">
        Remove Photo
      </button>
      <button onClick={onCancel} className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Cancel
      </button>
    </div>
  );
}