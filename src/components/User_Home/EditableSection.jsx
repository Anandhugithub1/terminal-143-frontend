import React, { useState, useRef, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';

export function EditableSection({ 
  title, 
  value, 
  onSave, 
  isBio = false, 
  iconMap = [] 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);

    if (!isBio && Array.isArray(value)) {
      setSelectedInterests(
        iconMap.map(item => ({
          ...item,
          selected: value.includes(item.key),
        }))
      );
    } else if (isBio) {
      setSelectedInterests(iconMap.map(item => ({ ...item, selected: false })));
    }
  }, [value, iconMap, isBio]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (isBio) {
        inputRef.current.selectionStart = inputValue.length;
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (isBio) {
      onSave(inputValue);
    } else {
      const selected = selectedInterests
        .filter(item => item.selected)
        .map(item => item.key);
      onSave(selected);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);

    if (!isBio && Array.isArray(value)) {
      setSelectedInterests(
        iconMap.map(item => ({
          ...item,
          selected: value.includes(item.key),
        }))
      );
    }
  };

  const toggleInterest = (key) => {
    setSelectedInterests(prev =>
      prev.map(item =>
        item.key === key ? { ...item, selected: !item.selected } : item
      )
    );
  };

  return (
    <section className="bg-gray-100 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-pink-600 hover:text-pink-700 flex items-center"
          >
            <Edit size={16} className="mr-1" />
            <span className="text-sm font-medium">Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cancel"
            >
              <X size={18} />
            </button>
            <button
              onClick={handleSave}
              className="text-pink-600 hover:text-pink-700"
              aria-label="Save"
            >
              <Check size={18} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2">
          {isBio ? (
            <>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={4}
                placeholder="Tell something about yourself..."
              />
              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedInterests.map(({ key, label, icon: Icon, selected }) => (
                <button
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition ${
                    selected
                      ? 'bg-pink-100 border border-pink-300 text-pink-700'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-pink-600' : 'text-gray-500'} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        isBio ? (
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {value || (
              <span className="text-gray-400 italic">
                Click "Edit" to add your {title.toLowerCase()}
              </span>
            )}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(value) && value.length > 0 ? (
              iconMap
                .filter(item => value.includes(item.key))
                .map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                  >
                    <Icon size={16} className="text-pink-600" />
                    <span className="text-gray-700">{label}</span>
                  </div>
                ))
            ) : (
              <span className="text-sm text-gray-400 italic">
                Click "Edit" to select your {title.toLowerCase()}
              </span>
            )}
          </div>
        )
      )}
    </section>
  );
}
