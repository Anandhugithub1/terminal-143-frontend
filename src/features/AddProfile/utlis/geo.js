/**
 * Normalize frontend geoLocation into backend-friendly:
 * {
 *   geohash: "...",
 *   coordinates: { lat, lon },
 *   placeName: "...",
 *   countryCode: "TH"
 * }
 *
 * Accepts:
 *  - { type:'Point', coordinates:[lon,lat] }
 *  - { coordinates:{lat,lon} }
 *  - { lat, lon }
 *  - Optional placeName, countryCode, geohash
 *
 * NOTE:
 *   geohash is no longer generated client-side.
 *   It must already be provided by the backend or existing input.
 */
export function normalizeGeoForApi(input) {
  if (!input?.coordinates) return null

  const { lat, lon } = input.coordinates
  if (
    lat == null ||
    lon == null ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return null
  }

  return {
    coordinates: { lat: Number(lat), lon: Number(lon) },
    placeName: input.placeName || "",
    countryCode: (input.countryCode || "").toUpperCase().slice(0, 2),
    h3: {
      r4: input.h3?.r4 || ""
    }
  }
}




export const EMPTY_GEO = {
  type: "Point",
  coordinates: [],
  placeName: "",
  countryCode: "",
  geohash: "",
};

// small helpers used by LocationInput and SuggestionList
export const normalizeCountryCode = (value = "") =>
  value.toString().toUpperCase().slice(0, 2);

export const extractCoords = (item = {}) => {
  const raw = item._raw || item;
  const lon =
    Number(item.lon ?? raw.lon ?? (Array.isArray(raw.center) ? raw.center[0] : undefined)) || null;
  const lat =
    Number(item.lat ?? raw.lat ?? (Array.isArray(raw.center) ? raw.center[1] : undefined)) || null;
  return { lon: Number.isFinite(lon) ? lon : null, lat: Number.isFinite(lat) ? lat : null };
};

