import { useState, useCallback } from "react";

export const EMPTY_LOCATION = {
  coordinates: { lat: null, lon: null },
  placeName: "",
  countryCode: "",
  admin1: "",
  h3: { r4: "" },
};

/**
 * Manages the location field used in post/circle creation forms.
 * Handles optimistic set-then-enrich pattern from LocationInput's detailsPromise.
 */
export function useLocationState(initial = EMPTY_LOCATION) {
  const [location, setLocation] = useState(initial);
  const [isEnrichingLocation, setIsEnrichingLocation] = useState(false);

  const handleLocationSelect = useCallback((loc, detailsPromise) => {
    if (!loc) {
      setIsEnrichingLocation(false);
      setLocation(EMPTY_LOCATION);
      return;
    }

    setLocation({
      coordinates: { lat: loc.lat, lon: loc.lon },
      placeName: loc.placeName,
      countryCode: loc.countryCode,
      admin1: loc.admin1,
      h3: { r4: loc.h3Index || "" },
    });

    if (detailsPromise) {
      setIsEnrichingLocation(true);
      detailsPromise
        .then((enriched) => {
          if (!enriched) return;
          setLocation({
            coordinates: { lat: enriched.lat, lon: enriched.lon },
            placeName: enriched.placeName,
            countryCode: enriched.countryCode,
            admin1: enriched.admin1,
            h3: { r4: enriched.h3Index || "" },
          });
        })
        .finally(() => setIsEnrichingLocation(false));
    }
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(EMPTY_LOCATION);
    setIsEnrichingLocation(false);
  }, []);

  return { location, setLocation, isEnrichingLocation, handleLocationSelect, resetLocation };
}
