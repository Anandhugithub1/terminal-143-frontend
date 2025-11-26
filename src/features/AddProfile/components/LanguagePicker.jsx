// src/components/LanguagePicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

/**
 * LanguagePicker
 * Props:
 * - languagesList: array of { value, label }
 * - loading, error: for remote load state
 * - selected, onChange: controlled selection API (selected = [{value,label}])
 * - placeholder: optional button label when empty
 */
export default function LanguagePicker({
  languagesList = [],
  loading = false,
  error = null,
  selected = [],
  onChange = () => {},
  placeholder = 'Select languages...',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (lang) => {
    const exists = selected.find((l) => l.value === lang.value);
    if (exists) onChange(selected.filter((l) => l.value !== lang.value));
    else onChange([...selected, lang]);
  };

  const filtered = languagesList.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  const label = (() => {
    if (!selected.length) return placeholder;
    if (selected.length <= 2) return selected.map((s) => s.label).join(', ');
    const [first, second, ...rest] = selected;
    return `${first.label}, ${second.label} +${rest.length} more`;
  })();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex w-full justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        <span className={selected.length ? '' : 'text-gray-400'}>{label}</span>
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      </button>

      {!!selected.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((lang) => (
            <span
              key={lang.value}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs border border-pink-100"
            >
              {lang.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(lang);
                }}
                className="focus:outline-none"
                aria-label={`Remove ${lang.label}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              aria-label="Search languages"
            />
          </div>

          <div className="overflow-auto max-h-60" role="listbox" tabIndex={-1}>
            {loading && <div className="px-4 py-3 text-sm text-gray-400">Loading languages...</div>}
            {error && <div className="px-4 py-3 text-sm text-red-500">Failed to load languages.</div>}
            {!loading && filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400">No languages found.</div>
            )}

            {filtered.map((lang, i) => {
              const isSelected = selected.some((l) => l.value === lang.value);
              return (
                <button
                  key={lang.value ?? `lang-${i}`}
                  type="button"
                  onClick={() => toggle(lang)}
                  className={`w-full flex justify-between items-center px-4 py-2 text-left text-sm cursor-pointer ${
                    isSelected ? 'bg-pink-50 text-pink-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{lang.label}</span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-pink-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


