import React, { useState, useEffect } from "react"
import { ChevronLeft, User, UserPlus, Heart, Smile, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../shared/Button"
import "@fontsource-variable/inter"
import { useTranslation } from "react-i18next"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useMyProfile } from "../../features/UserProfile/Hooks/useMyProfile"
import { updateMyProfile } from "../../features/UserProfile/api/profile"

const MAX_PREFERENCES = 2

const PreferencesPage = () => {
  const { t } = useTranslation("settings")
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useMyProfile()

  const PREFERENCES = [
    { label: t("male"), value: "M", icon: <User size={20} /> },
    { label: t("female"), value: "F", icon: <UserPlus size={20} /> },
    { label: t("toFemale"), value: "TF", icon: <Heart size={20} /> },
    { label: t("toMale"), value: "TM", icon: <Smile size={20} /> },
    { label: t("others"), value: "Ot", icon: <Star size={20} /> }
  ]

  const [selectedPreferences, setSelectedPreferences] = useState([])
  const [initialPreferences, setInitialPreferences] = useState([])

  useEffect(() => {
    if (profile && Array.isArray(profile.preferences)) {
      setSelectedPreferences([...profile.preferences])
      setInitialPreferences([...profile.preferences])
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
      navigate(-1)
    },
    onError: (err) => {
      console.error("Failed to update preferences", err)
    }
  })

  const togglePreference = (value) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value)
      }

      if (prev.length >= MAX_PREFERENCES) {
        return prev
      }

      return [...prev, value]
    })
  }

  const handleSave = () => {
    if (!selectedPreferences.length) return
    mutation.mutate({ preferences: selectedPreferences })
  }

  const arraysEqualAsSets = (a = [], b = []) => {
    if (a.length !== b.length) return false
    const setB = new Set(b)
    return a.every((x) => setB.has(x))
  }

  const hasChanged = !arraysEqualAsSets(
    selectedPreferences,
    initialPreferences
  )

  const isBusy = isLoading || mutation.isLoading

  return (
    <div className="min-h-screen bg-white font-inter flex flex-col justify-between">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-gray-500 text-sm font-normal"
        >
          <ChevronLeft size={22} />
          <span className="mr-1 text-lg font-bold">Back</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-5">
        <h2 className="text-gray-900 text-xl font-bold mb-1">
          Choose Your Gender Preferences
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Select up to {MAX_PREFERENCES} preferences
          <span className="ml-2 text-pink-500 font-medium">
            ({selectedPreferences.length}/{MAX_PREFERENCES})
          </span>
        </p>

        <div className="space-y-3">
          {PREFERENCES.map(({ label, value, icon }) => {
            const isSelected = selectedPreferences.includes(value)
            const isDisabled =
              !isSelected &&
              selectedPreferences.length >= MAX_PREFERENCES

            return (
              <button
                key={value}
                onClick={() => togglePreference(value)}
                disabled={isBusy || isDisabled}
                className={`w-full flex justify-between items-center px-4 py-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-pink-50 border-pink-400"
                    : isDisabled
                    ? "bg-gray-100 border-gray-200 opacity-60"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`${
                      isSelected
                        ? "text-pink-600"
                        : "text-gray-600"
                    }`}
                  >
                    {icon}
                  </span>

                  <span
                    className={`text-base font-medium ${
                      isSelected
                        ? "text-pink-600"
                        : "text-gray-800"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-pink-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Save Button */}
      {hasChanged && (
        <div className="px-5 pb-6 transition-all duration-300">
          <Button
            onClick={handleSave}
            disabled={isBusy}
            className="w-full rounded-2xl py-3 text-base font-semibold bg-pink-500 text-white hover:bg-pink-600 transition-all duration-200"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  )
}

export default PreferencesPage
