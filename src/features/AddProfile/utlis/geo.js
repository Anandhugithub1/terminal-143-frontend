// src/utils/geo.js
/**
 * Convert frontend geoLocation (GeoJSON-like) into backend `location` payload.
 *
 * Frontend geoLocation shape expected:
 * {
 *   type: 'Point',
 *   coordinates: [lon, lat],
 *   placeName: 'Bangkok',
 *   countryCode: 'TH',
 *   geohash: 'afeg2...'
 * }
 *
 * Backend `location` shape expected:
 * {
 *   geohash: 'afeg2...',
 *   coordinates: { lat: 13.7, lon: 100.5 },
 *   placeName: 'Bangkok',
 *   countryCode: 'TH'
 * }
 *
 * Returns null if geoLocation is missing/invalid (caller should omit the field).
 */
export function normalizeGeoForApi(geoLocation) {
  if (!geoLocation || !Array.isArray(geoLocation.coordinates) || geoLocation.coordinates.length < 2) {
    return null;
  }

  const lon = geoLocation.coordinates[0];
  const lat = geoLocation.coordinates[1];

  if (lat == null || lon == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
    return null;
  }

  const result = {
    geohash: geoLocation.geohash || '',
    coordinates: {
      lat: Number(lat),
      lon: Number(lon),
    },
    placeName: geoLocation.placeName || geoLocation.name || '',
    countryCode: (geoLocation.countryCode || '').toString().toUpperCase(),
  };

  // If geohash is missing but lat/lon present we could compute one here using ngeohash,
  // but prefer server-side generation for canonicalization.
  return result;
}
