// useLocationService.js
import { useState, useRef, useCallback, useEffect } from 'react';
import ngeohash from 'ngeohash';
import { useMutation } from '@tanstack/react-query';
import { locationAPi } from '../../../api/clients';

/**
 * useLocationService
 * Production-ready location helper hook supporting:
 * - getCurrentLocation (reverse geocode via backend)
 * - searchLocations (debounced autocomplete with cancellation)
 *
 * Suggestions returned have the shape:
 *  { id?: string, name: string, countryName?: string, placeId?: string, _raw?: any }
 */
export const useLocationService = ({ debounceMs = 300 } = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const userLang = (navigator?.language?.split('-')[0]) || 'en';

  // debounce + abort support:
  const debounceTimerRef = useRef(null);
  const activeSearchAbortRef = useRef(null);

  // Build a location object that matches backend User.location
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
    countryCode: (address.country_code || address.country || '').toString().toUpperCase().slice(0, 2),
    geohash: (lat != null && lon != null) ? ngeohash.encode(lat, lon, 7) : '',
  });

  /**
   * React Query mutations (explicit mutationFn to avoid "No mutationFn found")
   * Using mutation objects so hook won't break if signature expectations differ.
   */
  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({ lat, lng }) => {
      // include Accept-Language header to hint backend about user language if supported
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
      // axios supports AbortController signal in recent versions: { signal }
      const res = await locationAPi.get('/autocomplete', {
        params: { input },
        withCredentials: true,
        // pass the signal so request can be cancelled
        signal,
        headers: { 'Accept-Language': userLang },
      });
      return res?.data || {};
    },
    retry: 0,
    useErrorBoundary: false,
  });

  /** Get current location (reverse geocode via backend) */
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

      // Use react-query mutation to call the backend
      const data = await reverseGeocodeMutation.mutateAsync({ lat: latitude, lng: longitude });

      const address = {
        city: data.placeName || '',
        country: data.country || '',
        country_code: data.countryCode || data.country_code || '',
        name: data.placeName || '',
      };

      return buildLocationObject(latitude, longitude, address);
    } catch (error) {
      // Normalize errors to strings the UI can consume
      console.error('Location error:', error);

      // Browser geolocation codes: 1=PERMISSION_DENIED,2=POSITION_UNAVAILABLE,3=TIMEOUT
      let message = 'geoError';
      if (error?.code === 1) message = 'locationPermissionDenied';
      else if (error?.code === 2) message = 'locationUnavailable';
      else if (error?.code === 3) message = 'locationTimeout';
      else if (error?.message === 'geolocationNotSupported') message = 'geoNotSupported';
      else if (error?.response?.data?.code === 'OUT_OF_REGION') message = 'locationOutOfRegion';

      // If backend sent a human message (e.g. out-of-region), prefer that
      if (error?.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }

      throw new Error(message);
    } finally {
      setDetecting(false);
    }
  }, [reverseGeocodeMutation, userLang]);

  /**
   * searchLocations - debounced, abortable autocomplete
   * - query: user's input string
   *
   * Sets `suggestions` state with normalized items. If backend returns
   * special out-of-region JSON:
   *   { predictions: [], message: "Sorry, this app ... region." }
   * we place that response at suggestions[0] as `{ _raw: data, name: data.message }`
   */
  const searchLocations = useCallback(async (query) => {
    setLoading(true);

    try {
      const trimmed = (query || '').trim();
      if (!trimmed || trimmed.length < 2) {
        // clear any pending timers and abort any in-progress request
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

      // Debounce: cancel previous timer
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      // Return a promise that resolves when the debounced call finishes
      await new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          debounceTimerRef.current = null;

          // Abort previous in-flight network request
          if (activeSearchAbortRef.current) {
            try { activeSearchAbortRef.current.abort(); } catch (e) { /* ignore */ }
            activeSearchAbortRef.current = null;
          }

          // Create a fresh AbortController for axios
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          if (controller) activeSearchAbortRef.current = controller;

          try {
            // Use react-query mutation with explicit signal for cancellation
            const data = await autocompleteMutation.mutateAsync({
              input: trimmed,
              signal: controller?.signal,
            });

            // Special-case unsupported region response
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
            // If cancelled, do nothing (not an error)
            const isAbort = err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.message === 'canceled';
            if (isAbort) {
              // keep previous suggestions and treat as non-fatal
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
            // cleanup controller
            if (activeSearchAbortRef.current === controller) activeSearchAbortRef.current = null;
          }
        }, debounceMs);
      });
    } finally {
      // ensure loading is cleared after the debounced attempt finishes
      // small delay to avoid UI flicker
      setLoading(false);
    }
  }, [autocompleteMutation, debounceMs]);

  const clearSuggestions = useCallback(() => {
    // cancel timers and abort in-flight
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

  // cleanup on unmount
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
  };
};
