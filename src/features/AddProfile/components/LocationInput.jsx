import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";

import { useLocationService } from "../Hooks/useLocationService";
import { HiOutlineSearch, HiX, HiLocationMarker } from "react-icons/hi";
import Spinner from "../components/Location/Spinner";
import IconButton from "./Location/IconButton";
import { normalizeCountryCode, extractCoords } from "../utlis/geo";
import { useTranslation } from "react-i18next";

const LISTBOX_ID = "location-listbox";

export default function LocationInput({ formData, onSelect }) {
  const { t } = useTranslation("location");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const {
    suggestions = [],
    loading,
    detecting,
    searchLocations,
    clearSuggestions,
    getCurrentLocation,
    getPlaceDetails,
  } = useLocationService();

  const locale = useMemo(() => {
    if (typeof navigator === "undefined") return "en";
    return (navigator.language || "en").split("-")[0];
  }, []);

  /* ---------------- sync initial value ---------------- */

  useEffect(() => {
    const loc = formData?.location;
    if (loc?.coordinates?.lat != null && loc?.coordinates?.lon != null) {
      setQuery(loc.placeName || "");
      setSelected({ placeName: loc.placeName });
    }
  }, [formData?.location]);

  /* ---------------- search ---------------- */

  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      setTouched(true);
      setError("");

      clearTimeout(debounceRef.current);

      const q = value.trim();

      if (!q) {
        clearSuggestions();
        onSelect?.(null);
        return;
      }

      if (q.length < 2) {
        setError(t("locationMinLength") || "Enter at least 2 characters");
        clearSuggestions();
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          await searchLocations(q);
        } catch (err) {
          setError(
            err?.message || t("locationSearchFailed") || "Search failed"
          );
        }
      }, 250);
    },
    [searchLocations, clearSuggestions, onSelect, t]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  /* ---------------- select ---------------- */

  const handleSelect = useCallback(
    (item) => {
      if (!item) return;

      const raw = item._raw || item;
      const { lat, lon } = extractCoords(item);
      const requestId = ++requestIdRef.current;

      const base = {
        lat,
        lon,
        placeName: item.placeName ?? item.name ?? raw.placeName ?? "",
        countryCode: normalizeCountryCode(raw.countryCode || raw.country || ""),
        admin1: raw.admin1 || null,
        h3Index: "",
      };

      // emit base immediately
      onSelect?.(base, null);

      setSelected(item);
      setQuery(base.placeName);
      clearSuggestions();

      const placeId = item.placeId || raw.placeId;
      if (!placeId) return;

      // cancellation safe details promise
      const detailsPromise = (async () => {
        try {
          const details = await getPlaceDetails(placeId);
          if (!details) return null;

          // ignore stale results
          if (requestId !== requestIdRef.current) return null;

          const enriched = {
            lat: details.lat,
            lon: details.lng,
            placeName: details.placeName,
            countryCode: normalizeCountryCode(details.countryCode),
            admin1: details.admin1 || null,
            h3Index: details.h3Index,
          };

          onSelect?.(enriched);
          return enriched;
        } catch (err) {
          if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
            return null;
          }
          throw err;
        }
      })();

      // pass safe promise upward
      onSelect?.(base, detailsPromise);
    },
    [getPlaceDetails, onSelect, clearSuggestions]
  );

  /* ---------------- auto detect ---------------- */

const handleAutoDetect = useCallback(async () => {
  setError("")
  setTouched(true)

  try {
    const loc = await getCurrentLocation(locale)
    if (!loc) throw new Error("No location detected")

    const finalLoc = {
      lat: loc.coordinates.lat,
      lon: loc.coordinates.lon,
      placeName: loc.placeName,
      countryCode: loc.countryCode,
      admin1: loc.admin1,
      h3Index: loc.h3?.r4 || "",
    }

    // emit FINAL resolved location
    onSelect?.(finalLoc, null)

    setSelected({ placeName: finalLoc.placeName })
    setQuery(finalLoc.placeName)
    clearSuggestions()
  } catch (err) {
    if (err?.code === "OUT_OF_REGION") {
      setError(t("locationOutOfRegion") || "This location is not supported")
      onSelect?.(null)
      return
    }

    setError(
      t("locationDetectionFailed") || "Unable to detect your location"
    )
  }
}, [getCurrentLocation, locale, onSelect, clearSuggestions, t])


  /* ---------------- clear ---------------- */

  const handleClear = useCallback(() => {
    setQuery("");
    setSelected(null);
    setError("");
    clearSuggestions();
    onSelect?.(null);
    inputRef.current?.focus();
  }, [onSelect, clearSuggestions]);

  const displayValue = (item) => item?.placeName ?? query;

  /* ---------------- render ---------------- */

  return (
    <div className="relative space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {t("location") || "Location"}
        <span className="text-xs text-gray-400 ml-1">
          {t("locationHelper") || "City or area where you live"}
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <Combobox
          as="div"
          value={selected}
          onChange={handleSelect}
          className="relative flex-1"
        >
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <ComboboxInput
              ref={inputRef}
              className="w-full pl-11 pr-16 py-4 rounded-xl bg-gray-50
  border border-gray-300
  focus:outline-none
  focus:border-transparent
  focus:ring-2 focus:ring-pink-500"
              displayValue={displayValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("typeOrSearchLocation") || "Search location"}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <Spinner size={16} />
              ) : (
                query && (
                  <IconButton onClick={handleClear}>
                    <HiX className="w-4 h-4" />
                  </IconButton>
                )
              )}
            </div>
          </div>

          <ComboboxOptions
            id={LISTBOX_ID}
            className={`absolute z-50 w-full mt-2 bg-white rounded-xl shadow border max-h-72 overflow-y-auto ${
              suggestions.length ? "" : "hidden"
            }`}
          >
            {suggestions.map((item, idx) => (
              <ComboboxOption
                key={idx}
                value={item}
                className={({ active }) =>
                  `px-4 py-3 cursor-pointer ${active ? "bg-pink-50" : ""}`
                }
              >
                <div className="font-medium text-sm">
                  {item.placeName || item.name}
                </div>
                {item.country && (
                  <div className="text-xs text-gray-500">{item.country}</div>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>

        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="px-4 py-4 rounded-xl border text-sm font-medium"
        >
          {detecting ? (
            "Detecting..."
          ) : (
            <>
              <HiLocationMarker className="inline mr-1" />
              {t("useMyCurrentLocation") || "Use My Location"}
            </>
          )}
        </button>
      </div>
{formData?.location?.placeName && !error && (
  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <p className="text-xs text-gray-500">
      Selected location
    </p>

    <div className="flex items-center justify-between mt-1">
      <p className="text-sm font-medium text-gray-900">
        {formData.location.placeName}
      </p>

      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-pink-600 hover:underline"
      >
        Clear
      </button>
    </div>
  </div>
)}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
