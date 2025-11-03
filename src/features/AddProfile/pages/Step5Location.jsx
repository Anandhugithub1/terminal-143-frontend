import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/ProfileWizard';
import { ProgressBar } from './ProfileWizard/Progess';
import LocationInput from '../components/LocationInput';
import LocationRangeSelector from '../components/LocationRangeSelector';
import { useTranslation } from 'react-i18next';
import { useLocationService } from '../Hooks/useLocationService';

const Step5Location = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const locationService = useLocationService();

  const [error, setError] = useState('');

  /** Validation Logic */
  const validateForm = () => {
    const { location, geohash } = formData;
    if (!location || !geohash) return t('locationRequired');
    return null;
  };

  /** Next Step Handler */
  const handleNext = () => {
    const validationError = validateForm();
    if (validationError) return setError(validationError);
    setError('');
    navigate('/complete/bio'); // Or whatever the next step is
  };

  /** Previous Step Handler */
  const handleBack = () => {
    navigate('/complete/basic'); // Or whatever the previous step is
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <ProgressBar step={2} totalSteps={2} />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('locationTitle') || 'Location Details'}
        </h2>
        <p className="text-gray-500">
          {t('locationSubtitle') || 'Tell us about your location preferences'}
        </p>
      </header>

      <section className="space-y-6">
        {/* Location Input */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('yourLocation') || 'Your Location'}
          </h3>
          <LocationInput
            formData={formData}
            setFormData={setFormData}
            t={t}
            useLocationService={useLocationService}
          />
        </div>

        {/* Location Range Selector */}
        <LocationRangeSelector
          formData={formData}
          setFormData={setFormData}
          t={t}
        />

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}
      </section>

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all border border-gray-200"
        >
          {t('back') || 'Back'}
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-pink-500/20"
        >
          {t('continue') || 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Step5Location;