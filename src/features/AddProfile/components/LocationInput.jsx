import { useState, useEffect, useCallback, useRef } from 'react';
import ngeohash from 'ngeohash';

const LocationInput = ({ formData, setFormData, t, useLocationService }) => {
  const [query, setQuery] = useState(formData.location || '');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { suggestions, loading, detecting, getCurrentLocation, searchLocations, clearSuggestions } =
    useLocationService();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      setHasInteracted(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        const trimmed = value.trim();
        if (!trimmed) {
          clearSuggestions();
          setFormData((p) => ({ ...p, location: '', geohash: '' }));
          setError('');
        } else if (trimmed.length > 1) {
          searchLocations(trimmed, navigator.language.split('-')[0]);
        } else {
          clearSuggestions();
          setError(t('locationMinLength') || 'Enter at least 2 characters');
        }
      }, 400);
    },
    [searchLocations, clearSuggestions, setFormData, t]
  );

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

 const handleSelect = useCallback(
  (loc) => {
    setFormData((p) => ({
      ...p,
      location: loc.name, // loc.name is already in user’s language
      geohash: ngeohash.encode(loc.lat, loc.lon, 7),
    }));
    setQuery(loc.name);
    clearSuggestions();
    setError('');
    setFocused(false);
    setHasInteracted(false);
  },
  [setFormData, clearSuggestions]
);


  const handleAutoDetect = async () => {
    setError('');
    setHasInteracted(true);
    try {
      const { place, geohash } = await getCurrentLocation(navigator.language.split('-')[0]);
      setFormData((p) => ({ ...p, location: place, geohash }));
      setQuery(place);
      setFocused(false);
    } catch (err) {
      setError(t(err.message));
    }
  };

  const handleClear = () => {
    setQuery('');
    setFormData((p) => ({ ...p, location: '', geohash: '' }));
    setError('');
    clearSuggestions();
    inputRef.current?.focus();
  };

  const showError = error && hasInteracted;
  const showSuccess = formData.location && !loading && !error;
  const showHelper = !formData.location && !error && !loading && !hasInteracted;

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t('location')}
        <span className="text-gray-400 font-normal text-xs ml-1">{t('locationHelper') || 'City or area where you live'}</span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={t('typeOrSearchLocation') || 'Search for your city or area...'}
            className={`w-full p-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder-gray-400 ${
              showError ? 'border-red-300 ring-2 ring-red-100' : showSuccess ? 'border-green-300' : 'border-gray-200'
            }`}
            aria-invalid={!!showError}
            aria-describedby={showError ? 'location-error' : showSuccess ? 'location-success' : 'location-help'}
          />
          {loading && <div className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />}
          {query && !loading && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition" aria-label="Clear location">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            detecting ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
          }`}
        >
          {detecting ? (
            <>
              <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              {t('detecting')}
            </>
          ) : (
            <>
              <span className="text-lg"></span>
              {t('useMyCurrentLocation')}
            </>
          )}
        </button>
      </div>

      {focused && suggestions.length > 0 && (
        <div ref={dropdownRef} className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-fadeIn">
          {suggestions.map((item, idx) => (
            <button key={`${item.name}-${idx}-${item.lat}-${item.lon}`} onClick={() => handleSelect(item)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0 focus:outline-none focus:bg-gray-50">
              <div className="font-medium text-gray-900">{item.name}</div>
              {item.country && <div className="text-xs text-gray-500 mt-0.5">{item.country}</div>}
            </button>
          ))}
        </div>
      )}

      {showSuccess && (
        <div id="location-success" className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 mt-1 animate-fadeIn">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Selected: <strong>{formData.location}</strong></span>
        </div>
      )}

      {showError && (
        <div id="location-error" className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 mt-1 animate-fadeIn">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {showHelper && (
        <p id="location-help" className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('locationHelpText') || 'Start typing or use auto-detect'}
        </p>
      )}

      {focused && suggestions.length === 0 && query.length > 1 && !loading && (
        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-xl mt-1">No locations found. Try a different search term.</div>
      )}
    </div>
  );
};

export default LocationInput;
