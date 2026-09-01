import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

// Country codes the app is not available in yet. ISO 3166-1 alpha-2.
const BLOCKED_COUNTRIES = ['IN']

// The Android native app is exempt from the region gate: Indian (and any other
// BLOCKED_COUNTRIES) users on the Android app are allowed through. The gate
// still applies on web and any other platform.
const REGION_GATE_EXEMPT = Capacitor.getPlatform() === 'android'

const IPINFO_TOKEN = import.meta.env.VITE_IPINFO_TOKEN
const CACHE_KEY = 'regionGate.countryCode'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function readCache() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (raw && Date.now() - raw.checkedAt < CACHE_TTL_MS) return raw.countryCode
  } catch {
    // ignore malformed cache
  }
  return null
}

function writeCache(countryCode) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ countryCode, checkedAt: Date.now() }))
  } catch {
    // storage unavailable — just skip caching
  }
}

async function lookupCountry() {
  const url = `https://api.ipinfo.io/lite/me?token=${IPINFO_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`region lookup failed: ${res.status}`)
  const data = await res.json()
  return data.country_code || null
}

// Client-side region gate: resolves the visitor's country from their IP and
// flags whether the app should show the "not available" screen instead of
// its normal routes. Best-effort only — a failed/slow lookup never blocks
// access, it just lets the app through.
export function useRegionGate() {
  const [blocked, setBlocked] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Android native app is exempt — never block, and skip the IP lookup
    // entirely. (Web and other platforms still go through the gate below.)
    if (REGION_GATE_EXEMPT) {
      setBlocked(false)
      setChecked(true)
      return
    }

    // Dev-only: import.meta.env.DEV is a build-time constant, so this
    // branch is stripped from production bundles — it cannot be toggled
    // at runtime or leak into prod.
    if (import.meta.env.DEV) {
      setBlocked(false)
      setChecked(true)
      return
    }

    let cancelled = false

    const cached = readCache()
    if (cached) {
      setBlocked(BLOCKED_COUNTRIES.includes(cached))
      setChecked(true)
      return
    }

    lookupCountry()
      .then((countryCode) => {
        if (cancelled) return
        if (countryCode) writeCache(countryCode)
        setBlocked(BLOCKED_COUNTRIES.includes(countryCode))
      })
      .catch(() => {
        // Lookup failed (rate limit, network, blocked request) — fail open.
      })
      .finally(() => {
        if (!cancelled) setChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { blocked, checked }
}
