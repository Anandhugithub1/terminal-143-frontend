import { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../contexts/ProfileWizard'
import { ProgressBar } from './Progess'
import { useTranslation } from 'react-i18next'
import { Button } from "../../../../shared/Button"

const LocationInput = lazy(() =>
  import('../../components/LocationInput')
)
const LocationRangeSelector = lazy(() =>
  import('../../components/Location/LocationRangeSelector')
)

const Location = () => {
  const { formData, setFormData } = useWizard()
  const { location } = formData
  const navigate = useNavigate()
  const { t } = useTranslation('location')

  const [error, setError] = useState('')

  // ✅ FIXED: normalize payload correctly
  const setGeo = useCallback(
    (payload) => {
      if (!payload) {
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: { lat: null, lon: null },
            placeName: "",
            countryCode: "",
            h3: { r4: "" }
          }
        }))
        return
      }

      const lat = payload.lat ?? payload.coordinates?.lat
      const lon = payload.lng ?? payload.lon ?? payload.coordinates?.lon

      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: {
            lat,
            lon
          },
          placeName: payload.placeName || payload.name || "",
          countryCode: (payload.countryCode || payload.country || "")
            .toString()
            .toUpperCase()
            .slice(0, 2),
          h3: {
            r4: payload.h3Index || ""
          }
        }
      }))
    },
    [setFormData]
  )

  const validate = useCallback(
    () =>
      location?.coordinates?.lat != null &&
      location?.coordinates?.lon != null
        ? null
        : t("locationRequired") || "Please select your location",
    [location, t]
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('yourLocation') || 'Your Location'}
          </h3>

          <Suspense fallback={null}>
            <LocationInput
              formData={{ location }}
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
            <p className="text-red-600">
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
          className="flex-1 text-white font-semibold py-4 rounded-3xl transition-all"
          type="button"
        >
          {t('continue') || 'Continue'}
        </Button>
      </div>
    </div>
  )
}

export default Location
