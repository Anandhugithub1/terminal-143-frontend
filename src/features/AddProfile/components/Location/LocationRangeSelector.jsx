import { useState, useCallback, useMemo, useEffect } from "react"
import { Radio, RadioGroup } from "@headlessui/react"

const STEP_KM = 25
const STEP_MI = 15

const MIN_RANGE_KM = 25
const MAX_RANGE_KM = 100

const MIN_RANGE_MI = 15
const MAX_RANGE_MI = 60

const PRESETS_KM = [25, 50, 75, 100]
const PRESETS_MI = [15, 30, 45, 60]

const UNITS = ["km", "miles"]

const LocationRangeSelector = ({ formData, setFormData, t = (k) => k }) => {
  const initialUnit = formData?.searchRadius?.unit || "km"
  const [unit, setUnit] = useState(initialUnit)

  const presets = unit === "km" ? PRESETS_KM : PRESETS_MI
  const minRange = unit === "km" ? MIN_RANGE_KM : MIN_RANGE_MI
  const maxRange = unit === "km" ? MAX_RANGE_KM : MAX_RANGE_MI
  const step = unit === "km" ? STEP_KM : STEP_MI

  const currentRange = Number(
    formData?.searchRadius?.distance ?? minRange
  )

  const snapToStep = useCallback(
    (n) => {
      const num = Number(n)
      if (Number.isNaN(num)) return minRange

      const snapped = presets.reduce((prev, curr) =>
        Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
      )

      return Math.min(maxRange, Math.max(minRange, snapped))
    },
    [presets, minRange, maxRange]
  )

  useEffect(() => {
    const externalUnit = formData?.searchRadius?.unit
    if (externalUnit && externalUnit !== unit) {
      setUnit(externalUnit)
    }
  }, [formData, unit])

  const updateForm = useCallback(
    (range, u = unit) => {
      const next = snapToStep(range)

      setFormData({
        searchRadius: { distance: next, unit: u }
      })
    },
    [setFormData, unit, snapToStep]
  )

  const handleRangeChange = useCallback(
    (e) => updateForm(e.target.value),
    [updateForm]
  )

  const handleQuickSelect = useCallback(
    (preset) => updateForm(preset),
    [updateForm]
  )

  const handleUnitChange = useCallback(
    (u) => {
      if (u === unit) return

      setUnit(u)

      const newPresets = u === "km" ? PRESETS_KM : PRESETS_MI
      updateForm(newPresets[0], u)
    },
    [unit, updateForm]
  )

  const rangeLabel = useMemo(() => {
    if (currentRange <= presets[0])
      return t("rangeNearby") || "Nearby"
    if (currentRange <= presets[1])
      return t("rangeCity") || "Within city"
    if (currentRange <= presets[2])
      return t("rangeRegion") || "Regional"
    return t("rangeAnywhere") || "Anywhere"
  }, [currentRange, presets, t])

  const formatRange = useCallback(
    (val) => `${val} ${unit}`,
    [unit]
  )

  const snappedRange = snapToStep(currentRange)

  return (
    <div className="bg-white/80 backdrop-blur-md p-7 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-md mx-auto">
      <label className="block mb-6">
        <span className="block text-xl font-extrabold text-gray-900 mb-2">
          {t("distanceRangeTitle") || "Preferred Distance Range"}
        </span>
        <span className="block text-sm text-gray-600">
          {t("distanceRangeHelp") ||
            "How far are you willing to connect with others?"}
        </span>
      </label>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("quickSelect") || "Quick Select"}
          </span>
        </div>

        <RadioGroup
          value={snappedRange}
          onChange={handleQuickSelect}
          as="div"
          className="grid grid-cols-4 gap-3"
        >
          {presets.map((preset) => (
            <Radio
              key={preset}
              value={preset}
              as="button"
              type="button"
              className={({ checked }) =>
                `p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  checked
                    ? "bg-primary text-white shadow-lg scale-105 border-transparent"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-main-color/40"
                }`
              }
            >
              {formatRange(preset)}
            </Radio>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="flex justify-between text-xs text-gray-500 mb-3 px-1">
            {presets.map((mark) => (
              <span key={mark}>
                {mark}
                {unit}
              </span>
            ))}
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-2 rounded-full bg-gray-200 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-2 rounded-full bg-gradient-to-r from-main-color to-main-color/70 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(snappedRange / maxRange) * 100}%` }}
            />

            <input
              type="range"
              min={minRange}
              max={maxRange}
              step={step}
              value={snappedRange}
              onChange={handleRangeChange}
              aria-valuemin={minRange}
              aria-valuemax={maxRange}
              aria-valuenow={snappedRange}
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

        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner">
          <div className="text-4xl font-bold text-main-color mb-1">
            {formatRange(snappedRange)}
          </div>
          <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {rangeLabel}
          </div>
          <div className="w-12 h-1 bg-main-color/40 rounded-full mx-auto mt-3" />
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("distanceUnit") || "Distance Unit"}
            </label>
            <p className="text-xs text-gray-500">
              {t("distanceUnitHelp") ||
                "Choose your preferred measurement"}
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
                    checked
                      ? "bg-white text-main-color shadow-md border border-gray-200 scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
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
  )
}

export default LocationRangeSelector
