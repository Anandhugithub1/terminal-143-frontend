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
  if (!input) return null;

  let lat = null;
  let lon = null;

  // 1) GeoJSON style { coordinates: [lon, lat] }
  if (Array.isArray(input.coordinates) && input.coordinates.length >= 2) {
    lon = Number(input.coordinates[0]);
    lat = Number(input.coordinates[1]);
  }

  // 2) coordinates object { coordinates:{lat,lon} }
  if ((lat == null || lon == null) && input.coordinates && typeof input.coordinates === "object") {
    if (input.coordinates.lat != null && input.coordinates.lon != null) {
      lat = Number(input.coordinates.lat);
      lon = Number(input.coordinates.lon);
    }
  }

  // 3) direct { lat, lon }
  if ((lat == null || lon == null) && input.lat != null && input.lon != null) {
    lat = Number(input.lat);
    lon = Number(input.lon);
  }

  // Fail if invalid
  if (
    lat == null ||
    lon == null ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return null;
  }

  // Use existing geohash only
  const geohash = input.geohash || "";
  if (!geohash) return null;

  const placeName = input.placeName || input.name || "";
  const countryCode = (input.countryCode || input.country || "")
    .toString()
    .toUpperCase()
    .slice(0, 2);

  return {
    geohash,
    coordinates: { lat, lon },
    placeName,
    countryCode,
  };
}
