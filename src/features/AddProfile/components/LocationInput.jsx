// src/components/LocationInput.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption
} from "@headlessui/react";

import { useLocationService } from "../Hooks/useLocationService";
import { HiOutlineSearch, HiX, HiLocationMarker } from "react-icons/hi";
import Spinner from "../components/Location/Spinner";
import IconButton from "./Location/IconButton";
import { EMPTY_GEO, normalizeCountryCode, extractCoords } from "../utlis/geo";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next'


const LISTBOX_ID = "location-listbox";

/**
 * HeadlessUI-based LocationInput
 * - Uses Combobox to handle keyboard navigation / ARIA
 * - Keeps debounced search, auto-detect, place-details fallback
 */
export default function LocationInput({
  formData,
  setFormData,
  t,
  onSelect: onSelectProp,
}) {
  const [query, setQuery] = useState(formData?.location?.placeName || "")
  const { s } = useTranslation('location')

  const [selected, setSelected] = useState(null); // selected suggestion object
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
const detailsPromiseRef = useRef(null)
const lastPlaceIdRef = useRef(null)

  const timer = useRef(null);
  const inputRef = useRef(null);

  const {
    suggestions = [],
    loading,
    detecting,
    getCurrentLocation,
    searchLocations,
    clearSuggestions,
    getPlaceDetails,
  } = useLocationService();

  const locale = useMemo(
    () =>
      typeof navigator !== "undefined"
        ? (navigator.language || "en").split("-")[0]
        : "en",
    []
  );

  // helper to set geo into parent
 const setGeo = useCallback(
  (loc) => {
    if (!loc) {
      setFormData((p) => ({ ...p, location: null }))
      return
    }

    setFormData((p) => ({
      ...p,
      location: {
        coordinates: {
          lat: loc.lat,
          lon: loc.lon
        },
        placeName: loc.placeName || loc.name || "",
        countryCode: normalizeCountryCode(
          loc.countryCode || loc.country || ""
        ),
        h3: {
          r4: loc.h3 || loc.h3Index || ""
        }
      }
    }))
  },
  [setFormData]
)


  // debounced search
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      setTouched(true);
      setError("");
      clearTimeout(timer.current);

      const q = (value || "").trim();
      if (!q) {
        clearSuggestions();
        setGeo(null);
        return;
      }
      if (q.length < 2) {
        setError(t?.("locationMinLength") || "Enter at least 2 characters");
        clearSuggestions();
        return;
      }

      timer.current = setTimeout(async () => {
        try {
          await searchLocations(q);
        } catch (err) {
          console.error("[LocationInput] searchLocations:", err);
          const msg =
            s?.("locationSearchFailed") || "Search failed, please try again";
          setError(msg);
          toast.error(msg);
        }
      }, 250);
    },
    [searchLocations, clearSuggestions, setGeo, t]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  // unified onSelect (used by Combobox onChange)
