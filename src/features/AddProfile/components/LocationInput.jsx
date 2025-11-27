// src/components/LocationInput.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocationService } from "../Hooks/useLocationService";
import { toast } from "sonner";

const EMPTY_GEO = {
  type: "Point",
  coordinates: [],
  placeName: "",
  countryCode: "",
  geohash: "",
};

export default function LocationInput({
  formData,
  setFormData,
  t,
  onSelect: onSelectProp,
}) {
  const [query, setQuery] = useState(formData?.geoLocation?.placeName || "");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const typingTimeout = useRef(null);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);

  const {
    suggestions,
    loading,
    detecting,
    getCurrentLocation,
    searchLocations,
    clearSuggestions,
    getPlaceDetails,
  } = useLocationService();

  const locale = useMemo(() => (navigator?.language || "en").split("-")[0], []);

  // persist selection
  const setGeo = useCallback(
    (loc) =>
      setFormData((prev) => ({
        ...prev,
        geoLocation: !loc
          ? EMPTY_GEO
          : {
              type: "Point",
              coordinates:
                typeof loc.lon === "number" && typeof loc.lat === "number"
                  ? [loc.lon, loc.lat]
                  : [],
              placeName: loc.placeName || loc.name || loc.city || "",
              countryCode: (loc.countryCode || loc.country || "")
                .toString()
                .toUpperCase()
                .slice(0, 2),
              geohash: loc.geohash || loc.geoHash || "",
            },
      })),
    [setFormData]
  );

  // debounced search
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      setTouched(true);
      setOpen(true);

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(async () => {
        const trimmed = value.trim();
        if (!trimmed) {
          clearSuggestions();
          setGeo(null);
          setError("");
          return;
        }
        if (trimmed.length > 1) {
          try {
            await searchLocations(trimmed);
          } catch (err) {
            console.error("[LocationInput] searchLocations error:", err);
            setError(t("locationSearchFailed") || "Search failed");
          }
        } else {
          clearSuggestions();
          const msg = t("locationMinLength") || "Enter at least 2 characters";
          setError(msg);
          toast.info(msg);
        }
      }, 300);
    },
    [searchLocations, clearSuggestions, setGeo, t]
  );

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

  // fetch place details on select if available
  const onSelect = useCallback(
    async (item) => {
      if (!item) return;

      const placeId =
        item.placeId || item._raw?.placeId || item._raw?.place_id || item.id;
      let final = null;

      if (placeId && typeof getPlaceDetails === "function") {
        try {
          const details = await getPlaceDetails(placeId);
          if (details) {
            final = {
              lat: details.lat != null ? Number(details.lat) : null,
              lon: details.lng != null ? Number(details.lng) : null,
              placeName:
                details.placeName ||
                details.formattedAddress ||
                item.placeName ||
                item.name ||
                "",
              country: details.country || "",
              countryCode: details.countryCode || "",
              geohash: details.geohash || "",
            };
          }
        } catch (err) {
          // fall back to suggestion
          final = null;
        }
      }

      if (!final) {
        const raw = item._raw || item;
        final = {
          lat:
            item.lat ??
            raw.lat ??
            raw.geometry?.location?.lat ??
            (Array.isArray(raw.center) ? raw.center[1] : null) ??
            null,
          lon:
            item.lon ??
            raw.lon ??
            raw.geometry?.location?.lng ??
            (Array.isArray(raw.center) ? raw.center[0] : null) ??
            null,
          placeName:
            item.placeName ?? item.name ?? raw.placeName ?? raw.name ?? "",
          country:
            item.country ??
            item.countryName ??
            raw.country ??
            raw.country_code ??
            "",
          countryCode: (
            item.countryCode ||
            item.country ||
            raw.country ||
            raw.country_code ||
            ""
          )
            .toString()
            .toUpperCase()
            .slice(0, 2),
          geohash: item.geohash || item.geoHash || raw.geohash || "",
        };
      }

      if (typeof onSelectProp === "function") {
        onSelectProp(final);
      } else {
        setGeo(final);
      }

      // UI update
      setQuery(final.placeName || final.name || "");
      setOpen(false);
      setTouched(false);
      clearSuggestions();
      setActiveIndex(-1);
      toast.success(
        `${t("selected") || "Selected"}: ${final.placeName || final.name || ""}`
      );
    },
    [getPlaceDetails, setGeo, onSelectProp, clearSuggestions, t]
  );

  // outside click close
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        !listboxRef.current?.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleAutoDetect = useCallback(async () => {
    setError("");
    setTouched(true);
    try {
      const loc = await getCurrentLocation(locale);
      await onSelect(loc);
    } catch (err) {
      const msg = t(err?.message) || "Unable to detect location";
      setError(msg);
      toast.error(msg);
    }
  }, [getCurrentLocation, onSelect, t, locale]);

  const handleClear = useCallback(() => {
    setQuery("");
    setGeo(null);
    setError("");
    clearSuggestions();
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [setGeo, clearSuggestions]);

  const handleKeyDown = (e) => {
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) setOpen(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(suggestions.length || 1, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? Math.max(suggestions.length || 1, 1) - 1 : i - 1
      );
    } else if (e.key === "Enter" && open && suggestions[activeIndex]) {
      e.preventDefault();
      onSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // show list when suggestions arrive after user touched input
  useEffect(() => {
    if (touched && Array.isArray(suggestions) && suggestions.length > 0)
      setOpen(true);
    else if (touched) setOpen(false);
  }, [suggestions, touched]);

  const listboxId = "location-listbox";

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t("location")}
        <span className="text-gray-400 font-normal text-xs ml-1">
          {t("locationHelper") || "City or area where you live"}
        </span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setOpen(true);
              setTouched(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              t("typeOrSearchLocation") || "Search for your city or area..."
            }
            className={`w-full pl-11 pr-4 py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder-gray-400`}
            aria-controls={open ? listboxId : undefined}
            aria-expanded={open}
            role="combobox"
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0 && suggestions[activeIndex]
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
          />

          {loading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          )}

          {query && !loading && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
              aria-label={t("clear") || "Clear location"}
              type="button"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium`}
        >
          {detecting ? (
            <>
              <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              {t("detecting")}
            </>
          ) : (
            <>{t("useMyCurrentLocation")}</>
          )}
        </button>
      </div>

      {open && (suggestions?.length ?? 0) > 0 && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="absolute z-[99999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((item, idx) => (
            <button
              key={`${item.name ?? item.placeName ?? item.id ?? idx}-${idx}`}
              id={`${listboxId}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => onSelect(item)}
              className={`w-full text-left px-4 py-3 border-b last:border-b-0`}
              type="button"
            >
              <div className="font-medium text-gray-900">
                {item.name ??
                  item.placeName ??
                  item.label ??
                  item._raw?.placeName ??
                  item._raw?.name ??
                  item.id ??
                  "Unknown"}
              </div>
              {(item.country || item.countryName || item._raw?.country) && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.country || item.countryName || item._raw?.country}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
