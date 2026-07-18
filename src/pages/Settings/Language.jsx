import React, { useState } from 'react';
import { Check } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import '@fontsource-variable/inter';
import i18n from '../../i18n/i18n';
import clsx from 'clsx';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', countryCode: 'US', labelKey: 'languages.english' },
  { code: 'th', countryCode: 'TH', labelKey: 'languages.thai' },
  { code: 'ru', countryCode: 'RU', labelKey: 'languages.russian' },
  { code: 'zh', countryCode: 'CN', labelKey: 'languages.chinese' },
  { code: 'ko', countryCode: 'KR', labelKey: 'languages.korean' },
  { code: 'ms', countryCode: 'MY', labelKey: 'languages.malay' }
];

const LanguagePage = () => {
  const { t } = useTranslation('settings');
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('lang') || 'en');

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    localStorage.setItem('lang', code);
    i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-[100dvh] bg-white font-inter">
      <PageHeader title={t('select_language')} />

      <div className="p-4">
        <nav className="mt-6 space-y-3">
          {LANGUAGES.map(({ code, countryCode, labelKey }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={clsx(
                "flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left",
                selectedLang === code && "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    borderRadius: '50%',
                    boxShadow: '0 0 0.5px rgba(0,0,0,0.3)'
                  }}
                  aria-label={countryCode}
                />
                <span className="text-gray-800 font-medium">{t(labelKey)}</span>
              </div>
              {selectedLang === code && (
                <Check className="text-blue-600" size={20} />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default LanguagePage;
