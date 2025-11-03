import { useState } from "react";

const LocationRangeSelector = ({ formData, setFormData, t }) => {
  const [unit, setUnit] = useState(formData.distanceUnit || "km");

  const currentRange = formData.locationRange || 10;
  const rangePresets = [5, 10, 20, 30];

  const handleRangeChange = (e) => {
    const range = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      locationRange: range,
      distanceUnit: unit,
    }));
  };

  const handleQuickSelect = (range) => {
    setFormData((prev) => ({
      ...prev,
      locationRange: range,
      distanceUnit: unit,
    }));
  };

  const getRangeLabel = (range) => {
    if (range <= 5) return t("rangeNearby") || "Nearby";
    if (range <= 15) return t("rangeCity") || "Within city";
    if (range <= 25) return t("rangeRegion") || "Regional";
    return t("rangeAnywhere") || "Anywhere";
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-7 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-md mx-auto">
      {/* Title */}
      <label className="block mb-6">
        <span className="block text-xl font-extrabold text-gray-900 mb-2">
          {t("locationRangeTitle") || "Preferred Distance Range"}
        </span>
        <span className="block text-sm text-gray-600">
          How far are you willing to connect with others?
        </span>
      </label>

      {/* Preset Buttons */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Quick Select
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {rangePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickSelect(preset)}
              className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${
                  currentRange === preset
                    ? "bg-gradient-to-br from-main-color to-main-color/80 text-white shadow-lg scale-105 border-transparent"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-main-color/40"
                }
              `}
            >
              {preset === 30 ? `30+ ${unit}` : `${preset} ${unit}`}
            </button>
          ))}
        </div>
      </div>

      {/* Range Slider */}
      <div className="space-y-6">
        <div className="relative">
          <div className="flex justify-between text-xs text-gray-500 mb-3 px-1">
            {[1, 10, 20, 30].map((mark) => (
              <span key={mark}>{mark}{unit}</span>
            ))}
          </div>

          <div className="relative">
            {/* Track */}
            <div className="absolute top-1/2 left-0 w-full h-2 rounded-full bg-gray-200 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-2 rounded-full bg-gradient-to-r from-main-color to-main-color/70 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(currentRange / 30) * 100}%` }}
            />

            {/* Input range */}
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={currentRange}
              onChange={handleRangeChange}
              className="w-full appearance-none bg-transparent cursor-pointer relative z-10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-main-color
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
                focus:outline-none"
            />
          </div>
        </div>

        {/* Current selection */}
        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner">
          <div className="text-4xl font-bold text-main-color mb-1">
            {currentRange === 30 ? `30+ ${unit}` : `${currentRange} ${unit}`}
          </div>
          <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {getRangeLabel(currentRange)}
          </div>
          <div className="w-12 h-1 bg-main-color/40 rounded-full mx-auto mt-3" />
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Distance Unit
            </label>
            <p className="text-xs text-gray-500">
              Choose your preferred measurement
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-inner">
            {["km", "miles"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 min-w-[80px]
                  ${
                    unit === u
                      ? "bg-white text-main-color shadow-md border border-gray-200 scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }
                `}
              >
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationRangeSelector;
