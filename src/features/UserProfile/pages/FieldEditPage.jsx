import React, { useState, useEffect, useMemo } from "react"
import { ChevronLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { interestMap, calculateAge } from "../../../Utlis/utlis"
import { statusOptions } from "../../AddProfile/utlis"
import useLanguages from "../../AddProfile/hooks/useLanguages"
import LanguagePicker from "../../AddProfile/components/LanguagePicker"

const CURRENT_YEAR = new Date().getFullYear()
const MIN_DOB = "1950-01-01"
const MAX_DOB = `${CURRENT_YEAR}-12-31`
const TODAY = new Date().toISOString().slice(0, 10)

export default function FieldEditPage({
  field,
  value,
  onSave,
  onCancel,
  isSaving
}) {
  const { t } = useTranslation("common")
  const [inputValue, setInputValue] = useState(value || "")
  const [selectedInterests, setSelectedInterests] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [dobError, setDobError] = useState("")
  const [stdStatus, setStdStatus] = useState("")
  const [lastTestedDate, setLastTestedDate] = useState("")

  const {
    languagesList,
    loading: languagesLoading,
    error: languagesError
  } = useLanguages()

  const allInterests = useMemo(
    () =>
      Object.entries(interestMap).map(([key, value]) => ({
        key,
        label: value.label,
        icon: value.icon
      })),
    []
  )

  /* ---------- Init state ---------- */
 useEffect(() => {
  if (isSaving) return   // 

  if (field.key === "interest") {
    setSelectedInterests(
      allInterests.map(item => ({
        ...item,
        selected: (value || []).includes(item.key)
      }))
    )
  } else if (field.key === "languages") {
    setSelectedLanguages(
      Array.isArray(value)
        ? value.map(v => {
            if (typeof v !== "string") return v
            return (
              languagesList.find(l => l.value === v) || {
                label: v,
                value: v
              }
            )
          })
        : []
    )
  } else if (field.key === "healthStatus") {
    setStdStatus(value?.stdStatus || "")
    setLastTestedDate(value?.lastTestedDate || "")
  } else {
    setInputValue(value || "")
  }
}, [field, value, languagesList, allInterests, isSaving])


  /* ---------- Helpers ---------- */
  const validateDob = dob => {
    if (!dob) return "Date of birth is required"
    if (dob > MAX_DOB) return "Date of birth cannot be in the future"
    if (dob < MIN_DOB) return "Please enter a valid date of birth"
    if (calculateAge(dob) < 18) return "You must be at least 18 years old"
    return ""
  }

  const handleDobChange = dob => {
    setInputValue(dob)
    setDobError(validateDob(dob))
  }

  const toggleInterest = key => {
    if (isSaving) return
    setSelectedInterests(prev =>
      prev.map(item =>
        item.key === key
          ? { ...item, selected: !item.selected }
          : item
      )
    )
  }

  const handleSave = () => {
    if (isSaving) return

    if (field.key === "interest") {
      onSave(
        selectedInterests
          .filter(i => i.selected)
          .map(i => i.key)
      )
    } else if (field.key === "languages") {
      onSave(
        "languagesKnown",
        selectedLanguages.map(l => l.value)
      )
    } else if (field.key === "age") {
      const error = validateDob(inputValue.trim())
      if (error) {
        setDobError(error)
        return
      }
      onSave("dob", inputValue.trim())
    } else if (field.key === "healthStatus") {
      onSave("healthStatus", { stdStatus, lastTestedDate })
    } else {
      onSave(inputValue.trim())
    }
  }

  const isBioField =
    field.key === "bio" ||
    field.key === "about" ||
    field.label.toLowerCase().includes("bio")

  const isAgeField = field.key === "age"
  const isHealthStatusField = field.key === "healthStatus"

  const STD_STATUS_LABEL_KEYS = {
    p: "stdStatusPositive",
    n: "stdStatusNegative",
    pns: "stdStatusUnknown"
  }

  /* ---------- Render ---------- */
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <div className="flex items-center">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>

          <h2 className="text-lg font-semibold text-gray-800 ml-2">
            {isAgeField ? "Edit Date of Birth" : `Edit ${field.label}`}
          </h2>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || (isAgeField && !!dobError)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center min-w-[72px]
            ${
              isSaving || (isAgeField && !!dobError)
                ? "bg-primary/40 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }
          `}
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Save"
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
        {field.key === "interest" ? (
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map(({ key, label, icon: Icon, selected }) => (
              <button
                key={key}
                disabled={isSaving}
                onClick={() => toggleInterest(key)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border transition
                  ${
                    selected
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-gray-200 text-gray-700 hover:border-primary"
                  }
                `}
              >
                <Icon
                  size={16}
                  className={selected ? "text-primary" : "text-gray-500"}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ) : field.key === "languages" ? (
          <LanguagePicker
            languagesList={languagesList}
            loading={languagesLoading}
            error={languagesError}
            selected={selectedLanguages}
            onChange={isSaving ? () => {} : setSelectedLanguages}
          />
        ) : isBioField ? (
          <textarea
            disabled={isSaving}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 disabled:opacity-60"
          />
        ) : isAgeField ? (
          <>
            <input
              disabled={isSaving}
              type="date"
              min={MIN_DOB}
              max={MAX_DOB}
              value={inputValue}
              onChange={e => handleDobChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 disabled:opacity-60"
            />
            {dobError && (
              <p className="mt-2 text-sm text-red-600">{dobError}</p>
            )}
          </>
        ) : isHealthStatusField ? (
          <div className="space-y-5">
            <p className="text-xs text-gray-500">
              {t("healthStatusOptionalNote")}
            </p>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t("stdStatusLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isSaving}
                    onClick={() => setStdStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition
                      ${
                        stdStatus === opt.value
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-white border-gray-200 text-gray-700 hover:border-primary"
                      }
                    `}
                  >
                    {t(STD_STATUS_LABEL_KEYS[opt.value] || opt.label)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t("testedOn")}
              </label>
              <input
                disabled={isSaving}
                type="date"
                max={TODAY}
                value={lastTestedDate}
                onChange={e => setLastTestedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 disabled:opacity-60"
              />
            </div>
          </div>
        ) : (
          <input
            disabled={isSaving}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 disabled:opacity-60"
          />
        )}
      </div>
    </div>
  )
}
