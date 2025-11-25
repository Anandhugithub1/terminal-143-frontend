import { useState } from 'react';
import ngeohash from 'ngeohash';
import { locationAPi } from '../../../api/clients';

export const useLocationService = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = (navigator.language?.split('-')[0]) || 'en'; 

  // Utility to build structured location object (no lastUpdated)
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
   *  CURRENT LOCATION (reverse geocode via own API)
   *  ------------------------- */

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

      // Call your backend reverse geocode
      const res = await locationAPi.post('/reverse-geocode', {
        lat: latitude,
        lng: longitude,
      },{

        withCredentials:true
      }
    
    );

      const data = res?.data || {};

      // Backend returns: { lat, lng, placeName, country, formattedAddress, types, geohash }
      const address = {
        city: data.placeName || '',
        country: data.country || '',
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

  /** -------------------------
   *  SEARCH / AUTOCOMPLETE (via own API)
   *  ------------------------- */

  const searchLocations = async (query) => {
    setLoading(true);
    try {
      const trimmed = (query || '').trim();
      if (!trimmed || trimmed.length < 2) {
        setSuggestions([]);
        return;
      }

      // GET /autocomplete?input=<query>
      const res = await locationAPi.get('/autocomplete', {
        params: { input: trimmed },
              withCredentials: true,   

      });

      const predictions = res?.data?.predictions || [];

      // Normalize for UI: simple list with name, country, placeId
      const results = predictions.map((p) => ({
        name: p.placeName,
        country: p.countryName,
        placeId: p.placeId,
        // coordinates will come from /place-details when user selects one
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
