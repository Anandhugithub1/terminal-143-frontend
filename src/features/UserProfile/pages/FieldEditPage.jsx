import React, { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronDownIcon } from "lucide-react"
import { interestMap, calculateAge } from "../../../Utlis/utlis"

const CURRENT_YEAR = new Date().getFullYear()
const MIN_DOB = "1950-01-01"
const MAX_DOB = `${CURRENT_YEAR}-12-31`

const LANGUAGES_CDN_URL =
  "https://d36zx1g74mcorc.cloudfront.net/website_files/languages/languages.json"

export default function FieldEditPage({
  field,
  value,
  onSave,
  onCancel,
  isSaving
}) {
  const [inputValue, setInputValue] = useState(value || "")
  const [selectedInterests, setSelectedInterests] = useState([])
  const [languagesList, setLanguagesList] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [openLanguagePicker, setOpenLanguagePicker] = useState(false)
  const [dobError, setDobError] = useState("")

  const allInterests = useMemo(
    () =>
      Object.entries(interestMap).map(([key, value]) => ({
        key,
        label: value.label,
        icon: value.icon
      })),
    []
  )

  /* ---------- Load languages ---------- */
  useEffect(() => {
    if (field.key !== "languages") return

    fetch(LANGUAGES_CDN_URL)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return

        const normalized = data
          .map((item, index) => {
            if (typeof item === "string") {
              return { value: item, label: item }
            }

            const value =
              item.value ||
              item.code ||
              item.shortCode ||
              item.languageCode ||
              `lang-${index}`

            const label =
              item.label ||
              item.name ||
              item.language ||
              item.nativeName ||
              value

            return { value, label }
          })
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
              sensitivity: "base"
            })
          )

        setLanguagesList(normalized)
      })
      .catch(() => {})
  }, [field.key])

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
    } else {
      onSave(inputValue.trim())
    }
  }

  const isBioField =
    field.key === "bio" ||
    field.key === "about" ||
    field.label.toLowerCase().includes("bio")

  const isAgeField = field.key === "age"

  /* ---------- Render ---------- */
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
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
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-[#FF3366] text-white hover:bg-[#e52b5d]"
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
      <div className="flex-1 overflow-y-auto p-5">
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
                      ? "bg-pink-100 border-pink-300 text-pink-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#FF3366]"
                  }
                `}
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
              disabled={isSaving}
              onClick={() =>
                setOpenLanguagePicker(prev => !prev)
              }
              className="inline-flex w-full justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-[#FF3366]"
            >
              <span className="truncate">
                {selectedLanguages.length
                  ? selectedLanguages.map(l => l.label).join(", ")
                  : "Select languages..."}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </button>

            {openLanguagePicker && (
              <div className="mt-3 border rounded-lg max-h-60 overflow-y-auto">
                {languagesList.map(lang => (
                  <div
                    key={lang.value}
                    onClick={() =>
                      !isSaving &&
                      setSelectedLanguages(prev =>
                        prev.some(l => l.value === lang.value)
                          ? prev.filter(l => l.value !== lang.value)
                          : [...prev, lang]
                      )
                    }
                    className={`px-4 py-2 cursor-pointer text-sm
                      ${
                        selectedLanguages.some(
                          l => l.value === lang.value
                        )
                          ? "bg-pink-50 text-pink-700 border-l-2 border-[#FF3366]"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : isBioField ? (
          <textarea
            disabled={isSaving}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            rows={6}
            className="w-full border rounded-lg p-3 resize-none"
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
              className="w-full border rounded-lg p-3"
            />
            {dobError && (
              <p className="mt-2 text-sm text-red-600">{dobError}</p>
            )}
          </>
        ) : (
          <input
            disabled={isSaving}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        )}
      </div>
    </div>
  )
}
