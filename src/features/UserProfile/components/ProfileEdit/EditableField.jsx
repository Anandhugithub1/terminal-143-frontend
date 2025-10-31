

import { useState, useRef, useEffect } from "react";
import { Check, X, ChevronRight } from "lucide-react";

export function EditableField({ icon: Icon, label, value, onSave, type = "text", fieldKey }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "text") inputRef.current.select();
    }
  }, [isEditing, type]);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
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
              {fieldKey === "age" ? (
                //  date picker for Age (DOB)
                <input
                  ref={inputRef}
                  type="date"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                // Default text input for all other fields
                <input
                  ref={inputRef}
                  type={type}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="flex space-x-1">
                <button
                  onClick={handleSave}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-w-0">
            <span className="text-gray-700 font-semibold truncate">{label}</span>
            <span className="text-gray-500 truncate">{value}</span>
          </div>
        )}
      </div>

      {!isEditing && <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />}
    </div>
  );
}