const handleSelect = useCallback(
  (item) => {
    if (!item) return

    const raw = item._raw || item
    const { lat, lon } = extractCoords(item)

    const immediate = {
      lat,
      lon,
      placeName:
        item.placeName ?? item.name ?? raw.placeName ?? raw.name ?? "",
      country:
        item.country ?? item.countryName ?? raw.country ?? "",
      countryCode: normalizeCountryCode(
        item.countryCode ||
          item.country ||
          raw.country ||
          raw.country_code ||
          ""
      ),
      h3Index: ""
    }

    //  PHASE 1: instant UI update
    if (typeof onSelectProp === "function") {
      onSelectProp(immediate)
    } else {
      setGeo(immediate)
    }

    setSelected(item)
    setQuery(immediate.placeName)
    clearSuggestions()
    setTouched(false)

    //  PHASE 2: background place details fetch
    const placeId =
      item.placeId || raw.placeId || raw.place_id || item.id

    if (placeId && placeId !== lastPlaceIdRef.current) {
      lastPlaceIdRef.current = placeId

      detailsPromiseRef.current = (async () => {
        try {
          const details = await getPlaceDetails(placeId)
          if (!details) return

          const enriched = {
            lat: details.lat != null ? Number(details.lat) : immediate.lat,
            lon: details.lng != null ? Number(details.lng) : immediate.lon,
            placeName:
              details.placeName ||
              details.formattedAddress ||
              immediate.placeName,
            countryCode: normalizeCountryCode(
              details.countryCode || immediate.countryCode
            ),
            h3Index: details.h3Index || ""
          }

          if (typeof onSelectProp === "function") {
            onSelectProp(enriched)
          } else {
            setGeo(enriched)
          }
        } catch (err) {
          console.warn("getPlaceDetails failed", err)
        }
      })()
    }
  },
  [getPlaceDetails, onSelectProp, setGeo, clearSuggestions]
)


  // auto-detect
  const handleAutoDetect = useCallback(async () => {
    setError("");
    setTouched(true);
    try {
      const loc = await getCurrentLocation(locale);
      if (!loc) throw new Error("No location data received");
      // if getCurrentLocation returns a suggestion-like object, reuse handleSelect
      await handleSelect(loc);
    } catch (err) {
      console.error("[LocationInput] Auto-detect:", err);
      const msg =
        s?.(err?.message) ||
        s?.("locationDetectionFailed") ||
        "Unable to detect your location";
      setError(msg);
      toast.error(msg);
    }
  }, [getCurrentLocation, locale, handleSelect, t]);

  // clear
  const handleClear = useCallback(() => {
    setQuery("");
    setSelected(null);
    setGeo(null);
    setError("");
    clearSuggestions();
    inputRef.current?.focus();
  }, [setGeo, clearSuggestions]);

  // display function for Combobox input when an object is selected
  const displayValue = (item) => {
    if (!item) return query;
    return (
      item.placeName ??
      item.name ??
      item.label ??
      item._raw?.placeName ??
      item._raw?.name ??
      query
    );
  };

  return (
    <div className="relative space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {s?.("location") || "Location"}
        <span className="text-gray-400 font-normal text-xs ml-1">
          {s?.("locationHelper") || "City or area where you live"}
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <Combobox
          value={selected}
          onChange={(val) => handleSelect(val)}
          as="div"
          className="relative flex-1 min-w-0"
        >
          <div className="relative">
            {/* icon */}
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />

            <ComboboxInput
              ref={inputRef}
              className="w-full pl-11 pr-20 py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder-gray-400 text-base"
              displayValue={displayValue}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (suggestions?.length > 0) {
                  // open is implicit in headlessui Combobox when options exist
                }
                setTouched(true);
              }}
              placeholder={
                s?.("typeOrSearchLocation") || "Search for your city or area..."
              }
              aria-describedby={error ? "location-error" : undefined}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {loading ? (
                <div className="h-5 w-5">
                  <Spinner size={16} />
                </div>
              ) : (
                query && (
                  <IconButton
                    onClick={handleClear}
                    ariaLabel={s?.("clear") || "Clear location"}
                  >
                    <HiX className="w-4 h-4 text-gray-500" />
                  </IconButton>
                )
              )}
            </div>
          </div>

          {/* Options rendered by Headless UI */}
          <ComboboxOptions
            static
            id={LISTBOX_ID}
            className={`absolute z-[99999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto ${
              suggestions?.length ? "" : "hidden"
            }`}
            style={{ top: "100%" }}
          >
            {suggestions.map((item, idx) => {
              const label =
                item.placeName ??
                item.name ??
                item.label ??
                item._raw?.placeName ??
                item._raw?.name ??
                item.id ??
                "Unknown";
              const country =
                item.country ?? item.countryName ?? item._raw?.country;
              return (
                <ComboboxOption
                  key={`${label}-${idx}-${item.id || ""}`}
                  value={item}
                  as="div"
                  className={({ active }) =>
                    `w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors duration-150 ${
                      active
                        ? "bg-pink-50 border-pink-100"
                        : "bg-white hover:bg-gray-50 border-gray-100"
                    }`
                  }
                >
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {label}
                  </div>
                  {country && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {country}
                    </div>
                  )}
                </ComboboxOption>
              );
            })}
          </ComboboxOptions>
        </Combobox>

        {/* Auto-detect button */}
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border text-sm font-medium transition duration-200 min-w-[180px] ${
            detecting
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          {detecting ? (
            <>
              <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="whitespace-nowrap">
                {s?.("detecting") || "Detecting..."}
              </span>
            </>
          ) : (
            <>
              <HiLocationMarker className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {s?.("useMyCurrentLocation") || "Use My Location"}
              </span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          id="location-error"
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <HiLocationMarker className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      {/* Empty state when open but no suggestions */}
      {touched && !loading && suggestions?.length === 0 && query.length > 1 && (
        <div
          className="absolute z-[99999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center"
          style={{ top: "100%" }}
        >
          <div className="text-gray-400 mb-2">
            <svg
              className="w-8 h-8 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">
            {s?.("noResults") || "No locations found"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {s?.("tryDifferentSearch") ||
              "Try searching for a different city or area"}
          </p>
        </div>
      )}
    </div>
  );
}
