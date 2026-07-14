import React, { useState, useEffect, Fragment } from "react"
import { useWizard } from "../../contexts/ProfileWizard"
import { useNavigate } from "react-router-dom"
import { ProgressBar } from "./Progess"
import { Button } from "../../../../shared/Button"
import useLanguages from "../../hooks/useLanguages"
import LanguagePicker from "../../components/LanguagePicker"
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition
} from "@headlessui/react"
import { healthDisclosureOptions } from "../../utlis"
import { useTranslation } from "react-i18next"

export default function Bio() {
  const { t } = useTranslation("common")
  const { formData, setFormData } = useWizard()
  const navigate = useNavigate()
  const charLimit = 500

  const {
    languagesList,
    loading: languagesLoading,
    error: languagesError
  } = useLanguages()

  const [selectedLanguages, setSelectedLanguages] = useState([])

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (!languagesList.length) return
    if (
      Array.isArray(formData.languagesKnown) &&
      formData.languagesKnown.length
    ) {
      setSelectedLanguages(
        languagesList.filter(l =>
          formData.languagesKnown.includes(l.value)
        )
      )
    }
  }, [languagesList, formData.languagesKnown])

  /* ---------------- validation ---------------- */

  const isBioValid =
    typeof formData.bio === "string" &&
    formData.bio.trim().length > 0

  /* ---------------- health disclosures ---------------- */

const disclosures = Array.isArray(formData.healthDisclosures)
  ? formData.healthDisclosures
  : []


  const disclosureLabel = value =>
    healthDisclosureOptions.find(o => o.value === value)?.label

  /* ---------------- handlers ---------------- */

const handleNext = () => {
  if (!isBioValid) return

  setFormData({
    languagesKnown: selectedLanguages.map(l => l.value),
    healthDisclosures: disclosures
  })

  navigate("/complete/photo")
}


  /* ---------------- render ---------------- */

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 animate-fade-in">
      <ProgressBar step={3} totalSteps={5} />

      {/* Bio */}
      <section className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">
          {t("wizard.bio.yourStory")}
        </h2>

        <textarea
          value={formData.bio || ""}
          onChange={e =>
            setFormData({
              bio: e.target.value.slice(0, charLimit)
            })
          }
          placeholder={t("wizard.bio.placeholder")}
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[160px]"
        />

        <div className="flex justify-between text-sm">
          {!isBioValid && (
            <span className="text-gray-400">
              {t("wizard.bio.required")}
            </span>
          )}
          <span className="text-gray-400 ml-auto">
            {formData.bio?.length || 0}/{charLimit}
          </span>
        </div>
      </section>

      {/* Languages */}
      <section>
        <h3 className="mb-2 font-semibold">
          {t("wizard.bio.languagesKnown")}
        </h3>

        <LanguagePicker
          languagesList={languagesList}
          loading={languagesLoading}
          error={languagesError}
          selected={selectedLanguages}
          onChange={setSelectedLanguages}
        />
      </section>

      {/* Health Disclosures — SAME LOOK AS LANGUAGE OPTIONS */}
{/* Health Disclosures — dropdown + selected pills (like LanguagePicker) */}
<section className="space-y-2">
  <h3 className="font-semibold text-gray-900">
    {t("wizard.bio.healthDisclosures")} <span className="text-gray-400">{t("wizard.bio.optional")}</span>
  </h3>

  <Listbox
    value={disclosures}
    multiple
    onChange={(values) => {
      // Prefer Not to Say must be exclusive
      if (values.includes("PNS")) {
        setFormData({ healthDisclosures: ["PNS"] })
        return
      }

      setFormData({ healthDisclosures: values })
    }}
  >
    <div className="relative">
      <ListboxButton className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-left text-sm text-gray-700 focus:ring-2 focus:ring-pink-500">
        <span className="block truncate">
          {disclosures.length === 0
            ? t("wizard.bio.selectIfShare")
            : disclosures.includes("PNS")
              ? t("wizard.bio.preferNotToSay")
              : disclosures
                  .map(disclosureLabel)
                  .filter(Boolean)
                  .join(", ")
          }
        </span>
      </ListboxButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <ListboxOptions className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {healthDisclosureOptions.map(opt => (
            <ListboxOption
              key={opt.value}
              value={opt.value}
              className={({ active, selected }) =>
                `
                  cursor-pointer px-4 py-3 text-sm
                  flex justify-between items-center
                  ${active ? "bg-pink-50" : ""}
                  ${selected ? "text-pink-600 font-medium" : "text-gray-700"}
                `
              }
            >
              {({ selected }) => (
                <>
                  <span>{opt.label}</span>
                  {selected && <span>✓</span>}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>

  {/* Selected pills (same UX as LanguagePicker) */}
  {disclosures.length > 0 && !disclosures.includes("PNS") && (
    <div className="flex flex-wrap gap-2 mt-2">
      {disclosures.map(value => {
        const label = disclosureLabel(value)
        if (!label) return null

        return (
          <span
            key={value}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700"
          >
            {label}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  healthDisclosures: disclosures.filter(v => v !== value)
                })
              }
              className="ml-1 text-pink-500 hover:text-pink-700"
              aria-label={t("wizard.bio.removeLabel", { label })}
            >
              ×
            </button>
          </span>
        )
      })}
    </div>
  )}

  <p className="text-xs text-gray-400">
    {t("wizard.bio.multiSelectHint")}
  </p>
</section>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={() => navigate("/complete/location")}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white hover:bg-gray-50 active:scale-95"
        >
          {t("wizard.back")}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isBioValid}
          className={`flex-1 py-3 px-6 ${
            !isBioValid
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-pink-600 active:scale-95"
          }`}
        >
          {t("wizard.next")}
        </Button>
      </div>
    </div>
  )
}
