export const TagSection = ({ label, predefinedOptions, selectedOptions, onToggle }) => (
    <div className="space-y-2">
      <label className="block text-gray-500 text-sm mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {predefinedOptions.map(option => (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedOptions.includes(option)
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedOptions.map(option => (
          <span
            key={option}
            className="flex items-center bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-sm"
          >
            {option}
            <button
              type="button"
              onClick={() => onToggle(option)}
              className="ml-1 hover:text-pink-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );