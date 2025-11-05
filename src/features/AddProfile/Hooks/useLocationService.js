import { useState } from 'react';
import ngeohash from 'ngeohash';

const TIMEOUT_MS = 8000;

/** Abortable fetch with timeout + JSON parsing */
async function fetchJSON(url, opts = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, headers: {
      // Be a good citizen to public services
      'Accept': 'application/json',
      ...(opts.headers || {}),
    }});
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

/** Sequentially try providers until one returns a result */
async function tryProviders(providers) {
  let lastErr;
  for (const fn of providers) {
    try {
      const out = await fn();
      if (out) return out;
    } catch (e) {
      lastErr = e;
      // continue to next
    }
  }
  throw lastErr || new Error('allProvidersFailed');
}

export const useLocationService = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = (navigator.language?.split('-')[0]) || 'en'; // Detect browser language

  //  Utility to build structured location object (no lastUpdated)
  const buildLocationObject = (lat, lon, address = {}) => ({
    type: 'Point',
    coordinates: [lon, lat], // GeoJSON format [longitude, latitude]
    city:
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      address.municipality ||
      address.locality ||
      address.name ||
      '',
    state: address.state || address.state_district || address.region || address.admin1 || '',
    country: address.country || address.country_code || address.country_name || '',
    geoHash: ngeohash.encode(lat, lon, 7),
  });

  /** -------------------------
   *  REVERSE GEOCODING PROVIDERS
   *  ------------------------- */

  // 1) Nominatim (primary)
  const reverseNominatim = async (lat, lon, lang) => {
    const data = await fetchJSON(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`
    );
    const address = data.address || {};
    return buildLocationObject(lat, lon, address);
  };

  // 2) Open-Meteo (fallback #2 for reverse)
  const reverseOpenMeteo = async (lat, lon, lang) => {
    const data = await fetchJSON(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=${lang}&count=1`
    );
    const r = data?.results?.[0];
    if (!r) throw new Error('openmeteo_no_result');
    const address = {
      city: r.city || r.name || '',
      state: r.admin1 || r.admin2 || '',
      country: r.country || '',
      name: r.name,
    };
    return buildLocationObject(lat, lon, address);
  };

  // 3) Maps.co (fallback #3 for reverse)
  const reverseMapsCo = async (lat, lon, lang) => {
    const data = await fetchJSON(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&accept-language=${lang}`
    );
    const address = data.address || {};
    return buildLocationObject(lat, lon, address);
  };

  // Extra safety: Nominatim FR mirror
  const reverseNominatimFR = async (lat, lon, lang) => {
    const data = await fetchJSON(
      `https://nominatim.openstreetmap.fr/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`
    );
    const address = data.address || {};
    return buildLocationObject(lat, lon, address);
  };

  /** -------------------------
   *  FORWARD GEOCODING PROVIDERS (SEARCH)
   *  ------------------------- */

  // Helper to normalize Nominatim-like search results
  const formatNominatimResults = (data) =>
    (data || []).map((item) => {
      const addr = item.address || {};
      const shortName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        (item.display_name ? item.display_name.split(',')[0] : '');
      const location = buildLocationObject(parseFloat(item.lat), parseFloat(item.lon), addr);
      return { name: shortName, ...location };
    });

  // 1) Nominatim (primary)
  const searchNominatim = async (query, lang) => {
    const data = await fetchJSON(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&accept-language=${lang}`
    );
    return formatNominatimResults(data);
  };

  // 2) Photon (Komoot) — search only (fallback #1 for search)
  const searchPhoton = async (query, lang) => {
    const data = await fetchJSON(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=${lang}`
    );
    const feats = data?.features || [];
    const results = feats.map((f) => {
      const p = f.properties || {};
      const [lon, lat] = f.geometry?.coordinates || [];
      const addr = {
        city: p.city || p.town || p.village || p.name,
        county: p.county,
        state: p.state,
        country: p.country,
        name: p.name,
      };
      return {
        name: addr.city || addr.name || '',
        ...buildLocationObject(lat, lon, addr),
      };
    });
    if (!results.length) throw new Error('photon_no_results');
    return results;
  };

  // 3) Open-Meteo (fallback #2 for search)
  const searchOpenMeteo = async (query, lang) => {
    const data = await fetchJSON(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=5&language=${lang}`
    );
    const results = (data?.results || []).map((r) => {
      const addr = {
        city: r.city || r.name,
        state: r.admin1 || r.admin2,
        country: r.country,
        name: r.name,
      };
      return {
        name: addr.city || addr.name || '',
        ...buildLocationObject(r.latitude, r.longitude, addr),
      };
    });
    if (!results.length) throw new Error('openmeteo_no_results');
    return results;
  };

  // 4) Maps.co (fallback #3 for search)
  const searchMapsCo = async (query, lang) => {
    const data = await fetchJSON(
      `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&accept-language=${lang}`
    );
    const results = (data || []).map((item) => {
      const addr = item.address || {};
      const shortName =
        addr.city ||  
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        (item.display_name ? item.display_name.split(',')[0] : '');
      return {
        name: shortName,
        ...buildLocationObject(parseFloat(item.lat), parseFloat(item.lon), addr),
      };
    });
    if (!results.length) throw new Error('mapsco_no_results');
    return results;
  };

  //  Get current location with reverse geocoding + fallbacks
  const getCurrentLocation = async (lang = userLang) => {
    setDetecting(true);
    try {
      if (!navigator.geolocation) throw new Error('geolocationNotSupported');

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );

      const { latitude, longitude } = position.coords;

      // Try: Nominatim → Open-Meteo → Maps.co → Nominatim FR (mirror)
      return await tryProviders([
        () => reverseNominatim(latitude, longitude, lang),
        () => reverseOpenMeteo(latitude, longitude, lang),
        () => reverseMapsCo(latitude, longitude, lang),
        () => reverseNominatimFR(latitude, longitude, lang),
      ]);
    } catch (error) {
      console.error('Location error:', error);

      let message = 'geoError';
      if (error?.code === 1) message = 'locationPermissionDenied';
      else if (error?.code === 2) message = 'locationUnavailable';
      else if (error?.code === 3) message = 'locationTimeout';
      else if (error?.message === 'geolocationNotSupported') message = 'geoNotSupported';

      throw new Error(message);
    } finally {
      setDetecting(false);
    }
  };

  //  Search locations with fallbacks
  const searchLocations = async (query, lang = userLang) => {
    setLoading(true);
    try {
      // Try: Nominatim → Photon → Open-Meteo → Maps.co
      const results = await tryProviders([
        () => searchNominatim(query, lang),
        () => searchPhoton(query, lang),
        () => searchOpenMeteo(query, lang),
        () => searchMapsCo(query, lang),
      ]);
      setSuggestions(results);
    } catch (err) {
      console.error('Search error (all providers failed):', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => setSuggestions([]);

  return {
    suggestions,
    loading,
    detecting,
    getCurrentLocation,
    searchLocations,
    clearSuggestions,
  };
};
