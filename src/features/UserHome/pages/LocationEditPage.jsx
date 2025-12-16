// src/pages/LocationEditPage.jsx
import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import LocationInput from "../../AddProfile/components/LocationInput";
import { fetchProfile, updateProfile } from "../../UserProfile/";

const LocationEditPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.userProfile?.profile || null);

  const [selectedLoc, setSelectedLoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const initial = useMemo(() => profile?.geoLocation || null, [profile]);

  const handleSelect = useCallback((loc) => {
    setSelectedLoc(loc || null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedLoc) {
      toast.error("Please select a location from the list");
      return;
    }

    const geoLocation = {
      type: "Point",
      coordinates:
        typeof selectedLoc.lon === "number" &&
        typeof selectedLoc.lat === "number"
          ? [selectedLoc.lon, selectedLoc.lat]
          : [],
      placeName: selectedLoc.placeName || selectedLoc.name || "",
      countryCode: (selectedLoc.countryCode || selectedLoc.country || "")
        .toUpperCase()
        .slice(0, 2),
      geohash: selectedLoc.geohash || "",
    };

    try {
      setSaving(true);
      await dispatch(updateProfile({ geoLocation })).unwrap?.();
      toast.success("📍 Location updated successfully!");
      dispatch(fetchProfile());
      navigate(-1);
    } catch (err) {
      toast.error(err?.message || "Failed to update location");
    } finally {
      setSaving(false);
    }
  }, [dispatch, navigate, selectedLoc]);

  const preview = selectedLoc || initial;
  const hasChanges =
    selectedLoc && JSON.stringify(selectedLoc) !== JSON.stringify(initial);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Edit Location</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update where you're based
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Search Section */}
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
            <LocationInput
              formData={{ geoLocation: initial || {} }}
              setFormData={() => {}}
              onSelect={handleSelect}
              onSearchStart={() => setIsSearching(true)}
              onSearchEnd={() => setIsSearching(false)}
              t={(k) => k}
            />

            {/* Search Indicator */}
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Select your location from the dropdown suggestions for best
              accuracy
            </span>
          </div>
        </div>

        {/* Selected Location Preview */}
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
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
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
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-500 text-sm">No location selected yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Search above to find your location
              </p>
            </div>
          )}
        </div>

        {/* Action Tips */}
        <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <strong className="font-semibold">Pro tip:</strong> Include your
              neighborhood for the best match.
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Action Bar */}
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
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                "Save Location"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationEditPage;
