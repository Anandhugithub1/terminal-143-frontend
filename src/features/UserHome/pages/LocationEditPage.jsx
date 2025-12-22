import React, { useCallback, useState, useMemo,useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { FiArrowLeft, FiMapPin, FiInfo, FiZap } from "react-icons/fi"
import { ImSpinner2 } from "react-icons/im"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { lazy, Suspense } from 'react';
const LocationInput = lazy(() =>
  import('../../AddProfile/components/LocationInput')
);
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile"
import { updateMyProfile } from "../../UserProfile/api/profile"

const LocationEditPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
const detailsPromiseRef = useRef(null)

  const { data: profile } = useMyProfile()

  const [selectedLoc, setSelectedLoc] = useState(null)
  const [saving, setSaving] = useState(false)

  const initial = useMemo(
    () => profile?.location || null,
    [profile]
  )

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
      toast.success("Location updated successfully")
      navigate(-1)
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update location")
    },
    onSettled: () => {
      setSaving(false)
    }
  })

  const handleSelect = useCallback((loc) => {
    setSelectedLoc(loc || null)
  }, [])

const handleSave = useCallback(async () => {
  if (!selectedLoc) {
    toast.error("Please select a location from the list")
    return
  }

  // 🔹 ENSURE details are resolved
  if (detailsPromiseRef.current) {
    try {
      await detailsPromiseRef.current
    } catch {}
  }

  const lat = selectedLoc.lat ?? selectedLoc.coordinates?.lat
  const lon = selectedLoc.lng ?? selectedLoc.coordinates?.lon

  const location = {
    coordinates: { lat, lon },
    placeName: selectedLoc.placeName || "",
    countryCode: (selectedLoc.countryCode || "").toUpperCase().slice(0, 2),
    h3: { r4: selectedLoc.h3Index || "" }
  }

  setSaving(true)
  mutation.mutate({ location })
}, [selectedLoc, mutation])



  const preview = selectedLoc || initial
  const hasChanges =
    selectedLoc && JSON.stringify(selectedLoc) !== JSON.stringify(initial)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Edit Location</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update where you're based
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Search for your location
            </h2>
            <p className="text-sm text-gray-600">
              Start typing your city, neighborhood, or area name
            </p>
          </div>

          <div className="relative">
         <Suspense fallback={null}>

          <LocationInput
  formData={{ location: initial || {} }}
  setFormData={() => {}}
  onSelect={(loc) => {
    setSelectedLoc(loc)
  }}
  t={(k) => k}
/>

         </Suspense>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Select your location from the dropdown suggestions for best
              accuracy
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Selected Location
            </h3>
            {hasChanges && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                Unsaved changes
              </span>
            )}
          </div>

          {preview ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-lg truncate">
                    {preview.placeName || preview.name}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No location selected yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Search above to find your location
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <FiZap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-primary">
              <strong className="font-semibold">Pro tip:</strong> Include your
              neighborhood for the best match.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!selectedLoc || saving || !hasChanges}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                selectedLoc && hasChanges && !saving
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <ImSpinner2 className="h-4 w-4 animate-spin" />
                  Saving
                </span>
              ) : (
                "Save Location"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationEditPage
