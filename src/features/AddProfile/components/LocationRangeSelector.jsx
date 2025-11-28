import  { useState, useCallback, useMemo, useEffect } from "react";
import { Radio, RadioGroup } from "@headlessui/react";

const MIN_RANGE = 1;
const MAX_RANGE = 30; // UI cap
const PRESETS = [5, 10, 20, 30];
const UNITS = ["km", "miles"];
const MI_IN_KM = 1.609344;

const toMiles = (km) => km / MI_IN_KM;
const toKm = (mi) => mi * MI_IN_KM;

const LocationRangeSelector = ({ formData, setFormData, t = (k) => k }) => {
  const initialUnit = formData?.searchRadius?.unit || "km";
  const [unit, setUnit] = useState(initialUnit);

  // numeric currentRange with fallback
  const currentRange = Number(formData?.searchRadius?.distance ?? 10);

  const clamp = useCallback(
    (n) => Math.min(MAX_RANGE, Math.max(MIN_RANGE, Math.round(Number(n)))),
    []
  );

  // Sync local unit if formData changes externally (production-friendly)
  useEffect(() => {
    const externalUnit = formData?.searchRadius?.unit;
    if (externalUnit && externalUnit !== unit) {
      setUnit(externalUnit);
    }
    // we intentionally don't include `unit` in deps to avoid loops; only react to formData changes
  }, [formData]);

  const updateForm = useCallback(
    (range, u = unit) => {
      const next = clamp(range);
      // avoid unnecessary state writes
      setFormData((prev) => {
        const prevUnit = prev?.searchRadius?.unit;
        const prevDistance = prev?.searchRadius?.distance;
        if (prevUnit === u && prevDistance === next) return prev;
        return {
          ...prev,
          searchRadius: { distance: next, unit: u },
        };
      });
    },
    [setFormData, unit, clamp]
  );

  const handleRangeChange = useCallback(
    (e) => updateForm(e.target.value),
    [updateForm]
  );

  const handleQuickSelect = useCallback(
    (preset) => updateForm(preset),
    [updateForm]
  );

  // Convert current value so real-world distance remains constant on unit toggle
  const handleUnitChange = useCallback(
    (u) => {
      if (u === unit) return;
      let converted = currentRange;

      if (unit === "km" && u === "miles") {
        converted = toMiles(currentRange);
      } else if (unit === "miles" && u === "km") {
        converted = toKm(currentRange);
      }

      setUnit(u);
      updateForm(converted, u); // persists converted+clamped value
    },
    [unit, currentRange, updateForm]
  );

  const rangeLabel = useMemo(() => {
    if (currentRange <= 5) return t("rangeNearby") || "Nearby";
    if (currentRange <= 15) return t("rangeCity") || "Within city";
    if (currentRange <= 25) return t("rangeRegion") || "Regional";
    return t("rangeAnywhere") || "Anywhere";
  }, [currentRange, t]);

  const formatRange = useCallback(
    (val) => (val >= MAX_RANGE ? `${MAX_RANGE}+ ${unit}` : `${val} ${unit}`),
    [unit]
  );

  return (
    <div className="bg-white/80 backdrop-blur-md p-7 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-md mx-auto">
      {/* Title */}
      <label className="block mb-6">
        <span className="block text-xl font-extrabold text-gray-900 mb-2">
          {t("distanceRangeTitle") || "Preferred Distance Range"}
        </span>
        <span className="block text-sm text-gray-600">
          {t("distanceRangeHelp") || "How far are you willing to connect with others?"}
        </span>
      </label>

      {/* Preset Buttons (Headless UI Radio) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("quickSelect") || "Quick Select"}
          </span>
        </div>

        <RadioGroup
          value={clamp(currentRange)}
          onChange={handleQuickSelect}
          as="div"
          className="grid grid-cols-4 gap-3"
        >
          {PRESETS.map((preset) => (
            <Radio
              key={preset}
              value={preset}
              as="button"
              className={({ checked }) =>
                `p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  checked
                    ? "bg-primary from-main-color to-main-color/80 text-white shadow-lg scale-105 border-transparent"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-main-color/40"
                }`
              }
              // ensure button semantics
              type="button"
            >
              {formatRange(preset)}
            </Radio>
          ))}
        </RadioGroup>
      </div>

      {/* Range Slider */}
      <div className="space-y-6">
        <div className="relative" aria-label={t("distanceSlider") || "Distance slider"}>
          <div className="flex justify-between text-xs text-gray-500 mb-3 px-1">
            {[MIN_RANGE, 10, 20, MAX_RANGE].map((mark) => (
              <span key={mark}>
                {mark}
                {unit}
              </span>
            ))}
          </div>

          <div className="relative">
            {/* Track */}
            <div className="absolute top-1/2 left-0 w-full h-2 rounded-full bg-gray-200 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-2 rounded-full bg-gradient-to-r from-main-color to-main-color/70 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(clamp(currentRange) / MAX_RANGE) * 100}%` }}
              aria-hidden="true"
            />

            {/* Input range */}
            <input
              type="range"
              min={MIN_RANGE}
              max={MAX_RANGE}
              step={1}
              value={clamp(currentRange)}
              onChange={handleRangeChange}
              aria-valuemin={MIN_RANGE}
              aria-valuemax={MAX_RANGE}
              aria-valuenow={clamp(currentRange)}
              aria-label={t("distanceSlider") || "Distance slider"}
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
            {formatRange(clamp(currentRange))}
          </div>
          <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {rangeLabel}
          </div>
          <div className="w-12 h-1 bg-main-color/40 rounded-full mx-auto mt-3" />
        </div>

        {/* Unit Toggle (Headless UI Radio) */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("distanceUnit") || "Distance Unit"}
            </label>
            <p className="text-xs text-gray-500">
              {t("distanceUnitHelp") || "Choose your preferred measurement"}
            </p>
          </div>

          <RadioGroup
            value={unit}
            onChange={handleUnitChange}
            as="div"
            className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-inner"
          >
            {UNITS.map((u) => (
              <Radio
                key={u}
                value={u}
                as="button"
                type="button"
                className={({ checked }) =>
                  `px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 min-w-[80px] ${
                    checked ? "bg-white text-main-color shadow-md border border-gray-200 scale-105" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`
                }
              >
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </Radio>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default LocationRangeSelector;
