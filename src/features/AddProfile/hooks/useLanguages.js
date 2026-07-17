// src/hooks/useLanguages.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// The S3 list uses ISO 639-1 codes with English names. Rather than maintain a
// translated name per language per locale, we localise the display name at
// runtime with Intl.DisplayNames (keyed on the active i18n language), falling
// back to the English name from S3 for anything the platform can't resolve.
function makeLocaliser(locale) {
  try {
    const dn = new Intl.DisplayNames([locale || 'en'], { type: 'language' });
    return (code, fallback) => {
      try {
        const name = dn.of(code);
        return name && name !== code ? name : fallback;
      } catch {
        return fallback;
      }
    };
  } catch {
    return (_code, fallback) => fallback;
  }
}

/**
 * useLanguages
 * - Fetches a JSON list of languages and normalises + sorts them.
 * - Localises each language name into the active UI locale via Intl.DisplayNames.
 * - Supports aborting the fetch when the component unmounts.
 * - Returns { languagesList, loading, error } and accepts an optional URL.
 */
export default function useLanguages(
  url = 'https://d36zx1g74mcorc.cloudfront.net/website_files/languages/languages.json'
) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;

  const [languagesList, setLanguagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const localise = makeLocaliser(locale);

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('Languages JSON is not an array', data);
          if (mounted) setLanguagesList([]);
          return;
        }

        const normalised = data.map((item, index) => {
          if (typeof item === 'string') return { value: item, label: localise(item, item) };

          const value =
            item.value ||
            item.code ||
            item.shortCode ||
            item.languageCode ||
            `lang-${index}`;

          const englishName =
            item.label || item.name || item.language || item.nativeName || value;

          // `value` is an ISO 639-1 code for the S3 list — localise from that;
          // fall back to the English name for non-standard/custom entries.
          const label = localise(value, englishName);

          return { value, label };
        });

        normalised.sort((a, b) =>
          a.label.localeCompare(b.label, locale || undefined, { sensitivity: 'base' })
        );

        if (mounted) setLanguagesList(normalised);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load languages', err);
          if (mounted) setError(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url, locale]);

  return { languagesList, loading, error };
}


