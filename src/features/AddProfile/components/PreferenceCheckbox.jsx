export default function PreferenceCheckbox({ label, value, checked, onChange }) {
    return (
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          value={value}
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
        />
        <span className="text-gray-700">
          {label.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </label>
    );
  }
  