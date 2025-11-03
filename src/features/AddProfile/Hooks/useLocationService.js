import { useState } from 'react';
import ngeohash from 'ngeohash';

export const useLocationService = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = navigator.language.split('-')[0] || 'en'; // Detect browser language

  // Get current location with reverse geocoding
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

    const res = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${lang}`
);
      const data = await res.json();

      const address = data.address || {};
      const place =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state_district ||
        address.state ||
        'Unknown';

      return { place, geohash: ngeohash.encode(latitude, longitude, 7) };
    } catch (error) {
      console.error('Location error:', error);

      let message = 'geoError';
      if (error.code === 1) message = 'locationPermissionDenied';
      else if (error.code === 2) message = 'locationUnavailable';
      else if (error.code === 3) message = 'locationTimeout';
      else if (error.message === 'geolocationNotSupported') message = 'geoNotSupported';

      throw new Error(message);
    } finally {
      setDetecting(false);
    }
  };

  // Search locations with user language
  const searchLocations = async (query, lang = userLang) => {
  setLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&accept-language=${lang}`
    );
    const data = await res.json();

    const simplified = data.map((item) => {
      const addr = item.address || {};
      const shortName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        item.display_name.split(',')[0]; // <-- this will be in the requested language

      return {
        name: shortName,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });

    setSuggestions(simplified);
  } catch (err) {
    console.error('Search error:', err);
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
