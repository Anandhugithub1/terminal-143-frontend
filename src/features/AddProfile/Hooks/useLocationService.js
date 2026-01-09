import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { locationAPi } from '../../../api/clients'

export const useLocationService = ({ debounceMs = 300 } = {}) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)

  const userLang = (navigator?.language?.split('-')[0]) || 'en'

  const debounceTimerRef = useRef(null)
  const activeSearchAbortRef = useRef(null)

  const buildLocationObject = (lat, lon, address = {}) => ({
    coordinates: {
      lat,
      lon
    },
    placeName:
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      address.municipality ||
      address.locality ||
      address.name ||
      "",
    countryCode: (address.country_code || address.country || "")
      .toString()
      .toUpperCase()
      .slice(0, 2),
    admin1: address.admin1 || '',
    h3: {
      r4: address.h3Index || ""
    }
  })

  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({ lat, lng }) => {
      try {
        const res = await locationAPi.post(
          "/reverse-geocode",
          { lat, lng },
          {
            withCredentials: true,
            headers: { "Accept-Language": userLang }
          }
        )
        return res.data
      } catch (err) {
        const apiErr = err?.response?.data
        if (apiErr?.code === "OUT_OF_REGION") {
          const e = new Error("OUT_OF_REGION")
          e.code = "OUT_OF_REGION"
          throw e
        }
        throw err
      }
    },
    retry: false
  })

  const autocompleteMutation = useMutation({
    mutationFn: async ({ input, signal }) => {
      const res = await locationAPi.get('/autocomplete', {
        params: { input },
        withCredentials: true,
        signal,
        headers: { 'Accept-Language': userLang },
      })
      return res?.data || {}
    },
    retry: 0,
    useErrorBoundary: false,
  })

  const getPlaceDetails = useCallback(async (placeId) => {
    if (!placeId) return null
    try {
      const res = await locationAPi.get('/place-details', {
        params: { placeId },
        withCredentials: true,
        headers: { 'Accept-Language': userLang },
      })

      const d = res?.data || null
      if (!d) return null

      return {
        lat: d.lat,
        lng: d.lng,
        placeName: d.placeName || d.formattedAddress || '',
        country: d.country || '',
        countryCode: d.countryCode || '',
        admin1: d.admin1 || "",
        h3Index: d.h3Index || '',
        formattedAddress: d.formattedAddress || '',
        types: d.types || [],
      }
    } catch (err) {
      console.warn('getPlaceDetails failed', err)
      return null
    }
  }, [userLang])

  const getCurrentLocation = useCallback(async () => {
    setDetecting(true)
    try {
      if (!navigator?.geolocation) throw new Error('geolocationNotSupported')

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      )

      const { latitude, longitude } = position.coords
      const data = await reverseGeocodeMutation.mutateAsync({
        lat: latitude,
        lng: longitude
      })

      const address = {
        city: data.placeName || '',
        country: data.country || '',
        country_code: data.countryCode || data.country_code || '',
        name: data.placeName || '',
        admin1: data.admin1 || '',
        h3Index: data.h3Index || '',
      }

      return buildLocationObject(latitude, longitude, address)
    } catch (error) {
      console.error('Location error:', error)

      if (error?.code === "OUT_OF_REGION") {
        throw error
      }

      let message = 'geoError'

      if (error?.code === 1) message = 'locationPermissionDenied'
      else if (error?.code === 2) message = 'locationUnavailable'
      else if (error?.code === 3) message = 'locationTimeout'
      else if (error?.message === 'geolocationNotSupported') message = 'geoNotSupported'

      throw new Error(message)
    } finally {
      setDetecting(false)
    }
  }, [reverseGeocodeMutation, userLang])

  const clearSuggestions = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (activeSearchAbortRef.current) {
      try { activeSearchAbortRef.current.abort() } catch {}
      activeSearchAbortRef.current = null
    }
    setSuggestions([])
  }, [])

  const searchLocations = useCallback((query) => {
    const trimmed = (query || "").trim()

    return new Promise((resolve, reject) => {
      if (!trimmed || trimmed.length < 2) {
        clearSuggestions()
        resolve()
        return
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        setLoading(true)

        try {
          if (activeSearchAbortRef.current) {
            activeSearchAbortRef.current.abort()
          }

          const controller = new AbortController()
          activeSearchAbortRef.current = controller

          const data = await autocompleteMutation.mutateAsync({
            input: trimmed,
            signal: controller.signal
          })

          if (
            data?.message &&
            (!Array.isArray(data?.predictions) ||
              data.predictions.length === 0)
          ) {
            setSuggestions([])
            reject(new Error(data.message))
            return
          }

          const predictions = Array.isArray(data?.predictions)
            ? data.predictions
            : []

          setSuggestions(
            predictions.map((p, idx) => ({
              id: p.placeId || `${idx}`,
              name: p.placeName || "",
              country: p.country || "",
              placeId: p.placeId,
              h3Index: p.h3Index || "",
              _raw: p
            }))
          )

          resolve()
        } catch (err) {
          if (err?.name === "AbortError") {
            resolve()
            return
          }

          setSuggestions([])
          reject(err)
        } finally {
          setLoading(false)
        }
      }, debounceMs)
    })
  }, [autocompleteMutation, debounceMs, clearSuggestions])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      if (activeSearchAbortRef.current) {
        try { activeSearchAbortRef.current.abort() } catch {}
        activeSearchAbortRef.current = null
      }
    }
  }, [])

  return {
    suggestions,
    loading,
    detecting,
    getCurrentLocation,
    searchLocations,
    clearSuggestions,
    getPlaceDetails,
  }
}
