import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronDownIcon } from "lucide-react";
import { interestMap } from "../../../Utlis/utlis";
import { LANGUAGES } from "../utlis/profileUtils";

export default function FieldEditPage({ field, value, onSave, onCancel }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [openLanguagePicker, setOpenLanguagePicker] = useState(false);

  const allInterests = Object.entries(interestMap).map(([key, value]) => ({
    key,
    label: value.label,
    icon: value.icon,
  }));

  useEffect(() => {
    if (field.key === "interest") {
      const updated = allInterests.map((item) => ({
        ...item,
        selected: (value || []).includes(item.key),
      }));
      setSelectedInterests(updated);
    } else if (field.key === "languages") {
      const normalized =
        Array.isArray(value) && value.length > 0
          ? value.map((v) =>
              typeof v === "string"
                ? LANGUAGES.find((lang) => lang.value === v) || {
                    label: v,
                    value: v,
                  }
                : v
            )
          : [];
      setSelectedLanguages(normalized);
    } else {
      setInputValue(value || "");
    }
  }, [field, value]);

  const toggleInterest = (key) => {
    setSelectedInterests((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, selected: !item.selected } : item
      )
    );
  };

const handleSave = () => {
  if (field.key === "interest") {
    const selectedKeys = selectedInterests
      .filter((item) => item.selected)
      .map((item) => item.key);
    onSave(selectedKeys);
  } else if (field.key === "languages") {
    const selectedValues = selectedLanguages.map((l) => l.value);
    onSave(selectedValues);
  } else if (field.key === "age") {
    // Save as 'dob' instead of 'age'
    onSave("dob", inputValue.trim());

  } else {
    onSave(inputValue.trim());
  }
};

  const isBioField =
    field.key === "bio" ||
    field.key === "about" ||
    field.label.toLowerCase().includes("bio");

  const isAgeField = field.key === "age";

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header with Save and Cancel */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 ml-2">
            {isAgeField ? "Edit Date of Birth" : `Edit ${field.label}`}
          </h2>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-[#FF3366] text-white text-sm font-medium hover:bg-[#e52b5d] transition"
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {field.key === "interest" ? (
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map(({ key, label, icon: Icon, selected }) => (
              <button
                key={key}
                onClick={() => toggleInterest(key)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border transition ${
                  selected
                    ? "bg-pink-100 border-pink-300 text-pink-700"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#FF3366]"
                }`}
              >
                <Icon
                  size={16}
                  className={selected ? "text-pink-600" : "text-gray-500"}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ) : field.key === "languages" ? (
          <>
            <button
              onClick={() => setOpenLanguagePicker((o) => !o)}
              className="inline-flex w-full justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:border-[#FF3366] focus:outline-none focus:ring-2 focus:ring-[#FF3366] transition"
            >
              <span className="truncate text-gray-800">
                {selectedLanguages.length
                  ? selectedLanguages.map((l) => l.label).join(", ")
                  : "Select languages..."}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
            </button>

            {openLanguagePicker && (
              <div className="mt-3 border border-gray-200 rounded-lg shadow-sm bg-white max-h-60 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.value}
                    onClick={() =>
                      setSelectedLanguages((prev) =>
                        prev.some((l) => l.value === lang.value)
                          ? prev.filter((l) => l.value !== lang.value)
                          : [...prev, lang]
                      )
                    }
                    className={`px-4 py-2 cursor-pointer text-sm ${
                      selectedLanguages.some((l) => l.value === lang.value)
                        ? "bg-pink-50 text-pink-700 border-l-2 border-[#FF3366]"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : isBioField ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell something about yourself..."
            className="w-full border border-gray-300 rounded-lg p-3 
                       focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent 
                       resize-none hover:border-[#FF3366]"
            rows={6}
            spellCheck={false}
          />
        ) : isAgeField ? (
          <input
            type="date"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 
                       focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent 
                       hover:border-[#FF3366]"
          />
        ) : (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            className="w-full border border-gray-300 rounded-lg p-3 
                       focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent 
                       hover:border-[#FF3366]"
          />
        )}
      </div>
    </div>
  );
}
