// src/Hooks/useLocationService.js
import { useState, useRef, useCallback, useEffect } from 'react';
import ngeohash from 'ngeohash';
import { useMutation } from '@tanstack/react-query';
import { locationAPi } from '../../../api/clients';

export const useLocationService = ({ debounceMs = 300 } = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = (navigator?.language?.split('-')[0]) || 'en';

  const debounceTimerRef = useRef(null);
  const activeSearchAbortRef = useRef(null);

  const buildLocationObject = (lat, lon, address = {}) => ({
    type: 'Point',
    coordinates: [lon, lat],
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
    countryCode: (address.country_code || address.country || '').toString().toUpperCase().slice(0, 2),
    geohash: (lat != null && lon != null) ? ngeohash.encode(lat, lon, 7) : '',
  });

  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({ lat, lng }) => {
      const res = await locationAPi.post(
        '/reverse-geocode',
        { lat, lng },
        {
          withCredentials: true,
          headers: { 'Accept-Language': userLang },
        }
      );
      return res?.data || {};
    },
    retry: 1,
    useErrorBoundary: false,
  });

  const autocompleteMutation = useMutation({
    mutationFn: async ({ input, signal }) => {
      const res = await locationAPi.get('/autocomplete', {
        params: { input },
        withCredentials: true,
        signal,
        headers: { 'Accept-Language': userLang },
      });
      return res?.data || {};
    },
    retry: 0,
    useErrorBoundary: false,
  });

  // NEW: place details fetch (calls your backend GET /place-details?placeId=...)
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!placeId) return null;
    try {
      const res = await locationAPi.get('/place-details', {
        params: { placeId },
        withCredentials: true,
        headers: { 'Accept-Language': userLang },
      });
      return res?.data || null;
    } catch (err) {
      console.warn('getPlaceDetails failed', err);
      return null;
    }
  }, [userLang]);

  const getCurrentLocation = useCallback(async () => {
    setDetecting(true);
    try {
      if (!navigator?.geolocation) throw new Error('geolocationNotSupported');

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );

      const { latitude, longitude } = position.coords;
      const data = await reverseGeocodeMutation.mutateAsync({ lat: latitude, lng: longitude });

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

      if (error?.response?.data?.message) throw new Error(String(error.response.data.message));
      throw new Error(message);
    } finally {
      setDetecting(false);
    }
  }, [reverseGeocodeMutation, userLang]);

  const searchLocations = useCallback(async (query) => {
    setLoading(true);
    try {
      const trimmed = (query || '').trim();
      if (!trimmed || trimmed.length < 2) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        if (activeSearchAbortRef.current) {
          try { activeSearchAbortRef.current.abort(); } catch (e) { /* ignore */ }
          activeSearchAbortRef.current = null;
        }
        setSuggestions([]);
        return;
      }

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      await new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          debounceTimerRef.current = null;
          if (activeSearchAbortRef.current) {
            try { activeSearchAbortRef.current.abort(); } catch (e) { /* ignore */ }
            activeSearchAbortRef.current = null;
          }

          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          if (controller) activeSearchAbortRef.current = controller;

          try {
            const data = await autocompleteMutation.mutateAsync({
              input: trimmed,
              signal: controller?.signal,
            });

            if (Array.isArray(data?.predictions) && data.predictions.length === 0 && data.message) {
              setSuggestions([{ _raw: data, name: String(data.message) }]);
              resolve();
              return;
            }

            const predictions = Array.isArray(data?.predictions) ? data.predictions : [];

            const results = predictions.map((p, idx) => ({
              id: p.placeId || `${p.placeName || 'place'}_${idx}`,
              name: p.placeName || p.name || '',
              countryName: p.countryName || p.country || '',
              placeId: p.placeId,
              _raw: p,
            }));

            setSuggestions(results);
            resolve();
          } catch (err) {
            const isAbort = err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.message === 'canceled';
            if (isAbort) {
              resolve();
              return;
            }

            console.error('Search error (location API failed):', err);
            const backendMsg = err?.response?.data?.message;
            if (backendMsg) {
              setSuggestions([{ _raw: err.response.data, name: String(backendMsg) }]);
            } else {
              setSuggestions([]);
            }
            resolve();
          } finally {
            if (activeSearchAbortRef.current === controller) activeSearchAbortRef.current = null;
          }
        }, debounceMs);
      });
    } finally {
      setLoading(false);
    }
  }, [autocompleteMutation, debounceMs]);

  const clearSuggestions = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (activeSearchAbortRef.current) {
      try { activeSearchAbortRef.current.abort(); } catch (e) { /* ignore */ }
      activeSearchAbortRef.current = null;
    }
    setSuggestions([]);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (activeSearchAbortRef.current) {
        try { activeSearchAbortRef.current.abort(); } catch (e) { /* ignore */ }
        activeSearchAbortRef.current = null;
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    detecting,
    getCurrentLocation,
    searchLocations,
    clearSuggestions,
    getPlaceDetails,
  };
};
