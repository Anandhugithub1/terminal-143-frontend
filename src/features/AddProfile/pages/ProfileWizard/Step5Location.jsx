import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/ProfileWizard';
import { ProgressBar } from './Progess';
import LocationInput from '../../components/LocationInput';
import LocationRangeSelector from '../../components/LocationRangeSelector';
import { useTranslation } from 'react-i18next';
import { useLocationService } from '../../Hooks/useLocationService';
import ngeohash from 'ngeohash';

const toGeo = (r) => {
  if (!r) return { type: 'Point', coordinates: [], city: '', country: '', geoHash: '' };
  const lon = r.lon ?? r.coordinates?.[0];
  const lat = r.lat ?? r.coordinates?.[1];
  return {
    type: 'Point',
    coordinates: [lon, lat],
    city: r.city || r.name || '',
    country: r.country || '',
    geoHash: r.geoHash || (lat != null && lon != null ? ngeohash.encode(lat, lon, 7) : ''),
  };
};

const Step5Location = () => {
  const { formData, setFormData } = useWizard();
  const { geoLocation } = formData;
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { detectLocation, loading, error: locationError } = useLocationService();

  const [error, setError] = useState('');

  const setGeo = useCallback(
    (payload) =>
      setFormData((prev) => ({
        ...prev,
        geoLocation: toGeo(payload),
      })),
    [setFormData]
  );

  const validate = useCallback(
    () =>
      geoLocation?.coordinates?.length
        ? null
        : t('locationRequired') || 'Please select your location',
    [geoLocation?.coordinates?.length, t]
  );

  const handleNext = useCallback(() => {
    const v = validate();
    if (v) return setError(v);
    setError('');
    navigate('/complete/bio');
  }, [navigate, validate]);

  const handleBack = useCallback(() => navigate('/complete/basic'), [navigate]);

  const handleDetectLocation = useCallback(async () => {
    try {
      const result = await detectLocation();
      if (result) {
        setGeo(result);
        setError('');
      }
    } catch (e) {
      console.error('Location detection failed:', e);
      setError(t('locationDetectError') || 'Unable to detect your location');
    }
  }, [detectLocation, setGeo, t]);

  const effectiveError = useMemo(() => error || locationError, [error, locationError]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <ProgressBar step={2} totalSteps={5} />

      {/* Header */}
      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('locationTitle') || 'Location Details'}
        </h2>
        <p className="text-gray-500">
          {t('locationSubtitle') || 'Tell us about your location preferences'}
        </p>
      </header>

      {/* Location Section */}
      <section className="space-y-6">
        {/* Location Input */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('yourLocation') || 'Your Location'}
            </h3>
            <button
              onClick={handleDetectLocation}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              type="button"
            >
              {loading ? t('detecting') || 'Detecting...' : t('useCurrentLocation') || 'Use Current Location'}
            </button>
          </div>

          <LocationInput formData={formData} setFormData={setFormData} t={t} />
        </div>

        {/* Range Selector */}
        <LocationRangeSelector formData={formData} setFormData={setFormData} t={t} />

        {/* Error */}
        {effectiveError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">{effectiveError}</p>
          </div>
        )}
      </section>

      {/* Navigation */}
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
