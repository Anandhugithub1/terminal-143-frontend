// src/hooks/useLanguages.js
import { useState, useEffect } from 'react';

/**
 * useLanguages
 * - Fetches a JSON list of languages and normalises + sorts them.
 * - Supports aborting the fetch when the component unmounts.
 * - Returns { languagesList, loading, error } and accepts an optional URL.
 */
export default function useLanguages(
  url = 'https://d36zx1g74mcorc.cloudfront.net/website_files/languages/languages.json'
) {
  const [languagesList, setLanguagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

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
          if (typeof item === 'string') return { value: item, label: item };

          const value =
            item.value ||
            item.code ||
            item.shortCode ||
            item.languageCode ||
            `lang-${index}`;

          const label =
            item.label || item.name || item.language || item.nativeName || value;

          return { value, label };
        });

        normalised.sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
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
  }, [url]);

  return { languagesList, loading, error };
}


