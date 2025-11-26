// Hooks/useLocationService.js
import { useState } from 'react';
import ngeohash from 'ngeohash';
import { locationAPi } from '../../../api/clients';

export const useLocationService = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = (navigator.language?.split('-')[0]) || 'en';

  // Build a location object that matches User.location in backend
  const buildLocationObject = (lat, lon, address = {}) => ({
    type: 'Point',
    coordinates: [lon, lat], // GeoJSON [lon, lat]
    placeName:
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      address.municipality ||
      address.locality ||
      address.name ||
      '',
    // countryCode should be ISO alpha-2 if available
    countryCode: (address.country_code || address.country || '').toString().toUpperCase(),
    geohash: (lat != null && lon != null) ? ngeohash.encode(lat, lon, 7) : '',
  });

  /** Get current location (reverse geocode via backend) */
  const getCurrentLocation = async () => {
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

      // Call backend reverse geocode
      const res = await locationAPi.post(
        '/reverse-geocode',
        { lat: latitude, lng: longitude },
        { withCredentials: true }
      );

      const data = res?.data || {};

      // Normalize backend response to an address object
      const address = {
        city: data.placeName || '',
        country: data.country || '',
        country_code: data.countryCode || data.country_code || '',
        name: data.placeName || '',
      };

      return buildLocationObject(latitude, longitude, address);
    } catch (error) {
      console.error('Location error:', error);

      let message = 'geoError';
      if (error?.code === 1) message = 'locationPermissionDenied';
      else if (error?.code === 2) message = 'locationUnavailable';
      else if (error?.code === 3) message = 'locationTimeout';
      else if (error?.message === 'geolocationNotSupported') message = 'geoNotSupported';
      else if (error?.response?.data?.code === 'OUT_OF_REGION') message = 'locationOutOfRegion';

      throw new Error(message);
    } finally {
      setDetecting(false);
    }
  };

  /** Autocomplete/search (calls backend autocomplete) */
  const searchLocations = async (query) => {
    setLoading(true);
    try {
      const trimmed = (query || '').trim();
      if (!trimmed || trimmed.length < 2) {
        setSuggestions([]);
        return;
      }

      const res = await locationAPi.get('/autocomplete', {
        params: { input: trimmed },
        withCredentials: true,
      });

      const predictions = res?.data?.predictions || [];

      // Normalize: include placeId for details fetch
      const results = predictions.map((p) => ({
        name: p.placeName,
        countryName: p.countryName || p.country || '',
        placeId: p.placeId,
      }));

      setSuggestions(results);
    } catch (err) {
      console.error('Search error (location API failed):', err);
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
