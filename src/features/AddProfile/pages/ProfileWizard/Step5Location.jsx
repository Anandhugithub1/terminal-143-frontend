import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/ProfileWizard';
import { ProgressBar } from './Progess';
import LocationInput from '../../components/LocationInput';
import LocationRangeSelector from '../../components/LocationRangeSelector';
import { useTranslation } from 'react-i18next';
import { useLocationService } from '../../Hooks/useLocationService';

// Convert raw suggestion into frontend geo shape (minimal)
const toGeo = (r) => {
  if (!r) return { type: 'Point', coordinates: [], placeName: '', countryCode: '', geohash: '' };
  const lon = r.lon ?? r.coordinates?.[0];
  const lat = r.lat ?? r.coordinates?.[1];
  const coords = (typeof lon === 'number' && typeof lat === 'number') ? [lon, lat] : [];
  return {
    type: 'Point',
    coordinates: coords,
    placeName: r.city || r.name || r.placeName || '',
    countryCode: r.countryCode || (r.country ? r.country.toUpperCase() : '') || '',
    geohash: r.geohash || '',
  };
};

const Step5Location = () => {
  const { formData, setFormData } = useWizard();
  const { geoLocation } = formData;
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { getCurrentLocation, detecting, suggestions } = useLocationService();

  const [error, setError] = useState('');

  // central setter used by LocationInput via onSelect
  const setGeo = useCallback(
    (payload) => {
      const next = toGeo(payload);
      setFormData((prev) => ({ ...prev, geoLocation: next }));
    },
    [setFormData]
  );

  const validate = useCallback(
    () => (geoLocation?.coordinates?.length ? null : t('locationRequired') || 'Please select your location'),
    [geoLocation?.coordinates?.length, t]
  );

  const handleNext = useCallback(() => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    navigate('/complete/bio');
  }, [navigate, validate]);

  const handleBack = useCallback(() => navigate('/complete/basic'), [navigate]);

  const handleDetectLocation = useCallback(async () => {
    try {
      const result = await getCurrentLocation();
      if (result) {
        setGeo(result);
        setError('');
      }
    } catch (e) {
      console.error('Location detection failed:', e);
      setError(t('locationDetectError') || 'Unable to detect your location');
    }
  }, [getCurrentLocation, setGeo, t]);

  const effectiveError = useMemo(() => error, [error]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <ProgressBar step={2} totalSteps={5} />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('locationTitle') || 'Location Details'}
        </h2>
        <p className="text-gray-500">{t('locationSubtitle') || 'Tell us about your location preferences'}</p>
      </header>

      <section className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('yourLocation') || 'Your Location'}</h3>
            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              type="button"
            >
              {detecting ? t('detecting') || 'Detecting...' : t('useCurrentLocation') || 'Use Current Location'}
            </button>
          </div>

          <LocationInput
            formData={formData}
            setFormData={setFormData}
            t={t}
            onSelect={setGeo}   // ensures all selections go through setGeo
            suggestions={suggestions}
          />
        </div>

        <LocationRangeSelector formData={formData} setFormData={setFormData} t={t} />

        {effectiveError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">{effectiveError}</p>
          </div>
        )}
      </section>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all border border-gray-200"
          type="button"
        >
          {t('back') || 'Back'}
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-pink-500/20"
          type="button"
        >
          {t('continue') || 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Step5Location;
