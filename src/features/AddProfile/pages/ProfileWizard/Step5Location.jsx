import { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../contexts/ProfileWizard'
import { ProgressBar } from './Progess'
import { useTranslation } from 'react-i18next'
import { Button } from "../../../../shared/Button"

// Lazy-loaded components (OWN their heavy deps)
const LocationInput = lazy(() =>
  import('../../components/LocationInput')
)
const LocationRangeSelector = lazy(() =>
  import('../../components/Location/LocationRangeSelector')
)

// Convert raw suggestion / details into frontend geo shape (minimal)
const toGeo = (r) => {
  if (!r) {
    return {
      type: 'Point',
      coordinates: [],
      placeName: '',
      countryCode: '',
      h3Index: '',
    }
  }

  const lon = r.lon ?? r.coordinates?.[0]
  const lat = r.lat ?? r.coordinates?.[1]
  const coords =
    typeof lon === 'number' && typeof lat === 'number'
      ? [lon, lat]
      : []

  return {
    type: 'Point',
    coordinates: coords,
    placeName: r.placeName || r.city || r.name || '',
    countryCode: (r.countryCode || r.country || '')
      .toString()
      .toUpperCase()
      .slice(0, 2),
    h3Index: r.h3Index || '',
  }
}

const Step5Location = () => {
  const { formData, setFormData } = useWizard()
  const { geoLocation } = formData
  const navigate = useNavigate()
  const { t } = useTranslation('location')

  const [error, setError] = useState('')

  // central setter used by LocationInput via onSelect
  const setGeo = useCallback(
    (payload) => {
      const next = toGeo(payload)
      setFormData((prev) => ({ ...prev, geoLocation: next }))
    },
    [setFormData]
  )

  const validate = useCallback(
    () =>
      geoLocation?.coordinates?.length
        ? null
        : t('locationRequired') || 'Please select your location',
    [geoLocation?.coordinates?.length, t]
  )

  const handleNext = useCallback(() => {
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    navigate('/complete/bio')
  }, [navigate, validate])

  const handleBack = useCallback(
    () => navigate('/complete/basic'),
    [navigate]
  )

  const effectiveError = useMemo(() => error, [error])

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <ProgressBar step={2} totalSteps={5} />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('locationTitle') || 'Location Details'}
        </h2>
        <p className="text-gray-500">
          {t('locationSubtitle') || 'Tell us about your location preferences'}
        </p>
      </header>

      <section className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('yourLocation') || 'Your Location'}
            </h3>
          </div>

          <Suspense fallback={null}>
            <LocationInput
              formData={formData}
              setFormData={setFormData}
              t={t}
              onSelect={setGeo}
            />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <LocationRangeSelector
            formData={formData}
            setFormData={setFormData}
            t={t}
          />
        </Suspense>

        {effectiveError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">
              {effectiveError}
            </p>
          </div>
        )}
      </section>

      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleBack}
          textColor="black"
          className="flex-1 py-3 border border-gray-200 bg-white"
          type="button"
        >
          {t('back') || 'Back'}
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 text-white font-semibold py-4 rounded-3xl transition-all hover:scale-[1.01] shadow-lg shadow-pink-500/20"
          type="button"
        >
          {t('continue') || 'Continue'}
        </Button>
      </div>
    </div>
  )
}

export default Step5Location
